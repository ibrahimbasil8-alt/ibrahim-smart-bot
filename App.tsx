
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, Menu, Sparkles, Languages, HelpCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatBubble from './components/ChatBubble';
import { chatWithZaki } from './services/geminiService';
import { Message, MessageRole, ChatSession, Language, AppMode } from './types';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.GENERAL);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize first session
  useEffect(() => {
    const newId = uuidv4();
    const initialSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      lastUpdated: new Date()
    };
    setSessions([initialSession]);
    setCurrentSessionId(newId);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, scrollToBottom]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: MessageRole.USER,
      content: input,
      timestamp: new Date()
    };

    const tempInput = input;
    setInput('');
    setIsLoading(true);

    // Update session locally
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newMessages = [...s.messages, userMessage];
        return {
          ...s,
          messages: newMessages,
          title: s.messages.length === 0 ? tempInput.slice(0, 30) + '...' : s.title,
          lastUpdated: new Date()
        };
      }
      return s;
    }));

    try {
      // Prepare history for API
      const history = (currentSession?.messages || []).map(m => ({
        role: m.role === MessageRole.USER ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      const stream = await chatWithZaki(tempInput, history, mode);
      
      let botResponseId = uuidv4();
      let accumulatedText = "";

      // Add placeholder bot message
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, {
              id: botResponseId,
              role: MessageRole.MODEL,
              content: "",
              timestamp: new Date()
            }]
          };
        }
        return s;
      }));

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          accumulatedText += text;
          setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
              const updatedMessages = s.messages.map(m => 
                m.id === botResponseId ? { ...m, content: accumulatedText } : m
              );
              return { ...s, messages: updatedMessages };
            }
            return s;
          }));
        }
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: MessageRole.MODEL,
        content: "Sorry, I encountered an error. Please check your connection or try again later.",
        timestamp: new Date()
      };
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, errorMessage] };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    const newId = uuidv4();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      lastUpdated: new Date()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newId);
    setIsSidebarOpen(false);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id && updated.length > 0) {
      setCurrentSessionId(updated[0].id);
    } else if (updated.length === 0) {
      const newId = uuidv4();
      setSessions([{
        id: newId,
        title: 'New Conversation',
        messages: [],
        lastUpdated: new Date()
      }]);
      setCurrentSessionId(newId);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewChat}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={deleteSession}
        mode={mode}
        setMode={setMode}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-white/50">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                {mode === AppMode.GENERAL && <Sparkles size={16} className="text-indigo-500" />}
                {mode === AppMode.LEARNING && <HelpCircle size={16} className="text-orange-500" />}
                {mode === AppMode.BRAINSTORM && <Sparkles size={16} className="text-purple-500" />}
                {mode === AppMode.GENERAL ? 'Assistant' : mode === AppMode.LEARNING ? 'Learning' : 'Brainstorming'}
              </span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-xs font-medium text-slate-400">Zaki V1.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
              <Languages size={14} />
              Ar / En
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 space-y-6">
          {currentSession?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                <Sparkles size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-slate-800">
                  {mode === AppMode.LEARNING ? 'Let\'s Learn Something New!' : 'How can I help you today?'}
                </h2>
                <p className="text-slate-500 text-lg">
                  {mode === AppMode.LEARNING 
                    ? 'I can break down complex topics into simple steps. What do you want to master?'
                    : 'I\'m Zaki, your smart and friendly assistant. Ask me anything in Arabic or English!'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[
                  { q: "Explain quantum physics to a 5-year old", l: "EN" },
                  { q: "كيف أبدأ بتعلم البرمجة من الصفر؟", l: "AR" },
                  { q: "Brainstorm app ideas for climate change", l: "EN" },
                  { q: "اشرح لي فكرة 'المتوالية الهندسية' ببساطة", l: "AR" }
                ].map((s, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(s.q)}
                    className="p-4 bg-white border border-slate-100 rounded-2xl text-left text-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all shadow-sm group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-indigo-400 uppercase">{s.l}</span>
                      <Sparkles size={12} className="opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                    </div>
                    <p className={`text-slate-700 font-medium ${s.l === 'AR' ? 'rtl text-right' : ''}`}>{s.q}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentSession?.messages.map((m) => (
              <ChatBubble key={m.id} message={m} language={Language.EN} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 md:p-6 bg-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500`}></div>
            <div className="relative flex items-end gap-2 bg-white border border-slate-200 rounded-3xl p-2 shadow-xl shadow-slate-200/50">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={/([\u0600-\u06FF])/.test(input) ? "اسأل زكي أي شيء..." : "Ask Zaki anything..." }
                className={`flex-1 min-h-[48px] max-h-48 py-3 px-4 bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder-slate-400 text-base
                  ${/([\u0600-\u06FF])/.test(input) ? 'rtl text-right' : 'ltr text-left'}`}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${!input.trim() || isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95'}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <div className="mt-2 flex justify-center">
               <p className="text-[10px] text-slate-400 text-center px-4">
                Zaki AI provides smart assistance but may occasionally produce inaccurate information. Please verify important facts.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
