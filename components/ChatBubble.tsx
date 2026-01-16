
import React from 'react';
import { Message, MessageRole, Language } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  language: Language;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, language }) => {
  const isBot = message.role === MessageRole.MODEL;
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown-ish line break handling
  const formattedContent = message.content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

  const isRtl = /[\u0600-\u06FF]/.test(message.content);

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isBot ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm 
          ${isBot ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'}`}>
          {isBot ? <Bot size={22} /> : <User size={22} />}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className={`relative px-5 py-4 rounded-3xl shadow-sm text-sm md:text-base leading-relaxed
            ${isBot 
              ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'}
            ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
            {formattedContent}

            {isBot && (
              <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all text-slate-400"
                title="Copy message"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            )}
          </div>
          <span className={`text-[10px] text-slate-400 px-2 ${isBot ? 'text-left' : 'text-right'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
