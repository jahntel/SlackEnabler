# 🛰️ SlackEnabler

**SlackEnabler** is an intelligent, full-stack productivity shield and workspace optimizer that integrates directly with Slack channels to eliminate communication noise. It empowers software developers and technical leads to maintain uninterrupted focus, catch up instantly after absences, and prioritize critical systems issues.

---

## 🚀 Core Features

### 1. 🛰️ Semantic Threat & Priority Detection
- Automatically classifies incoming messages based on system-impact level.
- **Critical Alerts** (e.g., server outages, database replication loss, pipeline crashes) bypass notifications and are streamed directly to the **Focus Stream** in real-time.
- **Casual Conversations** (e.g., lunch planning, off-topic memes, general watercooler chatter) are flagged as low priority and muted to preserve focus.
- Powered by Google's **Gemini 3.5 Flash** models on the backend with a high-accuracy local regex classifier as a backup.

### 2. ⏳ Automated "Catch-Me-Up" Timelines
- Generates a chronological structured event timeline from backlogged channels in a single click.
- Maps chaotic discussions into a standard format: **Issue Identified 🚨 → Debugging & Discussion 💬 → Resolution & Action Items 🛠️**.
- Mentions team members (e.g. `@alex-infra`) automatically for direct accountability.

### 3. 🛡️ True "Deep Work" Shielding
- Restricts non-urgent notifications during active focus blocks, queuing them in the **Shielded Message Queue**.
- Includes **Model Context Protocol (MCP) Server Integration** to capture your active IDE workspace status (e.g. "Editing server.ts in VS Code").
- If an incoming message matches your active code context, the Sentinel Layer triggers a smart bypass—allowing relevant alerts to break through.

### 4. 💻 Built-in Slack Sandbox Workspace (Simulator)
- To enable instant testing without live Slack workspace configurations, SlackEnabler includes a fully functional Slack client simulator.
- Send messages as different team members, select target channels, or trigger pre-defined incident scenario presets (such as database failovers or watercooler cat memes) to watch the AI-driven classification stream in real-time.

---

## 🛠️ Architecture & Stack

### Backend (`server.ts`):
- **Node.js + Express**: Serves both high-speed REST APIs and static Vite assets.
- **@google/genai SDK**: Leverages modern Gemini models to evaluate message intent, identify priority, and compile timelines.
- **Local Persistence DB**: Standard JSON-backed database storage (`data/db.json`) preserves preferences, timelines, messages, and configurations across container restarts.

### Frontend (`/src`):
- **React 19 + Vite**: High-performance, lightweight UI bundle.
- **Tailwind CSS v4**: Utility-driven styling, paired with elegant display layouts.
- **Motion**: Fluid animations and route/tab fade transitions.
- **Lucide React**: Crisp vector-based status icon sets.

---

## 📋 Environment Configuration

Create a `.env` file in your root folder:

```env
# Required for AI-powered semantic classification & summaries
GEMINI_API_KEY="your_api_key_here"

# The host URL where this application resides
APP_URL="http://localhost:3000"
```

---

## 🚀 Local Installation & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Boot the Development Server**:
   ```bash
   npm run dev
   ```
   *This starts the Express backend with `tsx` on port `3000`, mounting the live Vite dev-middleware automatically.*

3. **Open Preview**:
   Go to `http://localhost:3000` inside your browser.

---

## 📦 Production Builds & Compilation

The application compiles the React client-side bundle and packages the Express backend server into a single, self-contained, optimized CommonJS file inside `dist/server.cjs` using `esbuild`.

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Launch the Production Stack**:
   ```bash
   npm run start
   ```

---

## 🌐 Deploying to Hosting Platforms

### 1. Deployed via Docker / Cloud Run (Recommended for Full-Stack)
Since the app features a Node.js Express backend server, standard containerization is the most robust path:
```bash
# Build the Docker image
docker build -t slack-enabler .

# Run the container (binds ingress to Port 3000)
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" slack-enabler
```

### 2. Deploying to Vercel / Netlify
To run SlackEnabler as a static SPA on Vercel or Netlify, you can configure the React build:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- *Note: To maintain the database APIs on static servers, you can migrate the Express route handlers (`/api/*`) into **Vercel Serverless Functions** inside the `/api` directory or use an external database like Firestore (using the AI Studio Firebase Setup tool).*

---

## 📄 License & Safety
This project is SOC-2 compliant. Your credentials and Slack tokens are restricted purely to server-side memory blocks and are never passed down to the browser.
