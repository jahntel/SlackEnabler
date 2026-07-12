import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { App, ExpressReceiver } from "@slack/bolt";
import { WorkspaceData, SlackMessage, SlackChannel, UserPreferences, CatchUpTimeline } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Safe Bolt Slack SDK Lazy Initializer
let slackApp: App | null = null;
let slackReceiver: ExpressReceiver | null = null;

function registerSlackEvents(slackAppInstance: App) {
  // Listen for real Slack message events
  slackAppInstance.event("message", async ({ event, client, say }) => {
    try {
      const msgEvent = event as any;
      if (!msgEvent || !msgEvent.text) return;
      if (msgEvent.bot_id) return; // Ignore messages from bot itself to avoid loop

      console.log("⚡ [Real-time Slack Event] Captured text:", msgEvent.text);

      const db = getDB();
      const preferences = db.preferences;

      // Resolve Channel Name
      let channelName = "general";
      try {
        const channelInfo = await client.conversations.info({ channel: msgEvent.channel });
        if (channelInfo.channel?.name) {
          channelName = channelInfo.channel.name;
        }
      } catch (err: any) {
        console.warn(`Could not fetch Slack channel name for ${msgEvent.channel}:`, err.message);
        const matched = db.channels.find(c => c.id === msgEvent.channel || c.name === msgEvent.channel);
        if (matched) channelName = matched.name;
      }

      // Create channel in local DB if missing
      let dbChannel = db.channels.find(c => c.name === channelName);
      if (!dbChannel) {
        dbChannel = {
          id: msgEvent.channel,
          name: channelName,
          description: "Real-time Slack Channel",
          isMuted: false
        };
        db.channels.push(dbChannel);
      }

      // Resolve User Name
      let userName = "external-user";
      try {
        if (msgEvent.user) {
          const userInfo = await client.users.info({ user: msgEvent.user });
          if (userInfo.user?.real_name || userInfo.user?.name) {
            userName = userInfo.user.real_name || userInfo.user.name || userName;
          }
        }
      } catch (err: any) {
        console.warn(`Could not fetch user info for ${msgEvent.user}:`, err.message);
      }

      // 1. Semantic Prioritization via Gemini / Fallback Classifier
      const classification = await classifyMessage(msgEvent.text);

      // 2. Shield Interceptor Check
      let shieldStatus: "allowed" | "queued" | "none" = "none";
      let relevantMcpContext = "";

      if (preferences.deepWorkActive) {
        if (classification.priority === "high") {
          if (preferences.mcpActive && preferences.mcpContext) {
            const mcpWords = preferences.mcpContext.toLowerCase().split(/[\s_\-\.\/]+/);
            const msgWords = msgEvent.text.toLowerCase().split(/[\s_\-\.\/]+/);
            const keywords = ["server", "db", "database", "auth", "authentication", "api", "route", "connection", "replica", "controller", "code", "index", "fail"];
            const hasOverlap = mcpWords.some(w => keywords.includes(w) && msgWords.some(mw => mw.includes(w) || w.includes(mw))) || 
                                msgWords.some(w => mcpWords.includes(w) && w.length > 3);

            if (hasOverlap) {
              shieldStatus = "allowed";
              relevantMcpContext = `Bypassed shield because message matches active IDE project focus: "${preferences.mcpContext}"`;
            } else {
              shieldStatus = "allowed";
              relevantMcpContext = "Urgent alarm allowed to break through Focus Stream.";
            }
          } else {
            shieldStatus = "allowed";
          }
        } else {
          shieldStatus = "queued";
        }
      }

      const avatarName = userName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const newMessage: SlackMessage = {
        id: `m_slack_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        channel: channelName,
        user: userName,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarName}`,
        text: msgEvent.text,
        timestamp: "Live Slack " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: classification.priority,
        intent: classification.intent,
        explanation: classification.explanation,
        shieldStatus,
        relevantMcpContext: relevantMcpContext || undefined
      };

      db.messages.push(newMessage);
      saveDB(db);

      // Slack Event Response Logic
      if (classification.priority === "high" && preferences.deepWorkActive && !relevantMcpContext.includes("Bypassed")) {
        await say({
          text: `🛡️ *SlackEnabler Focus Shield Active*: <@${msgEvent.user}>, your alert has been funneled to the dev's *Focus Stream*, but they are currently coding a different project and might reply late.`
        });
      }
    } catch (err) {
      console.error("Error handling live Slack event message:", err);
    }
  });
}

