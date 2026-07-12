import React, { useState } from 'react';
import { Send, Sparkles, Terminal, ShieldAlert, Heart, RefreshCw, Layers } from 'lucide-react';
import { SlackChannel } from '../types';

interface SlackSandboxProps {
  channels: SlackChannel[];
  onSendMessage: (channel: string, user: string, text: string) => Promise<void>;
  onResetDatabase: () => Promise<void>;
}

export default function SlackSandbox({ channels, onSendMessage, onResetDatabase }: SlackSandboxProps) {
  const [selectedChannel, setSelectedChannel] = useState(channels[1]?.name || 'engineering-alerts');
  const [selectedUser, setSelectedUser] = useState('alex-infra');
  const [customText, setCustomText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const mockUsers = [
    { id: 'u1', username: 'alex-infra', label: 'Alex (Infrastructure Eng)', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alex' },
    { id: 'u2', username: 'jenny-dev', label: 'Jenny (Backend Software Eng)', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=jenny' },
    { id: 'u3', username: 'sam-marketing', label: 'Sam (Growth Marketing)', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sam' },
    { id: 'u4', username: 'boss-clark', label: 'Clark (Product Manager)', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=clark' },
    { id: 'u5', username: 'monitoring-daemon', label: 'AWS CloudWatch Bot', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=incident' },
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customText.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(selectedChannel, selectedUser, customText);
      setCustomText('');
    } catch (err) {
      console.error("Failed to send simulation message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const triggerPreset = async (presetType: 'outage' | 'meme' | 'pr' | 'lunch') => {
    if (isSending) return;
    setIsSending(true);

    let text = '';
    let user = 'alex-infra';
    let channel = 'general';

    switch (presetType) {
      case 'outage':
        text = '🚨 OUTAGE REPORT: production-db-replica-02 has lost replication lock! High transaction lag on server.ts has triggered 503 gateway timeouts for auth queries. Critical impact.';
        user = 'monitoring-daemon';
        channel = 'engineering-alerts';
        break;
      case 'meme':
        text = 'Look at this absolute gold of a dog meme explaining typescript generics to junior devs! 😂 Literally me on Monday. https://media.giphy.com/media/generic-dog.gif';
        user = 'sam-marketing';
        channel = 'random-chatter';
        break;
      case 'pr':
        text = 'Hey team, I just opened a pull request to resolve the high disk I/O load on the server.ts buffer. Please review PR #302: Optimizing database buffer blocks.';
        user = 'jenny-dev';
        channel = 'engineering-alerts';
        break;
      case 'lunch':
        text = 'Hey everybody! Grab your tacos in the break room, hot delivery is here. PM team ordered plenty of vegetarian and vegan options. Enjoy your break! 🌮';
        user = 'boss-clark';
        channel = 'random-chatter';
        break;
    }

    try {
      await onSendMessage(channel, user, text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await onResetDatabase();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 rounded-2xl p-5 shadow-lg border border-gray-800" id="slack-simulator">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="font-bold text-xs tracking-wider uppercase font-mono text-gray-300">Slack Sandbox Workspace</h3>
            <p className="text-[10px] text-gray-500 font-mono">Simulate real-time message events.</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset sandbox to default seed logs"
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        {/* Step 1: Pick Sender */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 font-mono mb-1.5 uppercase">1. Choose Sender</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full text-xs bg-gray-850 border border-gray-800 rounded-xl p-2.5 text-gray-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            {mockUsers.map((u) => (
              <option key={u.id} value={u.username}>
                @{u.username} ({u.label.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Pick Channel */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 font-mono mb-1.5 uppercase">2. Select Channel</label>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full text-xs bg-gray-850 border border-gray-800 rounded-xl p-2.5 text-gray-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            {channels.map((c) => (
              <option key={c.id} value={c.name}>
                #{c.name} {c.isMuted ? '(muted)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Write text */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 font-mono mb-1.5 uppercase">3. Compose Message</label>
          <div className="relative">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type simulated Slack message..."
              rows={3}
              className="w-full text-xs bg-gray-850 border border-gray-800 rounded-xl p-3 pb-10 text-gray-100 font-mono focus:outline-none focus:border-indigo-500 placeholder-gray-600 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              disabled={isSending || !customText.trim()}
              className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 text-white disabled:text-gray-600 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Scenario Presets */}
      <div className="mt-5 pt-4 border-t border-gray-800">
        <label className="block text-[10px] font-bold text-gray-500 font-mono mb-2 uppercase flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          4. Scenario Event Injectors
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => triggerPreset('outage')}
            disabled={isSending}
            className="text-left p-2 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/50 hover:border-rose-800/80 rounded-xl transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono font-bold text-rose-400 block group-hover:text-rose-300">Outage Alert</span>
            <span className="text-[8px] font-mono text-gray-500 block leading-tight mt-0.5">High Priority incident</span>
          </button>

          <button
            onClick={() => triggerPreset('pr')}
            disabled={isSending}
            className="text-left p-2 bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-900/50 hover:border-indigo-800/80 rounded-xl transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono font-bold text-indigo-400 block group-hover:text-indigo-300">PR Request</span>
            <span className="text-[8px] font-mono text-gray-500 block leading-tight mt-0.5">Refactoring connection lag</span>
          </button>

          <button
            onClick={() => triggerPreset('meme')}
            disabled={isSending}
            className="text-left p-2 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-750 rounded-xl transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono font-bold text-gray-300 block group-hover:text-white">Casual Meme</span>
            <span className="text-[8px] font-mono text-gray-500 block leading-tight mt-0.5">Low Priority chatter</span>
          </button>

          <button
            onClick={() => triggerPreset('lunch')}
            disabled={isSending}
            className="text-left p-2 bg-gray-800/50 hover:bg-gray-800/80 border border-gray-750 rounded-xl transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono font-bold text-gray-300 block group-hover:text-white">Lunch Delivery</span>
            <span className="text-[8px] font-mono text-gray-500 block leading-tight mt-0.5">Low priority social chatter</span>
          </button>
        </div>
      </div>

      {/* Simulator guide info */}
      <div className="mt-4 p-3 bg-indigo-950/35 border border-indigo-900/50 rounded-xl text-[9px] text-indigo-300 leading-normal font-mono flex items-start gap-1.5">
        <Layers className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
        <p>
          Each injected message will flow through the Express backend, invoking Gemini (or local classification fallback) before routing.
        </p>
      </div>
    </div>
  );
}
