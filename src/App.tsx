import React, { useState, useEffect } from 'react';
import { SlackMessage, SlackChannel, UserPreferences, CatchUpTimeline, WorkspaceData } from './types';
import FocusStream from './components/FocusStream';
import TimelineGenerator from './components/TimelineGenerator';
import DeepWorkPanel from './components/DeepWorkPanel';
import SlackSandbox from './components/SlackSandbox';
import IntegrationPanel from './components/IntegrationPanel';
import { LandingPage, SupportPage, PrivacyPolicy } from './components/Pages';
import { Shield, Sparkles, MessageSquare, Compass, HelpCircle, ShieldAlert, Cpu, Layers, Terminal, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'dashboard' | 'landing' | 'support' | 'privacy';
type SubTabType = 'focus-stream' | 'catch-me-up' | 'deep-work' | 'integration';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('focus-stream');
  
  // Data State
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [timelines, setTimelines] = useState<CatchUpTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch complete state from our full-stack Express server
  const fetchState = async () => {
    try {
      const res = await fetch('/api/slack/state');
      if (!res.ok) throw new Error('API server returned error code ' + res.status);
      const data: WorkspaceData = await res.json();
      setChannels(data.channels);
      setMessages(data.messages);
      setPreferences(data.preferences);
      setTimelines(data.timelines);
      setGlobalError(null);
    } catch (err) {
      console.error("Error connecting to full-stack Express backend:", err);
      setGlobalError("Failed to synchronize state with Express server. Verify the development server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll state every 5 seconds to get updates in background
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  // Post a message in the simulator
  const handleSendMessage = async (channel: string, user: string, text: string) => {
    try {
      const res = await fetch('/api/slack/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, user, text })
      });
      if (!res.ok) throw new Error('Failed to transmit message');
      await fetchState();
    } catch (err) {
      console.error(err);
      setGlobalError("Failed to transmit simulation message to backend.");
    }
  };

  // Compile backlog timeline
  const handleGenerateTimeline = async (channelName: string): Promise<CatchUpTimeline> => {
    const res = await fetch('/api/slack/generate-timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Timeline generation failed');
    }
    const data: CatchUpTimeline = await res.json();
    await fetchState();
    return data;
  };

  // Save Preferences
  const handleSavePreferences = async (updatedPrefs: Partial<UserPreferences> & { focusDurationMinutes?: number }) => {
    try {
      const res = await fetch('/api/slack/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPrefs)
      });
      if (!res.ok) throw new Error('Failed to update credentials');
      await fetchState();
    } catch (err) {
      console.error(err);
      setGlobalError("Failed to save preference configurations to backend.");
    }
  };

  // Wipe and reset sandbox database
  const handleResetDatabase = async () => {
    try {
      const res = await fetch('/api/slack/clear', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      await fetchState();
    } catch (err) {
      console.error(err);
      setGlobalError("Failed to reset local database.");
    }
  };

  // Triggered reply within Focus Stream
  const handleStreamReply = async (messageText: string) => {
    // Post reply as Jenny-dev inside #engineering-alerts or general
    await handleSendMessage('engineering-alerts', 'jenny-dev', messageText);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" id="applet-container">
      {/* Premium Top Navigation Bar */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-gray-950 text-sm tracking-tight flex items-center gap-1.5">
                SlackEnabler
              </h1>
              <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1 py-0.2 rounded border border-gray-100 uppercase tracking-widest font-semibold">
                Sentinel V1.0
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'landing'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Product Tour
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Support Desk
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Compliance & Safety
            </button>
          </nav>

          {/* Active User Session Details */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Active Workspace User</span>
              <span className="text-xs text-gray-700 font-bold">johnnzau845@gmail.com</span>
            </div>
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=john"
              alt="User profile"
              className="w-8 h-8 rounded-full border bg-gray-50 border-gray-200"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Mobile Submenu Navigation */}
        <div className="md:hidden flex border-t border-gray-100 overflow-x-auto h-11 px-2 items-center justify-start gap-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${
              activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${
              activeTab === 'landing' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
            }`}
          >
            Tour
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${
              activeTab === 'support' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
            }`}
          >
            Support
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 ${
              activeTab === 'privacy' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
            }`}
          >
            Compliance
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {globalError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-150 text-rose-800 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-semibold animate-pulse shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{globalError}</p>
              <button onClick={fetchState} className="text-indigo-600 hover:underline block text-[10px] font-bold">
                Force status sync retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative flex h-10 w-10 mb-4 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
              <span className="relative inline-flex rounded-xl h-8 w-8 bg-indigo-600"></span>
            </div>
            <h3 className="font-bold text-gray-800 text-sm font-mono uppercase tracking-wider">Syncing Slack Sentinel Nodes...</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">Connecting with sandbox databases and verifying server integrity pipelines.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Main Dashboard Control Area */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Dashboard Header & Sub-Tabs */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-black text-gray-900 text-sm tracking-tight">Active Sentinel Control</h2>
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Interactive Workspace Core</span>
                      </div>
                    </div>

                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1 gap-1 overflow-x-auto">
                      <button
                        onClick={() => setActiveSubTab('focus-stream')}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          activeSubTab === 'focus-stream'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Focus Stream
                      </button>
                      
                      <button
                        onClick={() => setActiveSubTab('catch-me-up')}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          activeSubTab === 'catch-me-up'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Catch-Me-Up
                      </button>
                      
                      <button
                        onClick={() => setActiveSubTab('deep-work')}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          activeSubTab === 'deep-work'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Deep Shield
                      </button>

                      <button
                        onClick={() => setActiveSubTab('integration')}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          activeSubTab === 'integration'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        Slack Connect
                      </button>
                    </div>
                  </div>

                  {/* Active Panel Display */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm min-h-[460px]">
                    {activeSubTab === 'focus-stream' && (
                      <FocusStream messages={messages} onReply={handleStreamReply} />
                    )}

                    {activeSubTab === 'catch-me-up' && (
                      <TimelineGenerator
                        channels={channels}
                        messages={messages}
                        timelines={timelines}
                        onGenerate={handleGenerateTimeline}
                      />
                    )}

                    {activeSubTab === 'deep-work' && preferences && (
                      <DeepWorkPanel
                        preferences={preferences}
                        messages={messages}
                        onSavePreferences={handleSavePreferences}
                      />
                    )}

                    {activeSubTab === 'integration' && (
                      <IntegrationPanel />
                    )}
                  </div>
                </div>

                {/* Right Column: Slack Sandbox Workspace (Always Visible on Dashboard!) */}
                <div className="lg:col-span-4 space-y-6">
                  <SlackSandbox
                    channels={channels}
                    onSendMessage={handleSendMessage}
                    onResetDatabase={handleResetDatabase}
                  />

                  {/* Quick System Monitor Widget */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-[10px]">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2 text-gray-400">
                      <span className="font-bold flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                        SYSTEM_TELEMETRY
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-500">Live Connection</span>
                    </div>

                    <div className="space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>active_channels_monitored:</span>
                        <span className="font-bold text-gray-900">{channels.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>semantic_messages_indexed:</span>
                        <span className="font-bold text-gray-900">{messages.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>deep_shield_defense:</span>
                        <span className={`font-bold ${preferences?.deepWorkActive ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`}>
                          {preferences?.deepWorkActive ? 'ENGAGED' : 'STANDBY'}
                        </span>
                      </div>
                      {preferences?.deepWorkActive && (
                        <div className="flex justify-between border-t border-dashed border-gray-100 pt-1.5 mt-1.5 text-amber-800">
                          <span>mcp_server_target:</span>
                          <span className="font-bold truncate max-w-[120px]" title={preferences.mcpContext}>
                            {preferences.mcpContext}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: LANDING PRODUCT TOUR */}
            {activeTab === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LandingPage onEnterApp={() => setActiveTab('dashboard')} />
              </motion.div>
            )}

            {/* TAB: SUPPORT DESK */}
            {activeTab === 'support' && (
              <motion.div
                key="support"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SupportPage />
              </motion.div>
            )}

            {/* TAB: COMPLIANCE AND SAFETY */}
            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PrivacyPolicy />
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* Styled Footer */}
      <footer className="bg-white border-t border-gray-150 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300">© 2026</span>
            <span className="font-bold text-gray-600">SlackEnabler, Inc.</span>
            <span>- All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('landing')} className="hover:text-gray-600 transition-colors cursor-pointer">Product Tour</button>
            <span>•</span>
            <button onClick={() => setActiveTab('support')} className="hover:text-gray-600 transition-colors cursor-pointer">Support Center</button>
            <span>•</span>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-gray-600 transition-colors cursor-pointer">Security Compliance</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