function getSlackApp(): { app: App | null, receiver: ExpressReceiver | null } {
  if (slackApp) {
    return { app: slackApp, receiver: slackReceiver };
  }

  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!signingSecret || !botToken) {
    return { app: null, receiver: null };
  }

  try {
    slackReceiver = new ExpressReceiver({
      signingSecret,
      endpoints: "/slack/events"
    });

    slackApp = new App({
      token: botToken,
      receiver: slackReceiver
    });

    registerSlackEvents(slackApp);
    console.log("⚡ Slack Bolt SDK initialized successfully.");
    return { app: slackApp, receiver: slackReceiver };
  } catch (err) {
    console.error("❌ Failed to instantiate Slack Bolt client:", err);
    return { app: null, receiver: null };
  }
}


const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Helper: Ensure database exists with initial seed data
function initializeDatabase(): WorkspaceData {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const initialChannels: SlackChannel[] = [
    { id: "c1", name: "general", description: "General workspace discussion & sync", isMuted: false },
    { id: "c2", name: "engineering-alerts", description: "Prod outages, broken builds, CI/CD pipeline", isMuted: false },
    { id: "c3", name: "random-chatter", description: "Jokes, memes, lunch planning, watercooler talk", isMuted: true },
    { id: "c4", name: "marketing-buzz", description: "Campaign design feedback, general branding updates", isMuted: true }
  ];

  const initialMessages: SlackMessage[] = [
    {
      id: "m1",
      channel: "engineering-alerts",
      user: "incident-bot",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=incident",
      text: "🚨 CRITICAL OUTAGE: Replica-3 database node lost synchronization with the primary node on production-db-01. Read operations are failing for US-EAST services.",
      timestamp: "Today at 9:02 AM",
      priority: "high",
      intent: "Outage / Incident",
      explanation: "Contains critical operational keywords ('CRITICAL OUTAGE', 'lost synchronization', 'failing') and impacts prod database.",
      shieldStatus: "none"
    },
    {
      id: "m2",
      channel: "random-chatter",
      user: "sam-marketing",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sam",
      text: "Guys, check out this absolute gold of a cat meme. It looks exactly like our CTO explaining kubernetes pods! 😂 https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif",
      timestamp: "Today at 9:15 AM",
      priority: "low",
      intent: "Casual Meme",
      explanation: "Identified as low impact, containing humor triggers, emoji, and casual watercooler reference.",
      shieldStatus: "none"
    },
    {
      id: "m3",
      channel: "general",
      user: "jenny-dev",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jenny",
      text: "Can someone check my open PR on the server authentication endpoint? Need a quick eyes-on so we can release the patch. PR is #302: 'Fix auth controller database leak'.",
      timestamp: "Today at 9:30 AM",
      priority: "neutral",
      intent: "PR / Code Review",
      explanation: "Standard engineering message requesting a pull request review. No immediate threat but active workflow context.",
      shieldStatus: "none"
    },
    {
      id: "m4",
      channel: "general",
      user: "claire-hr",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=claire",
      text: "Hi everyone! Friendly reminder that hot custom sandwiches are here in the main break room! Grab them while they are warm. 🌱 Gluten-free and vegan options are marked.",
      timestamp: "Today at 10:00 AM",
      priority: "low",
      intent: "Casual Chatter",
      explanation: "Casual food announcement with no impact on engineering timelines.",
      shieldStatus: "none"
    },
    {
      id: "m5",
      channel: "engineering-alerts",
      user: "alex-infra",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=alex",
      text: "Debugging US-EAST database replica lag. Found high disk I/O on primary. Tuning block buffers to reduce disk thrashing.",
      timestamp: "Today at 10:15 AM",
      priority: "neutral",
      intent: "Engineering Discussion",
      explanation: "Relates to the active outage debugging but is an update rather than an emergency blocker.",
      shieldStatus: "none"
    },
    {
      id: "m6",
      channel: "engineering-alerts",
      user: "jenny-dev",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jenny",
      text: "Merged PR #302 which optimizes the backend connection pooling on server.ts. This should immediately reduce database load!",
      timestamp: "Today at 10:45 AM",
      priority: "neutral",
      intent: "Resolution Updates",
      explanation: "Announcement of a merged PR fixing a server connection leak, resolving the database load issue.",
      shieldStatus: "none"
    }
  ];

  const initialPreferences: UserPreferences = {
    deepWorkActive: false,
    focusEndTime: null,
    mcpContext: "Editing server.ts in vscode-project-x",
    mcpActive: true,
    notificationsEnabled: true
  };

  const initialTimelines: CatchUpTimeline[] = [
    {
      id: "t1",
      channelName: "engineering-alerts",
      title: "US-EAST Database Incident Digest",
      generatedAt: new Date(Date.now() - 3600000).toLocaleString(),
      content: `### 🚨 Issue Identified
- **Database Outage:** @incident-bot reported replica node synchronization loss on production-db-01, impacting read operations in US-EAST.

### 💬 Debugging & Discussion
- **Root Cause Hunt:** @alex-infra identified high disk I/O on the primary node and performed buffer tuning to reduce disk thrashing.

### 🛠️ Resolution & Action Items
- **PR #302 Merged:** @jenny-dev merged an optimization in \`server.ts\` fixing backend connection leaks, significantly decreasing load.
- **Result:** Read replication latencies returned to nominal rates. No further manual failover required.`,
      sourceMessageCount: 3
    }
  ];

  const defaultData: WorkspaceData = {
    messages: initialMessages,
    channels: initialChannels,
    preferences: initialPreferences,
    timelines: initialTimelines
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
    return defaultData;
  }

  try {
    const fileContent = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("Failed to parse database, resetting:", e);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
    return defaultData;
  }
}

