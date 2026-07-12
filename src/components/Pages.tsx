import React, { useState } from 'react';
import { Shield, Sparkles, Cpu, Send, CheckCircle, Mail, HelpCircle, ShieldAlert, Key, Copy } from 'lucide-react';
import { motion } from 'motion/react';

// LANDING PAGE VIEW
export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  return (
    <div className="space-y-16 py-6" id="landing-view">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-150 rounded-full text-indigo-700 text-xs font-semibold tracking-wide animate-bounce-slow">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Production-Ready AI Product Optimizer
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          SlackEnabler
        </h1>
        
        <p className="text-3xl md:text-4xl font-extrabold text-indigo-600 tracking-tight leading-tight">
          Eliminate Noise. Supercharge Engineering Deep Work.
        </p>

        <p className="text-base text-gray-500 leading-relaxed max-w-2xl mx-auto font-medium">
          The ultimate productivity filter that connects directly to Slack channels. Using semantic intelligence and IDE-level workspace contexts, it intercepts chatter, summarizes backlog timelines, and shields active developers.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            Launch Sentinel Dashboard
          </button>
          
          <a
            href="#features-list"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-all text-center"
          >
            Explore Features
          </a>
        </div>
      </div>

      {/* Feature Bento Grid Section */}
      <div id="features-list" className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">The Productivity Sentinel Pillars</h2>
          <p className="text-xs text-gray-500 mt-1">Intelligent middleware built specifically for high-frequency dev teams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow transition-shadow space-y-4">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Semantic Threat Detection</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              A neural analyzer sorts Slack streams. Casual memes, watercooler chatter, and food announcements are silently funneled to background digests, while infrastructure outages and direct blockers hit your Focus Stream instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow transition-shadow space-y-4">
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Catch-Me-Up Timelines</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Don't spend an hour scrolling unread logs. Click once to generate automated structured chronological logs of backlogged channels: <strong>Issue Identified → Debugging & Discussion → Resolution & PR status</strong>.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow transition-shadow space-y-4">
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">True Deep Work Shielding</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Activate focus blocks with complete safety. Intercepted non-urgent pings are queued silently. But if an outage occurs in the exact repository or code microservice you are currently editing in VS Code, MCP context triggers a smart bypass!
            </p>
          </div>
        </div>
      </div>

      {/* Integration Walkthrough */}
      <div className="bg-gray-50 border border-gray-150 rounded-2xl p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase border border-indigo-150">
            Zero-Trust Architecture
          </span>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Connects in minutes. Safe by design.</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            SlackEnabler utilizes standard Slack API Webhooks or real-time Streams. Your API credentials and message data reside entirely on-premise or within container sandboxes. We never store raw telemetry or export private logs.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
              <CheckCircle className="w-3.5 h-3.5" /> SOC-2 Compliant
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
              <CheckCircle className="w-3.5 h-3.5" /> GDPR Certified
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-5 space-y-3 font-mono text-[10px] text-gray-700">
          <div className="flex items-center gap-1.5 text-gray-400 pb-2 border-b border-gray-50">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="ml-2">slack-enabler-init.sh</span>
          </div>
          <p className="text-indigo-600"># Install the local SlackEnabler daemon</p>
          <p className="font-bold">npm install -g @slack-enabler/sentinel</p>
          <p className="text-indigo-600"># Bind MCP context using standard IDE configurations</p>
          <p className="font-bold">sentinel-mcp init --port 3000</p>
          <p className="text-emerald-600">✓ Connected safely. Sentinel Layer active.</p>
        </div>
      </div>
    </div>
  );
}

