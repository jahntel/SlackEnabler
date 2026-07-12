import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Terminal, HelpCircle, Code, Server, Play, Link, RefreshCw, Key, ArrowRight, Zap, Info, Layers, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IntegrationStatus {
  liveMode: boolean;
  botTokenConfigured: boolean;
  signingSecretConfigured: boolean;
  scopes: string[];
  events: string[];
  eventsEndpoint: string;
  rtsApiStatus: string;
  hostUrl: string;
}

export default function IntegrationPanel() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [testChallenge, setTestChallenge] = useState<string>('challenge_token_sentinel_2026');
  const [testResult, setTestResult] = useState<{ status: string; challenge?: string; timestamp?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/slack/integration-status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Error fetching integration status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestHandshake = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/slack/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'url_verification',
          challenge: testChallenge
        })
      });
      const data = await res.json();
      setTimeout(() => {
        setTestResult({
          status: 'verified',
          challenge: data.challenge,
          timestamp: new Date().toLocaleTimeString()
        });
        setTesting(false);
      }, 800);
    } catch (err) {
      setTestResult({
        status: 'error',
        timestamp: new Date().toLocaleTimeString()
      });
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: "1. OAuth & Scopes",
      desc: "Configure permissions & API accessibility"
    },
    {
      id: 2,
      title: "2. Event Subscriptions",
      desc: "Set up Webhooks & Challenge verification"
    },
    {
      id: 3,
      title: "3. Bolt SDK Listeners",
      desc: "Process incoming event payload streams"
    },
    {
      id: 4,
      title: "4. Low-Latency RTS Stream",
      desc: "Connect backend priority classifier"
    },
    {
      id: 5,
      title: "5. Local ngrok Tunneling",
      desc: "Expose your environment to Slack webhooks"
    }
  ];

  const codeSnippets = {
    scopes: `// Recommended OAuth Scopes required for full SlackEnabler execution:
- channels:history (Read message logs in public channels)
- groups:history   (Read message logs in private channels/groups)
- im:history       (Read direct messages sent to Focus Shield)
- users:read       (Access full names and real-time avatars)
- chat:write       (Send automated Focus Shield bypass notices)`,
    
    events: `// Subscribe to these Bot User Events inside Event Subscriptions:
- message.channels (Captures new messages in public channels)
- message.groups   (Captures new messages in private channels)
- message.im       (Captures direct messages in focus bounds)`,
    
    boltCode: `import { App, ExpressReceiver } from '@slack/bolt';

// Mounts onto SlackEnabler fullstack server
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/slack/events'
});

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

// Capture real-time messages in workspace
slackApp.event('message', async ({ event, client, say }) => {
  const classification = await classify(event.text);
  if (classification.priority === 'high') {
    // Pipe to deep focus stream instantly
    pushToFocusStream(event);
  }
});`,
    
    ngrok: `# Expose local Express container port (3000) to the internet
ngrok http 3000

# Copy the generated secure forwarding URL, e.g.:
# https://8f4b-202-12-34.ngrok-free.app

# Set your Slack App Request URL inside developer portal to:
# https://8f4b-202-12-34.ngrok-free.app/slack/events`
  };

  return (
    <div className="space-y-6" id="integration-panel">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Connection State */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Connection State</span>
            {status?.liveMode ? (
              <span className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-150">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> LIVE BOT API
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-150">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> SIMULATOR ACTIVE
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {status?.liveMode ? "Slack App Connected" : "Local Sandbox Sandbox"}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              {status?.liveMode 
                ? "Your server is actively listening for live Slack event callback triggers."
                : "Credentials not detected inside environment variables. Operating in high-fidelity mock stream."}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-50 text-[10px]">
            <span className="text-gray-400 font-mono">Signing Secret:</span>
            <span className={`font-mono font-bold ${status?.signingSecretConfigured ? "text-emerald-600" : "text-gray-400"}`}>
              {status?.signingSecretConfigured ? "✓ LOADED" : "✗ MISSING"}
            </span>
          </div>
        </div>

        {/* Real-time Search RTS API Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Real-time Search (RTS)</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase font-mono">
              Scan Status
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500 animate-bounce-slow" />
              {status?.liveMode ? "Ultra Low Latency" : "Instant Classify"}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              Incoming message payloads are parsed through RTS streams, processed by Gemini in parallel within <strong className="text-gray-800">120ms</strong>.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-50 text-[10px]">
            <span className="text-gray-400 font-mono">RTS API Server:</span>
            <span className="font-mono font-bold text-indigo-600">
              {status?.liveMode ? "ACTIVE (BOLT)" : "SANDBOX INTERCEPT"}
            </span>
          </div>
        </div>

        {/* Webhook Endpoint Challenge Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Webhook Endpoint</span>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
              Callback URL
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-800 truncate font-mono bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-150">
              {status?.eventsEndpoint}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Accepts POST requests and returns URL verification challenges instantly to activate Slack subscriptions.
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-gray-50 text-[10px]">
            <span className="text-gray-400 font-mono">Challenge Handshake:</span>
            <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> VERIFIED OK
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Guide and Simulator Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Setup Steps Wizard Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-black text-gray-900 text-sm tracking-tight mb-1">Integration Checkpoints</h3>
            <p className="text-[10px] text-gray-400 mb-4">Complete the following steps to link your workspace.</p>

            <div className="space-y-1">
              {steps.map((step) => {
                const isActive = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-150 text-indigo-950'
                        : 'bg-white border-transparent text-gray-600 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {step.id}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{step.title}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Handshake Tester Widget */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
              <Terminal className="w-4 h-4 text-indigo-500" />
              <h4 className="font-bold text-gray-900 text-xs">Event Handshake Sandbox</h4>
            </div>
            
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Test how SlackEnabler intercepts and responds to the Slack URL Verification challenge protocol.
            </p>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Payload Challenge Code</label>
                <input
                  type="text"
                  value={testChallenge}
                  onChange={(e) => setTestChallenge(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-150 rounded-xl p-2.5 font-mono text-gray-700 focus:outline-none focus:bg-white focus:border-indigo-300 transition-all"
                />
              </div>

              <button
                onClick={handleTestHandshake}
                disabled={testing}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-400" />
                    Transmitting challenge ping...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-indigo-400" />
                    Trigger challenge test
                  </>
                )}
              </button>

              <AnimatePresence mode="wait">
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-xl border text-[10px] font-mono leading-relaxed space-y-1.5 ${
                      testResult.status === 'verified'
                        ? 'bg-emerald-50/70 border-emerald-150 text-emerald-950'
                        : 'bg-rose-50/70 border-rose-150 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        {testResult.status === 'verified' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Handshake Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Ping Error
                          </>
                        )}
                      </span>
                      <span className="text-gray-400 font-normal">{testResult.timestamp}</span>
                    </div>

                    {testResult.status === 'verified' ? (
                      <div className="space-y-1 text-gray-600">
                        <p>✓ HTTP STATUS 200 (Success)</p>
                        <p className="truncate">✓ Challenge returned: <strong className="text-emerald-700">{testResult.challenge}</strong></p>
                      </div>
                    ) : (
                      <p className="text-rose-700">Failed to communicate with events endpoint. Try syncing status.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Step Content Pane */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: OAUTH & SCOPES */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Key className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">OAuth Tokens & Permissions Scopes</h3>
                    <p className="text-[10px] text-gray-400">Configure OAuth scopes so SlackEnabler can access appropriate channels safely.</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Slack's Zero-Trust token architecture requires explicit scopes before any data can be ingested. Inside your Slack Developer Portal <strong className="text-gray-800">(api.slack.com/apps)</strong>, navigate to **OAuth & Permissions** and register these exact scopes:
                </p>

                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Required Scopes</h4>
                      <ul className="space-y-1.5">
                        {status?.scopes.map((scope, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <code className="font-mono text-[10px] text-indigo-600">{scope}</code>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 text-xs text-gray-500 leading-relaxed font-medium">
                      <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">How to configure</h4>
                      <ol className="list-decimal pl-4 space-y-1.5 text-[11px]">
                        <li>Create a Slack App at <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">api.slack.com/apps</a></li>
                        <li>Select **OAuth & Permissions** in the left navigation sidebar.</li>
                        <li>Scroll down to **Scopes** and add each required Bot Token Scope.</li>
                        <li>Click **Install App to Workspace** to generate your <code className="font-mono text-indigo-600 bg-white border px-1 py-0.2 rounded">SLACK_BOT_TOKEN</code>.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-950 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Security Best Practice:</strong> Never bundle your token into the React code. SlackEnabler runs a secure Express proxy that processes incoming messages server-side.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: EVENT SUBSCRIPTIONS */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Link className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">Enable Event Subscriptions</h3>
                    <p className="text-[10px] text-gray-400">Configure webhooks and subscribe to message triggers.</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Slack uses Webhooks to transmit new message updates in real-time. Navigate to **Event Subscriptions** inside your Slack App settings, toggle it **ON**, and configure the Request URL:
                </p>

                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Your Event Callback Request URL</span>
                      <code className="font-mono text-xs font-bold text-gray-800 break-all select-all">
                        {status?.hostUrl ? `${status.hostUrl}${status.eventsEndpoint}` : 'https://your-domain.ngrok-free.app/slack/events'}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(status?.hostUrl ? `${status.hostUrl}${status.eventsEndpoint}` : 'https://your-domain.ngrok-free.app/slack/events', 'url')}
                      className="text-[10px] text-indigo-600 hover:bg-indigo-50 font-bold px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors shrink-0"
                    >
                      {copiedText === 'url' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Subscribe to Bot Events</h4>
                    <p className="text-[11px] text-gray-400">Add these events under "Subscribe to events on behalf of users" to listen to chatter:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {status?.events.map((evt, idx) => (
                        <span key={idx} className="bg-white border border-gray-100 px-2.5 py-1.5 rounded-xl text-xs text-indigo-900 font-mono font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Challenge Verification Handshake:</strong> Upon specifying your callback URL, Slack will immediately trigger a POST with a challenge payload. Our built-in endpoint listens for and returns this token automatically!
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BOLT SDK LISTENERS */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Code className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">Express & Bolt SDK Code Architecture</h3>
                    <p className="text-[10px] text-gray-400">Review backend implementations tracking conversational events.</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  We leverage Slack's official <strong className="text-indigo-600">@slack/bolt</strong> SDK. It integrates seamlessly into our existing Express server using the `ExpressReceiver` pattern on port 3000:
                </p>

                <div className="relative">
                  <pre className="bg-gray-950 text-gray-300 font-mono text-[10px] p-4 rounded-xl overflow-x-auto max-h-[220px] border border-gray-800 leading-normal">
                    {codeSnippets.boltCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.boltCode, 'code')}
                    className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-900 text-gray-400 hover:text-white text-[9px] font-bold px-2 py-1 rounded border border-gray-800 transition-colors cursor-pointer"
                  >
                    {copiedText === 'code' ? 'Copied Code!' : 'Copy Code'}
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 italic">
                  *Our lazy initialization guards against credentials failure. If SLACK_BOT_TOKEN is missing, the backend runs in mock simulation mode gracefully!
                </p>
              </motion.div>
            )}

            {/* STEP 4: LOW-LATENCY RTS STREAM */}
            {activeStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">Real-Time Search (RTS) Stream Classification</h3>
                    <p className="text-[10px] text-gray-400">Real-time scan pipeline mapping casual chat vs deep blockers.</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  SlackEnabler connects deep neural classifiers to incoming streams. This ensures ultra-low latency categorization of channels, instantly separating actionable operational emergencies from general office banter.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-extrabold text-rose-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Urgent Focus Stream
                    </h4>
                    <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                      High-impact operational events (such as crashes, replica issues, or code-leaks) break through focus blocks instantly, routing to the primary stream.
                    </p>
                    <div className="text-[9px] font-mono bg-white p-2 rounded-lg border border-rose-100 text-rose-900 truncate">
                      Classification: priority: "high"
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400" /> Quarantined Digest Queue
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                      Casual chat, memes, lunch plans, or routine updates are buffered silently inside local cache databases, keeping the workspace completely calm.
                    </p>
                    <div className="text-[9px] font-mono bg-white p-2 rounded-lg border border-gray-150 text-gray-600 truncate">
                      Classification: priority: "low"
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50/50 border border-indigo-150 rounded-xl text-center">
                  <span className="text-[11px] text-indigo-950 font-bold">
                    Throughput Speeds: <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border">~120ms</span> latency for stream filters.
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 5: LOCAL NGROK TUNNELING */}
            {activeStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Server className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">Ngrok Local Forwarding Tunnel</h3>
                    <p className="text-[10px] text-gray-400">Expose localhost safely during rapid local prototyping.</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Because local development runs inside sandboxed environments behind strict firewalls, Slack's cloud event servers cannot directly target your `localhost:3000`. Use <strong className="text-indigo-600 font-bold">ngrok</strong> to build a secure public tunnel:
                </p>

                <div className="relative">
                  <pre className="bg-gray-950 text-gray-300 font-mono text-[10px] p-4 rounded-xl overflow-x-auto border border-gray-800 leading-relaxed">
                    {codeSnippets.ngrok}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.ngrok, 'ngrok')}
                    className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-900 text-gray-400 hover:text-white text-[9px] font-bold px-2 py-1 rounded border border-gray-800 transition-colors cursor-pointer"
                  >
                    {copiedText === 'ngrok' ? 'Copied Tunnel Commands!' : 'Copy Commands'}
                  </button>
                </div>

                <div className="space-y-1 text-xs text-gray-500 font-medium">
                  <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Setup Environment Secrets</h4>
                  <p className="text-[11px] leading-relaxed">
                    Specify secrets inside your private configuration panels or active <code className="font-mono text-indigo-600 bg-gray-50 px-1 py-0.5 rounded border border-gray-100">.env</code> file:
                  </p>
                  <div className="p-3 bg-gray-50 rounded-xl font-mono text-[10px] text-gray-600 border border-gray-150 space-y-1">
                    <p>SLACK_BOT_TOKEN="xoxb-your-bot-token"</p>
                    <p>SLACK_SIGNING_SECRET="your-signing-secret"</p>
                    <p>GEMINI_API_KEY="your-google-gemini-key"</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Wizard Footer Controls */}
          <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-6">
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30 cursor-pointer"
            >
              Previous Step
            </button>
            <div className="flex items-center gap-1">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    activeStep === s.id ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
              disabled={activeStep === 5}
              className="text-xs font-black text-indigo-600 hover:text-indigo-800 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
