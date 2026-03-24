'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface CVInfo {
  name: string;
  title: string;
  avatar: string;
}

const buildWelcome = (name: string): Message => ({
  role: 'model',
  content: `Hi! I'm ${name}. Welcome to my portfolio — feel free to browse my CV and projects. Got any questions? I'm happy to answer!`,
});

interface Theme {
  panel: string;
  panelStyle?: React.CSSProperties;
  headerStyle: React.CSSProperties;
  headerBorder: string;
  titleColor: string;
  subtitleColor: string;
  closeBtn: string;
  botBubble: string;
  botBubbleStyle?: React.CSSProperties;
  userBubble: string;
  userBubbleStyle: React.CSSProperties;
  loadingBubble: string;
  loadingBubbleStyle?: React.CSSProperties;
  footer: string;
  footerStyle?: React.CSSProperties;
  textarea: string;
  footer_note: string;
}

const HEADER_GRADIENT: React.CSSProperties = {
  background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
};
const USER_BUBBLE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
};

const glassTheme: Theme = {
  panel: '',
  panelStyle: {
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
  },
  headerStyle: {
    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35)',
  },
  headerBorder: 'border-b border-white/15',
  titleColor: 'text-white',
  subtitleColor: 'text-white/80',
  closeBtn: 'text-white/60 hover:bg-white/20 hover:text-white focus-visible:ring-white',
  botBubble: 'text-slate-700',
  botBubbleStyle: {
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.60) 100%)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: 'inset -2px -2px 1px rgba(0, 0, 0, 0.08)',
  },
  userBubble: 'text-white',
  userBubbleStyle: USER_BUBBLE_STYLE,
  loadingBubble: 'text-white/50',
  loadingBubbleStyle: {
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  footer: 'border-t border-white/15',
  footerStyle: {
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  textarea:
    'border-white/20 bg-white/10 text-white placeholder-white/30 focus:border-white/40 focus:ring-white/20',
  footer_note: 'text-white/30',
};

const clayTheme: Theme = {
  panel: 'border border-slate-200/60',
  panelStyle: {
    background: 'linear-gradient(135deg, #e8edf2 0%, #f0f4f8 100%)',
    boxShadow: '6px 6px 14px #c5c5c5, -3px -3px 10px #ffffff',
  },
  headerStyle: HEADER_GRADIENT,
  headerBorder: '',
  titleColor: 'text-white',
  subtitleColor: 'text-white/80',
  closeBtn: 'text-white/70 hover:bg-white/20 hover:text-white focus-visible:ring-white',
  botBubble: 'text-slate-700',
  botBubbleStyle: {
    background: 'linear-gradient(135deg, #e8edf2 0%, #dfe7ed 100%)',
    boxShadow: '2px 2px 5px #c5c5c5, -1px -1px 4px #ffffff, inset -1px -1px 1px #8a8a8a44',
  },
  userBubble: 'text-white',
  userBubbleStyle: USER_BUBBLE_STYLE,
  loadingBubble: 'text-slate-400',
  loadingBubbleStyle: {
    background: 'linear-gradient(135deg, #e8edf2 0%, #dfe7ed 100%)',
    boxShadow: '2px 2px 5px #c5c5c5, -1px -1px 4px #ffffff',
  },
  footer: 'border-t border-slate-200/60',
  footerStyle: { background: 'linear-gradient(135deg, #e8edf2 0%, #f0f4f8 100%)' },
  textarea:
    'border-slate-300/60 bg-white/70 text-slate-800 placeholder-slate-400/60 focus:border-emerald-500/50 focus:ring-emerald-500/50',
  footer_note: 'text-slate-400/60',
};

function renderWithLinks(text: string, linkClass: string): React.ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className={`break-all underline ${linkClass}`}
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export default function ChatWidget() {
  const pathname = usePathname();
  const isGlass =
    pathname?.startsWith('/projects') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/not-found');
  const t = isGlass ? glassTheme : clayTheme;

  const [isOpen, setIsOpen] = useState(false);
  // showPanel keeps DOM mounted during close animation; isAnimated drives CSS transition
  const [showPanel, setShowPanel] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  // Mobile sheet mode: narrow screen OR short screen (landscape phone)
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile sheet mode on mount and resize
  useEffect(() => {
    const check = () => setIsMobileSheet(window.innerWidth < 640 || window.innerHeight < 520);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetch('/api/cv-data')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const info: CVInfo = {
          name: data.personalInfo?.name ?? 'Aleksandr',
          title: data.personalInfo?.title ?? 'Software Engineer',
          avatar: data.personalInfo?.avatar ?? '',
        };
        setCvInfo(info);
        setMessages([buildWelcome(info.name)]);
      })
      .catch(() => {
        const fallback: CVInfo = { name: 'Aleksandr', title: 'Software Engineer', avatar: '' };
        setCvInfo(fallback);
        setMessages([buildWelcome(fallback.name)]);
      });
  }, []);

  useEffect(() => {
    if (isAnimated) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnimated]);

  useEffect(() => {
    if (isAnimated) setTimeout(() => inputRef.current?.focus(), 280);
  }, [isAnimated]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const handleOpen = () => {
    setShowBadge(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setShowPanel(true);
    setIsOpen(true);
    // next frame so panel is in DOM before transition starts
    requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimated(true)));
  };

  const handleClose = () => {
    setIsAnimated(false);
    setIsOpen(false);
    closeTimerRef.current = setTimeout(() => setShowPanel(false), 260);
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      const data: { reply?: string; error?: string } = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: data.reply ?? data.error ?? 'Something went wrong. Please try again.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Network error. Please check your connection.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const avatarUrl = Array.isArray(cvInfo?.avatar) ? cvInfo.avatar[0] : cvInfo?.avatar;

  return (
    <>
      {/* Floating trigger button — hidden while panel is open */}
      {!isOpen && (
        <div className="fixed right-6 bottom-6 z-50">
          <button
            onClick={handleOpen}
            aria-label="Chat with Aleksandr's AI assistant"
            className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[inset_-2px_-2px_1px_rgba(0,0,0,0.3),0_4px_14px_rgba(5,150,105,0.4)] transition-all duration-200 hover:scale-105 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)' }}
          >
            <MessageCircle size={22} />
            {showBadge && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-emerald-700 shadow">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat panel — animates from bottom-right (button origin) */}
      {showPanel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat with Aleksandr's AI assistant"
          className={`fixed z-50 flex flex-col overflow-hidden transition-all duration-250 ease-in-out ${
            isMobileSheet
              ? 'right-0 bottom-0 left-0 max-h-[85svh] w-full rounded-t-2xl rounded-b-none'
              : 'right-6 bottom-6 h-[460px] w-80 rounded-2xl'
          } ${t.panel} ${
            isAnimated
              ? 'scale-100 opacity-100'
              : `pointer-events-none scale-0 opacity-0 ${isMobileSheet ? 'origin-bottom' : 'origin-bottom-right'}`
          } `}
          style={{
            height: isAnimated ? undefined : undefined,
            ['--tw-shadow' as string]: 'none',
            ...t.panelStyle,
          }}
        >
          {/* Header */}
          <div
            className={`flex shrink-0 items-center gap-3 px-4 py-3 ${t.headerBorder}`}
            style={t.headerStyle}
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border-2 border-white/30">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={cvInfo?.name ?? 'Avatar'}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20 text-sm font-bold text-white">
                  {cvInfo?.name?.[0]?.toUpperCase() ?? 'A'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className={`truncate text-sm font-semibold ${t.titleColor}`}>
                {cvInfo?.name ?? 'Aleksandr'}
              </p>
              <p className={`text-xs ${t.subtitleColor}`}>{cvInfo?.title ?? 'Software Engineer'}</p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close chat"
              className={`ml-auto shrink-0 rounded p-1 transition-colors focus:outline-none focus-visible:ring-1 ${t.closeBtn}`}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? `rounded-br-sm ${t.userBubble}`
                      : `rounded-bl-sm ${t.botBubble}`
                  }`}
                  style={msg.role === 'user' ? t.userBubbleStyle : t.botBubbleStyle}
                >
                  {renderWithLinks(
                    msg.content,
                    msg.role === 'user'
                      ? 'text-white/90 hover:text-white'
                      : 'text-emerald-700 hover:text-emerald-800',
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={`flex items-center gap-2 rounded-2xl rounded-bl-sm px-3 py-2 text-sm ${t.loadingBubble}`}
                  style={t.loadingBubbleStyle}
                >
                  <Loader2 size={13} className="animate-spin" />
                  Thinking…
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className={`pb-safe-4 shrink-0 px-3 pt-2 pb-3 ${t.footer}`} style={t.footerStyle}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me something…"
                rows={1}
                disabled={isLoading}
                className={`flex-1 resize-none rounded-xl border px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:opacity-50 ${t.textarea}`}
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.3)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)' }}
              >
                <Send size={15} />
              </button>
            </div>
            <p className={`mt-1.5 text-center text-[10px] ${t.footer_note}`}>
              Powered by Gemini · Only answers about Aleksandr
            </p>
          </div>
        </div>
      )}
    </>
  );
}