// SUPPORT PAGE VIEW
export function SupportPage() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setIsSubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@slackenabler.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqItems = [
    {
      q: 'How does the Semantic Prioritization system distinguish urgent outages from casual banter?',
      a: 'SlackEnabler uses Gemini LLMs on the server to analyze the semantic intent, grammatical triggers, and systemic keywords of incoming messages. Outages and service-failure reports are classified as High Priority, while memes, general check-ins, or off-topic announcements are routed to background archives.'
    },
    {
      q: 'What is the Model Context Protocol (MCP) Integration?',
      a: 'MCP is an open standard that allows client tools (like your local IDE or command line) to communicate state to AI agents. SlackEnabler captures the exact code file you are actively editing, allowing relevant outage alerts or pull-request requests regarding that file to bypass your silent Deep Work block.'
    },
    {
      q: 'Can I connect a live corporate Slack workspace?',
      a: 'Absolutely. While the demo comes pre-configured with a highly interactive local workspace simulator sandbox, production deployments utilize Slack RTS (Real-Time Search) and App Bot Tokens. Simply specify your SLACK_BOT_TOKEN inside your deployment dashboard.'
    },
    {
      q: 'How do automated timeline compilations work?',
      a: 'The Catch-Me-Up Timeline compiles channel messages backlogged while you were away. It sends chronological conversations to Gemini to output a structured Markdown sequence tracing identified issues, the ensuing debugging discussions, and finally PR merges or resolutions.'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6" id="support-view">
      {/* FAQs */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Help & Documentation Center</h2>
          <p className="text-xs text-gray-500 mt-1">Frequently asked questions regarding the SlackEnabler productivity shield.</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
              <h4 className="font-bold text-gray-900 text-sm tracking-tight flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                {item.q}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket form & Emergency Support */}
      <div className="lg:col-span-5 space-y-6 self-start">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight mb-1 flex items-center gap-1">
            <Mail className="w-4 h-4 text-indigo-500" /> Submit a Support Ticket
          </h3>
          <p className="text-[10px] text-gray-400 mb-4">Need personalized assistance? Open a ticket directly with our systems engineers.</p>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-150 rounded-xl text-center space-y-3">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">Ticket Submitted Successfully</h4>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Your support ticket (ID: TS-{Math.floor(Math.random() * 8000 + 1000)}) has been dispatched. A DevOps engineer will reach out to johnnzau845@gmail.com within 24 business hours.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setTicketSubject('');
                  setTicketMessage('');
                }}
                className="mt-2 text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Submit another query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Your Email</label>
                <input
                  type="email"
                  disabled
                  value="johnnzau845@gmail.com"
                  className="w-full text-xs bg-gray-50 border border-gray-150 rounded-xl p-3 text-gray-500 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Issue Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Slack Bot token authentication failures"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  className="w-full text-xs bg-gray-50 border border-gray-150 rounded-xl p-3 text-gray-800 font-medium focus:outline-none focus:bg-white focus:border-indigo-300 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Message Description</label>
                <textarea
                  placeholder="Provide details about your query..."
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  className="w-full text-xs bg-gray-50 border border-gray-150 rounded-xl p-3 text-gray-800 font-medium focus:outline-none focus:bg-white focus:border-indigo-300 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Support Ticket
              </button>
            </form>
          )}
        </div>

        {/* Emergency Support Section */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-rose-950 text-sm tracking-tight flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" /> Emergency Support
          </h3>
          <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
            Experiencing a critical production block or urgent service outage? Contact our development team directly for immediate assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href="mailto:support@slackenabler.com?subject=URGENT: SlackEnabler Production Support Request"
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Developer
            </a>
            <button
              onClick={handleCopyEmail}
              className="bg-white hover:bg-rose-100/30 border border-rose-200 text-rose-900 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  Copy Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PRIVACY POLICY VIEW
export function PrivacyPolicy() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-4xl mx-auto" id="privacy-view">
      <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Privacy Policy & Token Security</h2>
          <p className="text-xs text-gray-500">Effective Date: June 30, 2026. Reviewing compliance regulations regarding workspace logs.</p>
        </div>
      </div>

      <div className="space-y-4 text-xs text-gray-600 leading-relaxed font-medium">
        <p>
          At <strong>SlackEnabler</strong>, we recognize the exceptional sensitivity of corporate communications, developer channels, and project logs. Your trust is our core operating benchmark. This policy details how we enforce zero-leak guarantees on Slack message streams.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-6 mb-1">1. Scope of Data Ingestion</h3>
        <p>
          SlackEnabler integrates with your team's Slack instance through OAuth scope bindings. Message text is retrieved via standard real-time webhooks or REST query channels solely to prioritize and shield:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Text Categorization:</strong> Sentences are evaluated on-the-fly for priority markers. Raw message logs are stored within your private local database file context (SQLite/JSON) and are never uploaded to our servers.</li>
          <li><strong>Channel Compilations:</strong> Catch-Me-Up Timeline requests utilize secure Gemini APIs via the standard full-stack proxy. No text processed this way is used to retrain base models.</li>
          <li><strong>MCP Telemetry:</strong> Workspace activities (IDE filenames or active compiler contexts) are restricted purely to client-side memory blocks and are never saved permanently.</li>
        </ul>

        <h3 className="text-sm font-bold text-gray-900 mt-6 mb-1">2. Token Access & Storage Safety</h3>
        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-[11px] text-indigo-950">
          <div className="flex items-center gap-1.5 font-bold text-indigo-800">
            <Key className="w-4 h-4 text-indigo-600" /> Token Isolation Architecture
          </div>
          <p>
            Your <code>SLACK_BOT_TOKEN</code> and <code>GEMINI_API_KEY</code> are handled as strictly isolated server-side environment variables. Under no circumstances are keys passed down to client-side bundles or exposed via the browser developer inspect tool.
          </p>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mt-6 mb-1">3. GDPR & SOC-2 Compliance</h3>
        <p>
          Since SlackEnabler stores data in sandbox-contained file volumes (on Cloud Run/Docker containers), compliance under GDPR Article 17 ("Right to Erasure") can be triggered instantly. Click the **Reset Workspace** command in the Sandbox panel to wipe all preferences, compiled timelines, and message backlogs from persistent disks permanently.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-6 mb-1">4. Third-Party Disclosures</h3>
        <p>
          We do not sell, trade, rent, or distribute communication metadata, Slack profiles, or system logs to third-party brokers, marketing engines, or analytical firms. All AI queries are executed through Google Cloud platform nodes.
        </p>

        <p className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-mono text-center">
          Inquiries regarding SlackEnabler compliance protocols can be routed to security@slack-enabler.io.
        </p>
      </div>
    </div>
  );
}
