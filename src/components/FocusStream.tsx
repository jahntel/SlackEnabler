import React, { useState } from 'react';
import { SlackMessage } from '../types';
import { AlertCircle, ArrowRight, ShieldCheck, Sparkles, MessageSquare, Terminal, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface FocusStreamProps {
  messages: SlackMessage[];
  onReply: (messageText: string) => void;
}

export default function FocusStream({ messages, onReply }: FocusStreamProps) {
  const [selectedExpl, setSelectedExpl] = useState<string | null>(null);
  const [replies, setReplies] = useState<{ [key: string]: string }>({});
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  // We show "high" priority messages as the core of the Focus Stream.
  // Neutral messages that are code-related/PR reviews also flow here if requested,
  // let's show High Priority messages and allow standard neutral ones to be toggled!
  const [showNeutral, setShowNeutral] = useState(true);

  const focusMessages = messages.filter(
    (m) => m.priority === 'high' || (showNeutral && m.priority === 'neutral')
  );

  const handleSendReply = (msgId: string) => {
    const text = replies[msgId];
    if (!text?.trim()) return;
    onReply(`Replying to @${messages.find(m => m.id === msgId)?.user}: ${text}`);
    setReplies(prev => ({ ...prev, [msgId]: '' }));
  };

  const toggleResolve = (msgId: string) => {
    if (resolvedIds.includes(msgId)) {
      setResolvedIds(prev => prev.filter(id => id !== msgId));
    } else {
      setResolvedIds(prev => [...prev, msgId]);
    }
  };

  return (
    <div className="space-y-6" id="focus-stream-panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            Focus Stream
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Intelligent neural feed streaming blocker alerts & development PR queries instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Filter:</span>
          <button
            onClick={() => setShowNeutral(!showNeutral)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              showNeutral
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {showNeutral ? 'Showing All Primary Tasks' : 'High Priority Alerts Only'}
          </button>
        </div>
      </div>

      {focusMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl text-center px-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 text-base">Serene Workspace Atmosphere</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            Zero pending blockers or outage alerts in your stream. All quiet on the Slack Sentinel front.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {focusMessages.map((msg, index) => {
            const isHigh = msg.priority === 'high';
            const isResolved = resolvedIds.includes(msg.id);
            const showMcpBadge = msg.relevantMcpContext && msg.shieldStatus === 'allowed';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group relative bg-white border rounded-2xl transition-all duration-200 ${
                  isResolved 
                    ? 'border-gray-200 opacity-60' 
                    : isHigh
                    ? 'border-rose-100 shadow-[0_4px_20px_rgba(244,63,94,0.03)] hover:border-rose-200'
                    : 'border-indigo-100 shadow-[0_4px_20px_rgba(99,102,241,0.02)] hover:border-indigo-200'
                }`}
                id={`focus-item-${msg.id}`}
              >
                {/* Visual side bar tag */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                    isResolved
                      ? 'bg-gray-300'
                      : isHigh
                      ? 'bg-rose-500'
                      : 'bg-indigo-500'
                  }`}
                />

                <div className="p-5 pl-7">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-9 h-9 rounded-full bg-gray-100 border border-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">@{msg.user}</span>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                            #{msg.channel}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{msg.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {showMcpBadge && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          <Terminal className="w-3 h-3" />
                          MCP Bypass
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          isResolved
                            ? 'bg-gray-100 border border-gray-200 text-gray-500'
                            : isHigh
                            ? 'bg-rose-50 border border-rose-100 text-rose-700'
                            : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                        }`}
                      >
                        {isResolved ? 'Resolved' : isHigh ? 'Critical Alert' : 'Active Flow'}
                      </span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="mt-3">
                    <p className={`text-sm leading-relaxed ${isResolved ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
                      {msg.text}
                    </p>
                  </div>

                  {/* Classification rationale banner */}
                  <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-gray-500">INTENT:</span>{' '}
                        <span className="text-xs font-semibold text-gray-700 uppercase">{msg.intent}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedExpl(selectedExpl === msg.id ? null : msg.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-all focus:outline-none cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {selectedExpl === msg.id ? 'Hide reasoning' : 'View AI audit logic'}
                    </button>
                  </div>

                  {/* Expanding AI Audit Rationale */}
                  {selectedExpl === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-xs text-indigo-950 leading-relaxed"
                    >
                      <span className="font-bold block text-indigo-800 mb-1">SlackEnabler Classifier Logic:</span>
                      {msg.explanation}
                      {msg.relevantMcpContext && (
                        <div className="mt-2 pt-2 border-t border-indigo-100/60 font-mono text-[10px] text-amber-800 flex items-center gap-1">
                          <Terminal className="w-3 h-3 shrink-0" />
                          <span>{msg.relevantMcpContext}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Thread Action Row */}
                  <div className="mt-5 pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={`Coordinate reply to @${msg.user}...`}
                        value={replies[msg.id] || ''}
                        onChange={(e) => setReplies(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendReply(msg.id);
                        }}
                        disabled={isResolved}
                        className="w-full text-xs bg-gray-50 border border-gray-100 focus:border-indigo-300 focus:bg-white rounded-xl py-2.5 pl-3 pr-10 focus:outline-none text-gray-800 font-medium transition-all duration-200 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleSendReply(msg.id)}
                        disabled={isResolved || !replies[msg.id]?.trim()}
                        className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-100 disabled:text-gray-300 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => toggleResolve(msg.id)}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isResolved
                            ? 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
                            : 'bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isResolved ? 'Re-open Alert' : 'Mark Fixed'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
