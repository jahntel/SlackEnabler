import React, { useState } from 'react';
import { SlackChannel, CatchUpTimeline, SlackMessage } from '../types';
import { Sparkles, Calendar, Clock, MessageSquarePlus, ChevronRight, FileText, CheckCircle, Terminal, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimelineGeneratorProps {
  channels: SlackChannel[];
  messages: SlackMessage[];
  timelines: CatchUpTimeline[];
  onGenerate: (channelName: string) => Promise<CatchUpTimeline>;
}

export default function TimelineGenerator({ channels, messages, timelines, onGenerate }: TimelineGeneratorProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>(channels[0]?.name || 'general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<CatchUpTimeline | null>(timelines[0] || null);
  const [error, setError] = useState<string | null>(null);

  const getBacklogCount = (chanName: string) => {
    return messages.filter((m) => m.channel === chanName).length;
  };

  const handleGenerate = async () => {
    const msgCount = getBacklogCount(selectedChannel);
    if (msgCount === 0) {
      setError(`There are no messages in #${selectedChannel} to compile into a timeline. Try sending some messages in the simulator first!`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const generated = await onGenerate(selectedChannel);
      setActiveTimeline(generated);
    } catch (e) {
      console.error(e);
      setError('Failed to generate AI timeline. Please verify server connection or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Highly robust and custom Tailwind-styled Markdown parsing helper to keep build lightweight
  const parseMarkdownToJSX = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    let insideList = false;

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('###')) {
        insideList = false;
        const headingText = trimmed.replace(/^###\s*/, '');
        // Determine theme based on emoji
        let bgStyle = 'bg-indigo-50 border-indigo-200 text-indigo-900';
        if (trimmed.includes('🚨')) {
          bgStyle = 'bg-rose-50 border-rose-200 text-rose-900';
        } else if (trimmed.includes('💬')) {
          bgStyle = 'bg-blue-50 border-blue-200 text-blue-900';
        } else if (trimmed.includes('🛠️') || trimmed.includes('✅')) {
          bgStyle = 'bg-emerald-50 border-emerald-200 text-emerald-900';
        }

        return (
          <div key={idx} className={`mt-6 mb-3 px-3 py-2 border rounded-xl font-bold text-sm tracking-wide uppercase flex items-center gap-2 ${bgStyle}`}>
            {headingText}
          </div>
        );
      }

      // Bullets
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        insideList = true;
        let bulletContent = trimmed.replace(/^[-*]\s*/, '');
        // Highlight inline bold formatting **text**
        const parts = bulletContent.split('**');
        const formatted = parts.map((part, i) => {
          if (i % 2 === 1) {
            return <strong key={i} className="text-gray-900 font-bold">{part}</strong>;
          }
          return part;
        });

        return (
          <li key={idx} className="ml-4 pl-1 list-disc text-sm text-gray-700 leading-relaxed py-1">
            {formatted}
          </li>
        );
      }

      // Empty Lines
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraphs
      insideList = false;
      const parts = trimmed.split('**');
      const formatted = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="text-gray-900 font-bold">{part}</strong>;
        }
        return part;
      });

      return (
        <p key={idx} className="text-sm text-gray-600 leading-relaxed my-2">
          {formatted}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="timeline-panel">
      {/* Sidebar: Channel selector and past timelines */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm tracking-tight mb-4">Backlogged Channels</h3>
          
          <div className="space-y-2">
            {channels.map((chan) => {
              const count = getBacklogCount(chan.name);
              const isSelected = selectedChannel === chan.name;

              return (
                <button
                  key={chan.id}
                  onClick={() => {
                    setSelectedChannel(chan.name);
                    setError(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-medium'
                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold">#{chan.name}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{chan.description}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      count > 0
                        ? isSelected
                          ? 'bg-indigo-200 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {count} messages
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white disabled:text-gray-400 font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Catch-Up...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>AI Catch-Me-Up Timeline</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* History of summaries */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm tracking-tight mb-4">Historical Summaries</h3>
          {timelines.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-4">No timelines generated yet.</p>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {timelines.map((t) => {
                const isActive = activeTimeline?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTimeline(t)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/50 border-indigo-150 text-indigo-900'
                        : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-semibold line-clamp-1">{t.title}</h4>
                        <span className="text-[10px] text-gray-400">{t.generatedAt}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Panel: Selected Timeline Display */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm h-full min-h-[400px]"
            >
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <h3 className="font-semibold text-gray-900 text-base">Assembling Context Clues...</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1.5 leading-relaxed">
                SlackEnabler is fetching backlogged message threads, analyzing chronological event transitions, and formatting them beautifully. Please wait.
              </p>
              
              {/* Intelligent loading state text loop */}
              <div className="mt-8 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 font-mono flex items-center gap-1.5 animate-pulse">
                <Terminal className="w-3.5 h-3.5" />
                <span>Parsing #{selectedChannel} logs & compiling digests...</span>
              </div>
            </motion.div>
          ) : activeTimeline ? (
            <motion.div
              key={activeTimeline.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{activeTimeline.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {activeTimeline.generatedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Compiled from {activeTimeline.sourceMessageCount} messages
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Timeline Active
                  </span>
                </div>
              </div>

              {/* Scrollable Timeline Output Container */}
              <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl max-h-[500px] overflow-y-auto">
                <div className="timeline-content prose prose-sm max-w-none">
                  {parseMarkdownToJSX(activeTimeline.content)}
                </div>
              </div>

              {/* Explanatory architectural helper */}
              <div className="mt-5 p-3 bg-amber-50/40 border border-amber-200/50 rounded-xl flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p>
                  <strong>How it's built:</strong> The catch-up engine clusters chronologically correlated Slack conversations. In standard production pipelines, this utilizes Slack AI's <strong>Channel Summaries API</strong> combined with Gemini to map discussions into the requested layout context.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm h-full min-h-[400px]">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Select or Generate a Timeline</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1 leading-relaxed">
                Choose a slack channel on the left and click the <strong>AI Catch-Me-Up Timeline</strong> button to synthesize logs instantly!
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