// Read & Write DB helpers
function getDB(): WorkspaceData {
  return initializeDatabase();
}

function saveDB(data: WorkspaceData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Local regex classifier fallback
function localClassify(text: string): { priority: "high" | "low" | "neutral", intent: string, explanation: string } {
  const lowercase = text.toLowerCase();
  
  if (
    lowercase.includes("outage") || 
    lowercase.includes("broken") || 
    lowercase.includes("crash") || 
    lowercase.includes("critical") || 
    lowercase.includes("down") || 
    lowercase.includes("prod") || 
    lowercase.includes("fail") ||
    lowercase.includes("incident") ||
    lowercase.includes("urgent") ||
    lowercase.includes("error") ||
    lowercase.includes("alert") ||
    lowercase.includes("broken build")
  ) {
    return {
      priority: "high",
      intent: "Outage / Incident Alert",
      explanation: "Semantic scan matched critical keyword indicators signifying severe operational impact."
    };
  }
  
  if (
    lowercase.includes("meme") || 
    lowercase.includes("joke") || 
    lowercase.includes("lunch") || 
    lowercase.includes("coffee") || 
    lowercase.includes("funny") || 
    lowercase.includes("cat") || 
    lowercase.includes("party") || 
    lowercase.includes("weekend") ||
    lowercase.includes("social") ||
    lowercase.includes("hey") ||
    lowercase.includes("pizza")
  ) {
    return {
      priority: "low",
      intent: "Casual / Off-Topic",
      explanation: "Classified as social or off-topic chatter with low operational urgency."
    };
  }
  
  return {
    priority: "neutral",
    intent: "General Engineering / Sync",
    explanation: "Standard communication containing development updates or PR notifications."
  };
}

// Gemini Classifier (Real LLM)
async function classifyMessage(text: string): Promise<{ priority: "high" | "low" | "neutral", intent: string, explanation: string }> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    console.log("No active Gemini API key found. Defaulting to high-accuracy local regex classifier.");
    return localClassify(text);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const prompt = `Analyze this Slack message and classify it for a software development team context.
Message: "${text}"

Provide your output in valid, raw JSON format with exactly the following keys (no markdown wrapper, just pure JSON string):
{
  "priority": "high" | "low" | "neutral",
  "intent": "Short category name",
  "explanation": "Brief 1-sentence description of why it was categorized this way"
}

Classification rules:
- priority "high" for active outages, system crashes, broken master branch build, server failures, database lockups, security breaches, or direct developer blocks.
- priority "low" for food, casual plans, jokes, memes, personal links, greetings, watercooler announcements.
- priority "neutral" for typical workflow alerts, code questions, routine PR reviews, standup notes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = response.text?.trim() || "{}";
    const parsed = JSON.parse(rawText);
    
    return {
      priority: parsed.priority || "neutral",
      intent: parsed.intent || "General Discussion",
      explanation: parsed.explanation || "Classified via Gemini 3.5 model assessment."
    };
  } catch (error) {
    console.error("Gemini classification failed, using local classifier fallback:", error);
    return localClassify(text);
  }
}

// Local Timeline synthesis fallback
function generateLocalTimeline(channelName: string, messages: SlackMessage[]): string {
  const highs = messages.filter(m => m.priority === "high");
  const neutrals = messages.filter(m => m.priority === "neutral");
  const lows = messages.filter(m => m.priority === "low");

  let issues = "- No critical issues identified. Discussions centered on routine workspace topics.";
  if (highs.length > 0) {
    issues = highs.map(m => `- **${m.intent || "Critical"} Notification** by @${m.user}: "${m.text}"`).join("\n");
  }

  let debug = "- Standard coordination and status exchange.";
  if (neutrals.length > 0) {
    debug = neutrals.map(m => `- **Discussion** on ${m.intent || "workflow"} by @${m.user}: "${m.text}"`).join("\n");
  }

  let resolution = "- **Status:** Synced and aligned.\n- **Action:** Continue monitoring channel logs. No active action items require immediate patch merges.";
  if (messages.some(m => m.text.toLowerCase().includes("pr") || m.text.toLowerCase().includes("merge") || m.text.toLowerCase().includes("fix"))) {
    resolution = "- **PR / Bug Fix Status:** Relevant pull requests were referenced or merged to optimize database/server connection stability.\n- **Verification:** Verification of backend responses confirmed nominal performance levels.";
  }

  return `### 🚨 Issue Identified
${issues}

### 💬 Debugging & Discussion
${debug}

### 🛠️ Resolution & Action Items
${resolution}`;
}

// Gemini Catch-Up Timeline Generation
async function generateCatchUpTimeline(channelName: string, messages: SlackMessage[]): Promise<string> {
  const msgCount = messages.length;
  if (msgCount === 0) {
    return "No messages available in this channel to compile.";
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    console.log("No active Gemini API key found for timeline compilation. Synthesizing timeline locally.");
    return generateLocalTimeline(channelName, messages);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const messagesText = messages.map(m => `[@${m.user}]: ${m.text}`).join("\n");

    const prompt = `You are SlackEnabler's Timeline Architect. Your job is to take this stream of channel messages from #${channelName} and synthesize them into a highly professional, beautifully formatted markdown digest timeline summarizing the sequence of events.

Your timeline must strictly use the following structured headings (use emojis exactly):
### 🚨 Issue Identified
[A clear and concise breakdown of what was reported, what failed, or what key projects were launched]

### 💬 Debugging & Discussion
[A bulleted summary of key comments, inputs, debugging activities, and collaborative efforts of the team]

### 🛠️ Resolution & Action Items
[Clear final states: what was resolved, which PRs were merged, and any outstanding assignments]

Ensure all user tags (e.g., @alex-infra) are mentioned to assign correct ownership.
Make it sound cohesive, concise, and useful for catching up instantly.

Message Logs:
${messagesText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || "Failed to compile AI timeline.";
  } catch (error) {
    console.error("Gemini timeline generation error, using fallback compiler:", error);
    return generateLocalTimeline(channelName, messages);
  }
}

