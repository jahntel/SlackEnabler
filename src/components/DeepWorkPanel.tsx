import React, { useState, useEffect } from 'react';
import { UserPreferences, SlackMessage } from '../types';
import { Shield, ShieldAlert, ShieldCheck, Play, Square, Terminal, MessageSquare, Clock, Eye, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeepWorkPanelProps {
  preferences: UserPreferences;
  messages: SlackMessage[];
  onSavePreferences: (prefs: Partial<UserPreferences> & { focusDurationMinutes?: number }) => Promise<void>;
}

export default function DeepWorkPanel({ preferences, messages, onSavePreferences }: DeepWorkPanelProps) {
  const [durationInput, setDurationInput] = useState<number>(30);
  const [mcpContextInput, setMcpContextInput] = useState<string>(preferences.mcpContext || 'Editing server.ts in vscode-project-x');
  const [mcpActive, setMcpActive] = useState<boolean>(preferences.mcpActive);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Countdowns
  useEffect(() => {
    if (!preferences.deepWorkActive || !preferences.focusEndTime) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const difference = new Date(preferences.focusEndTime!).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft('00:00 - Complete!');
        clearInterval(interval);
        // Automatically release in a production scenario, but keep state for user view
      } else {
        const minutes = Math.floor((difference % 3600000) / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [preferences.deepWorkActive, preferences.focusEndTime]);

  const handleStartFocus = async () => {
    await onSavePreferences({
      deepWorkActive: true,
      focusDurationMinutes: durationInput,
      mcpContext: mcpContextInput,
      mcpActive: mcpActive
    });
  };

  const handleStopFocus = async () => {
    await onSavePreferences({
      deepWorkActive: false,
      focusDurationMinutes: 0
    });
  };

  const handleMcpToggle = async (active: boolean) => {
    setMcpActive(active);
    if (preferences.deepWorkActive) {
      await onSavePreferences({
        mcpActive: active,
        mcpContext: mcpContextInput
      });
    }
  };

  // Filter messages based on status
  const queuedMessages = messages.filter(m => m.shieldStatus === 'queued');
  const allowedHighMessages = messages.filter(m => m.shieldStatus === 'allowed');

  // IDE Preset Context configurations
  const contextPresets = [
    'Editing server.ts in vscode-project-x',
    'Updating Auth controller and connections inside express-api',
    'Refactoring Landing Page component inside react-web-app',
    'Configuring webpack bundler output files'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="deepwork-panel">
      {/* Settings Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              preferences.deepWorkActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">Focus Shield Configurations</h3>
              <p className="text-[10px] text-gray-400">Manage deep-work locks and smart notification interceptors.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Countdown / Status display */}
            {preferences.deepWorkActive ? (
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-col items-center justify-center text-center animate-pulse-slow">
                <ShieldCheck className="w-8 h-8 text-indigo-600 mb-1" />
                <span className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider">Shield Defense Active</span>
                <span className="text-3xl font-bold text-gray-900 font-mono tracking-tight mt-1">
                  {timeLeft || '00:00'}
                </span>
                <p className="text-[11px] text-indigo-600 mt-2 max-w-[240px]">
                  All casual chatter, reminders, and low priority DMs are queued. High priority filters remain operational.
                </p>

                <button
                  onClick={handleStopFocus}
                  className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Square className="w-3.5 h-3.5" />
                  Terminate Focus Block
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Block duration selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Shield Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setDurationInput(mins)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          durationInput === mins
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* MCP Server Context Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                    MCP Workspace Context (Simulator)
                  </label>
                  <input
                    type="text"
                    value={mcpContextInput}
                    onChange={(e) => setMcpContextInput(e.target.value)}
                    placeholder="Enter IDE activity status..."
                    className="w-full text-xs bg-gray-50 border border-gray-150 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-indigo-300 font-medium text-gray-700 transition-all"
                  />
                  
                  {/* Preset helpers */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {contextPresets.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMcpContextInput(p)}
                        className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded px-2 py-1 line-clamp-1 text-left max-w-full cursor-pointer font-medium"
                      >
                        Preset {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intelligent Toggle: Enable MCP Server Bypass */}
                <div className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">MCP Smart Bypass</span>
                      <span className="text-[10px] text-gray-400">Stream IDE file context to Slack for smart bypasses.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMcpToggle(!mcpActive)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors focus:outline-none relative cursor-pointer ${
                      mcpActive ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        mcpActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleStartFocus}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Play className="w-4 h-4 text-indigo-200" />
                  Initiate Shield Defense
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Explain Shield Rationale */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-gray-900 text-xs tracking-tight mb-3 flex items-center gap-1">
            <Cpu className="w-4 h-4 text-indigo-500" /> MCP Shielding Architecture
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            SlackEnabler utilizes Model Context Protocol (MCP) servers. When active, it monitors open files and compiler logs on your local machine. If an urgent alert pertains to your current code lines, it bypasses the silent shield automatically, notifying you instantly.
          </p>
        </div>
      </div>

      {/* Intercepted Queue */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-2">
                Shielded Message Queue
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  {queuedMessages.length} Intercepted
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Non-urgent notifications quarantined during active focus block.</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {queuedMessages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Queue is Clear</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                  No notifications are currently trapped by the shield defense. Feel free to use the simulator on the side to trigger chatter!
                </p>
              </motion.div>
            ) : (
              <motion.div key="list" className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {queuedMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl relative"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-8 h-8 rounded-full border bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-800">@{msg.user}</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                              #{msg.channel}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-100 font-medium line-clamp-2">
                          {msg.text}
                        </p>
                        <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>Buffered under Deep Work Rule.</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Allowed logs of high alerts during Deep Work */}
          {allowedHighMessages.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-50">
              <h4 className="font-bold text-gray-900 text-xs tracking-tight mb-3 flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-4 h-4" /> Allowed Critical Breakthroughs
              </h4>
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {allowedHighMessages.map(msg => (
                  <div key={msg.id} className="p-2.5 bg-amber-50/50 border border-amber-150 rounded-xl flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2 line-clamp-1">
                      <span className="font-bold shrink-0">@{msg.user}:</span>
                      <span className="truncate italic">"{msg.text}"</span>
                    </div>
                    <span className="shrink-0 bg-amber-100 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded">
                      Allowed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