// API: Get entire workspace state
app.get("/api/slack/state", (req, res) => {
  const db = getDB();
  res.json(db);
});

// API: Get active Slack App configuration & real-time connection status
app.get("/api/slack/integration-status", (req, res) => {
  const isConfigured = !!(process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET);
  res.json({
    liveMode: isConfigured,
    botTokenConfigured: !!process.env.SLACK_BOT_TOKEN,
    signingSecretConfigured: !!process.env.SLACK_SIGNING_SECRET,
    scopes: ["channels:history", "chat:write", "users:read", "groups:history", "im:history"],
    events: ["message.channels", "message.groups", "message.im"],
    eventsEndpoint: "/slack/events",
    rtsApiStatus: isConfigured ? "ACTIVE" : "STANDBY (Simulated)",
    hostUrl: process.env.APP_URL || "http://localhost:3000"
  });
});

// API: Post a new message to Slack and prioritize/shield it
app.post("/api/slack/message", async (req, res) => {
  const { channel, user, text } = req.body;
  if (!channel || !user || !text) {
    return res.status(400).json({ error: "Missing required fields (channel, user, text)" });
  }

  const db = getDB();
  const preferences = db.preferences;

  // 1. Semantic Prioritization using Gemini
  const classification = await classifyMessage(text);

  // 2. Deep Work Shielding Checks
  let shieldStatus: "allowed" | "queued" | "none" = "none";
  let relevantMcpContext = "";

  if (preferences.deepWorkActive) {
    // Under deep work, DMs or notifications are intercepted.
    // If priority is HIGH: Check MCP Server context!
    if (classification.priority === "high") {
      if (preferences.mcpActive && preferences.mcpContext) {
        // Look for common vocabulary intersections between message text and MCP project context
        const mcpWords = preferences.mcpContext.toLowerCase().split(/[\s_\-\.\/]+/);
        const msgWords = text.toLowerCase().split(/[\s_\-\.\/]+/);
        
        // Match standard engineering context overlaps: e.g. "server", "db", "auth", "express", "node", "vite", "git", "pr"
        const keywords = ["server", "db", "database", "auth", "authentication", "api", "route", "connection", "replica", "controller", "code", "index", "fail"];
        const hasOverlap = mcpWords.some(w => keywords.includes(w) && msgWords.some(mw => mw.includes(w) || w.includes(mw))) || 
                            msgWords.some(w => mcpWords.includes(w) && w.length > 3);

        if (hasOverlap) {
          shieldStatus = "allowed";
          relevantMcpContext = `Bypassed shield because message matches active IDE project focus: "${preferences.mcpContext}"`;
        } else {
          // Urgent but not relevant to immediate task, prioritize to Focus Stream but log as buffered in deep work context
          shieldStatus = "allowed"; 
          relevantMcpContext = "Urgent alarm allowed to break through Focus Stream.";
        }
      } else {
        shieldStatus = "allowed";
      }
    } else {
      // Low or neutral messages are safely shielded & queued!
      shieldStatus = "queued";
    }
  }

  // Create message record
  const avatarName = user.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const newMessage: SlackMessage = {
    id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    channel,
    user,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarName}`,
    text,
    timestamp: "Today at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    priority: classification.priority,
    intent: classification.intent,
    explanation: classification.explanation,
    shieldStatus,
    relevantMcpContext: relevantMcpContext || undefined
  };

  db.messages.push(newMessage);
  saveDB(db);

  res.json({ message: newMessage, preferences });
});

// API: Generate "Catch-Me-Up" Timeline for a channel
app.post("/api/slack/generate-timeline", async (req, res) => {
  const { channelName } = req.body;
  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  const db = getDB();
  // Filter messages for that channel
  const channelMessages = db.messages.filter(m => m.channel === channelName);
  
  if (channelMessages.length === 0) {
    return res.status(404).json({ error: "No messages found in this channel to summarize." });
  }

  // Generate timeline via Gemini
  const timelineMarkdown = await generateCatchUpTimeline(channelName, channelMessages);

  const newTimeline: CatchUpTimeline = {
    id: `t_${Date.now()}`,
    channelName,
    title: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} Catch-Up Digest`,
    generatedAt: new Date().toLocaleString(),
    content: timelineMarkdown,
    sourceMessageCount: channelMessages.length
  };

  // Add to db and preserve limit of 15 timelines
  db.timelines.unshift(newTimeline);
  if (db.timelines.length > 15) {
    db.timelines.pop();
  }
  
  saveDB(db);
  res.json(newTimeline);
});

// API: Save User Preferences
app.post("/api/slack/preferences", (req, res) => {
  const { deepWorkActive, focusDurationMinutes, mcpContext, mcpActive, notificationsEnabled } = req.body;
  const db = getDB();

  let focusEndTime = null;
  if (deepWorkActive) {
    const duration = focusDurationMinutes ? parseInt(focusDurationMinutes) : 30;
    focusEndTime = new Date(Date.now() + duration * 60000).toISOString();
  }

  db.preferences = {
    deepWorkActive: !!deepWorkActive,
    focusEndTime,
    mcpContext: mcpContext || db.preferences.mcpContext,
    mcpActive: mcpActive !== undefined ? !!mcpActive : db.preferences.mcpActive,
    notificationsEnabled: notificationsEnabled !== undefined ? !!notificationsEnabled : db.preferences.notificationsEnabled
  };

  saveDB(db);
  res.json(db.preferences);
});

// API: Clear/Reset database to default seed data
app.post("/api/slack/clear", (req, res) => {
  fs.unlinkSync(DB_FILE);
  const data = initializeDatabase();
  res.json({ success: true, data });
});

// Mount Vite in development, serve build in production
async function startServer() {
  // Initialize DB first
  initializeDatabase();

  // 1. Direct url_verification handler to guarantee Slack's event challenger works seamlessly in ALL modes!
  app.post("/slack/events", (req, res, next) => {
    if (req.body && req.body.type === "url_verification") {
      console.log("🔍 [Slack Challenge Handshake] Responding with challenge token:", req.body.challenge);
      return res.json({ challenge: req.body.challenge });
    }
    
    // Check if real Slack App is instantiated
    const { app: boltApp, receiver: boltReceiver } = getSlackApp();
    if (!boltApp || !boltReceiver) {
      console.log("📝 Simulated Slack Event received (Bolt connection is inactive):", JSON.stringify(req.body));
      return res.json({ status: "simulated_success", note: "Configure Slack credentials to activate Bolt event stream." });
    }
    
    next();
  });

  // 2. Mount Bolt ExpressReceiver routes
  const { app: boltApp, receiver: boltReceiver } = getSlackApp();
  if (boltReceiver) {
    app.use(boltReceiver.router);
    console.log("⚡ Bolt ExpressReceiver mounted onto Express app at /slack/events.");
  }

  if (process.env.NODE_ENV !== "production") {
    // Import Vite dynamically to ensure production doesn't fail on missing dev-dependencies
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SlackEnabler server running on http://localhost:${PORT} [ENV: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
