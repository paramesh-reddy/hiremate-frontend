import { useState, useRef, useEffect, useLayoutEffect, memo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { getChatHistoryAPI, sendChatMessageAPI } from '../../services/chatService';
import brain_logo from '../../assets/brain_logo.png';

const STARTERS = [
  { icon: '📭', text: "Which companies haven't replied?" },
  { icon: '📅', text: 'How many interviews this month?' },
  { icon: '🔔', text: 'Which applications need follow-up?' },
  { icon: '📈', text: "What's my response rate?" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Inline SVG icons (no external dependency)
───────────────────────────────────────────────────────────────────────────── */
const IconBot = () => (
  <img 
    src={brain_logo} 
    alt="AI" 
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain',
      display: 'block' 
    }} 
  />
);

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconChat = () => (
  <img 
    src={brain_logo} 
    alt="Chat" 
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'contain',
      display: 'block' 
    }} 
  />
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Skeleton shimmer for history loading
───────────────────────────────────────────────────────────────────────────── */
function MessageSkeleton({ align = 'left' }) {
  const isRight = align === 'right';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isRight ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: 10,
      padding: '2px 0',
    }}>
      {!isRight && (
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--grey-5)', flexShrink: 0, animation: 'chatShimmer 1.5s ease-in-out infinite' }} />
      )}
      <div style={{
        height: 42,
        width: isRight ? '55%' : '68%',
        borderRadius: isRight ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isRight
          ? 'linear-gradient(90deg, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.08) 50%, rgba(37,99,235,0.18) 100%)'
          : 'linear-gradient(90deg, var(--grey-5) 0%, #e8eaf0 50%, var(--grey-5) 100%)',
        backgroundSize: '200% 100%',
        animation: 'chatShimmer 1.5s ease-in-out infinite',
        animationDelay: isRight ? '0.3s' : '0s',
      }} />
      {isRight && (
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--grey-5)', flexShrink: 0, animation: 'chatShimmer 1.5s ease-in-out infinite', animationDelay: '0.5s' }} />
      )}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MessageSkeleton align="left" />
      <MessageSkeleton align="right" />
      <MessageSkeleton align="left" />
      <MessageSkeleton align="right" />
      <MessageSkeleton align="left" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Thinking animation
───────────────────────────────────────────────────────────────────────────── */
function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}
    >
      <div style={{ ...aiBotAvatar }}>
        <IconBot />
      </div>
      <div style={{
        padding: '14px 18px',
        borderRadius: '4px 18px 18px 18px',
        background: 'var(--bg-paper)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'var(--primary)',
              animation: 'chatDot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared avatar styles
───────────────────────────────────────────────────────────────────────────── */
const aiBotAvatar = {
  width: 32, height: 32,
  borderRadius: 10,
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
};

const userAvatar = {
  width: 32, height: 32,
  borderRadius: 10,
  background: 'var(--grey-5)',
  border: '1px solid var(--border-color)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
  color: 'var(--text-muted)',
};

/* ─────────────────────────────────────────────────────────────────────────────
   Message bubbles
───────────────────────────────────────────────────────────────────────────── */
function UserBubble({ content }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10 }}
    >
      <div style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: '18px 4px 18px 18px',
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        color: 'white',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.55,
        boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
      }}>
        {content}
      </div>
      <div style={userAvatar}>
        <IconUser />
      </div>
    </motion.div>
  );
}

function AIBubble({ content }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}
    >
      <div style={aiBotAvatar}>
        <IconBot />
      </div>
      <div style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: '4px 18px 18px 18px',
        background: 'var(--bg-paper)',
        border: '1px solid var(--border-color)',
        fontSize: 14,
        fontWeight: 450,
        lineHeight: 1.6,
        color: 'var(--text-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p style={{ margin: 0, marginBottom: 6, lineHeight: 1.6 }}>{children}</p>
            ),
            'p:last-child': ({ children }) => (
              <p style={{ margin: 0, lineHeight: 1.6 }}>{children}</p>
            ),
            strong: ({ children }) => (
              <strong style={{ fontWeight: 700, color: 'var(--primary)' }}>{children}</strong>
            ),
            ul: ({ children }) => (
              <ul style={{ margin: '6px 0', paddingLeft: 18 }}>{children}</ul>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: 3, lineHeight: 1.5 }}>{children}</li>
            ),
            code: ({ children }) => (
              <code style={{
                background: 'var(--grey-5)',
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 12.5,
                fontFamily: 'monospace',
                color: 'var(--primary)',
              }}>{children}</code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Empty / welcome state
───────────────────────────────────────────────────────────────────────────── */
function EmptyState({ onPickStarter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: '16px 8px', gap: 0,
      }}
    >
      {/* Glassy icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 32px rgba(37,99,235,0.3), 0 0 0 1px rgba(37,99,235,0.15)',
        marginBottom: 20,
        position: 'relative',
      }}>
        <IconBot />
        {/* sparkle badge */}
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 22, height: 22, borderRadius: 8,
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
          boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
        }}>
          <IconSparkle />
        </div>
      </div>

      <p style={{
        margin: 0, marginBottom: 6,
        fontSize: 17, fontWeight: 800,
        color: 'var(--text-primary)', letterSpacing: '-0.3px',
      }}>
        Hi, I'm your Job Coach
      </p>
      <p style={{
        margin: 0, marginBottom: 24,
        fontSize: 13, fontWeight: 450,
        color: 'var(--text-muted)', textAlign: 'center',
        lineHeight: 1.6, maxWidth: 260,
      }}>
        Ask me anything about your applications, timelines, or what to do next.
      </p>

      {/* Starter chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {STARTERS.map(({ icon, text }) => (
          <button
            key={text}
            onClick={() => onPickStarter(text)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-paper)',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.15s ease',
              fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(37,99,235,0.04)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'var(--bg-paper)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
            }}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span>{text}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.4, fontSize: 16 }}>→</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Widget
───────────────────────────────────────────────────────────────────────────── */
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const qc = useQueryClient();

  const { data: serverMessages = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => getChatHistoryAPI().then(res => res.data),
    enabled: isOpen,
    staleTime: 0,
  });

  const allMessages = [...serverMessages, ...optimisticMessages];

  const sendMutation = useMutation({
    mutationFn: text => sendChatMessageAPI(text).then(res => res.data),
    onSuccess: () => {
      setOptimisticMessages([]);
      qc.invalidateQueries({ queryKey: ['chatHistory'] });
      // Refocus after AI finishes responding
      setTimeout(() => textareaRef.current?.focus(), 50);
    },
    onError: () => {
      setOptimisticMessages([]);
      setTimeout(() => textareaRef.current?.focus(), 50);
    },
  });

  const isSending = sendMutation.isPending;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, isSending, isOpen]);

  // Auto-focus textarea when panel opens — wait for framer-motion spring to settle
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        textareaRef.current?.focus();
      }, 250);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 112) + 'px';
  }, [input]);

  // Double rAF + timeout ensures focus fires after React flush & browser paint
  const focusTextarea = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    });
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setOptimisticMessages([{ role: 'user', content: trimmed, id: `opt-${Date.now()}` }]);
    setInput('');
    sendMutation.mutate(trimmed);
    // Refocus happens after isSending becomes false (in onSuccess/onError)
  };

  const handlePickStarter = (text) => {
    setInput(text);
    focusTextarea();
  };

  return (
    <>
      {/* ── Global keyframes ─────────────────────────────────────────── */}
      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatShimmer {
          0%   { background-position: -200% center; opacity: 0.8; }
          100% { background-position:  200% center; opacity: 0.8; }
        }
        @keyframes chatSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .chat-textarea::placeholder { color: var(--placeholder); }
        .chat-textarea:focus { outline: none; }
        .chat-starter-btn:hover { background: rgba(37,99,235,0.05); }
        .chat-md p:last-child { margin-bottom: 0 !important; }
      `}</style>

      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>

        {/* ── Chat Panel ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              style={{ marginBottom: 12 }}
            >
              <div style={{
                width: 400,
                height: 580,
                maxHeight: 'calc(100vh - 110px)',
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(37,99,235,0.08), 0 0 0 1px rgba(37,99,235,0.06)',
              }}>

                {/* Header */}
                <div style={{
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Avatar with glow */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}>
                      {isSending ? (
                        <div style={{ animation: 'chatSpin 1s linear infinite', display: 'flex' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                          </svg>
                        </div>
                      ) : (
                        <IconBot />
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.2px' }}>
                        OpsBrain AI
                      </p>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={isSending ? 'thinking' : isHistoryLoading ? 'loading' : 'online'}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.18 }}
                          style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            display: 'inline-block',
                            background: isSending ? '#fbbf24' : isHistoryLoading ? '#94a3b8' : '#4ade80',
                            animation: (isSending || isHistoryLoading) ? 'chatShimmer 1s ease-in-out infinite' : 'none',
                            boxShadow: isSending ? '0 0 6px #fbbf24' : isHistoryLoading ? 'none' : '0 0 6px #4ade80',
                            flexShrink: 0,
                          }} />
                          {isSending ? 'Thinking…' : isHistoryLoading ? 'Loading history…' : 'Online · Job Coach'}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      color: 'white', cursor: 'pointer',
                      width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                      backdropFilter: 'blur(4px)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                  >
                    <IconX />
                  </button>
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: 'auto',
                  padding: '20px 18px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-color) transparent',
                  background: 'var(--bg-light)',
                }}>
                  {isHistoryLoading ? (
                    <HistorySkeleton />
                  ) : allMessages.length === 0 && !isSending ? (
                    <EmptyState onPickStarter={handlePickStarter} />
                  ) : (
                    <>
                      {allMessages.map((msg, i) =>
                        msg.role === 'user'
                          ? <UserBubble key={msg.id ?? i} content={msg.content} />
                          : <AIBubble key={msg.id ?? i} content={msg.content} />
                      )}
                      <AnimatePresence>
                        {isSending && <ThinkingBubble key="thinking" />}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div style={{
                  padding: '10px 14px 12px',
                  borderTop: '1px solid var(--border-color)',
                  background: 'var(--bg-paper)',
                  flexShrink: 0,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-end', gap: 8,
                    background: isFocused ? 'var(--bg-paper)' : 'var(--bg-light)',
                    borderRadius: 14,
                    padding: '8px 8px 8px 14px',
                    border: `1.5px solid ${isFocused ? 'var(--primary)' : 'var(--border-color)'}`,
                    boxShadow: isFocused ? '0 0 0 3px rgba(37,99,235,0.07)' : '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
                  }}>
                    <textarea
                      className="chat-textarea"
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      readOnly={isSending}
                      onChange={e => setInput(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={isSending ? 'Waiting for response…' : 'Ask about your applications…'}
                      style={{
                        flex: 1, border: 'none', background: 'transparent',
                        resize: 'none', fontFamily: 'var(--font-family)',
                        fontSize: 13.5, fontWeight: 400,
                        color: 'var(--text-primary)',
                        padding: '4px 0',
                        lineHeight: 1.6,
                        maxHeight: 112, overflowY: 'auto',
                        scrollbarWidth: 'none',
                        opacity: isSending ? 0.55 : 1,
                        transition: 'opacity 0.18s',
                        cursor: isSending ? 'default' : 'text',
                      }}
                    />
                    <motion.button
                      onClick={handleSend}
                      // preventDefault on mousedown stops the button from stealing
                      // focus from the textarea on click
                      onMouseDown={e => e.preventDefault()}
                      disabled={!input.trim() || isSending}
                      whileHover={input.trim() && !isSending ? { scale: 1.06 } : {}}
                      whileTap={input.trim() && !isSending ? { scale: 0.92 } : {}}
                      style={{
                        width: 34, height: 34, borderRadius: 10,
                        border: 'none',
                        cursor: input.trim() && !isSending ? 'pointer' : 'not-allowed',
                        background: input.trim() && !isSending
                          ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                          : 'transparent',
                        color: input.trim() && !isSending ? 'white' : 'var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.18s ease',
                        boxShadow: input.trim() && !isSending
                          ? '0 3px 10px rgba(37,99,235,0.28)'
                          : 'none',
                      }}
                    >
                      {isSending ? (
                        <div style={{ animation: 'chatSpin 0.9s linear infinite', display: 'flex', opacity: 0.5 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                          </svg>
                        </div>
                      ) : (
                        <IconSend />
                      )}
                    </motion.button>
                  </div>
                  <p style={{
                    margin: '7px 0 0', textAlign: 'center',
                    fontSize: 10, color: 'var(--placeholder)',
                    letterSpacing: '0.03em', opacity: 0.6,
                  }}>
                    AI responses may not be fully accurate
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FAB Button ───────────────────────────────────────────────── */}
        <motion.button
          onClick={() => setIsOpen(o => !o)}
          animate={isOpen ? {} : {
            boxShadow: [
              '0 8px 28px rgba(37,99,235,0.35)',
              '0 8px 36px rgba(37,99,235,0.5)',
              '0 8px 28px rgba(37,99,235,0.35)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: 56, height: 56, borderRadius: 18,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #7c3aed 100%)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(37,99,235,0.4)',
            position: 'relative',
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ opacity: 0, rotate: -90, scale: 0.6 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0.6 }} transition={{ duration: 0.2 }}>
                <IconX />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0, rotate: 90, scale: 0.6 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: -90, scale: 0.6 }} transition={{ duration: 0.2 }}>
                <IconChat />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Pulse ring when closed */}
          {!isOpen && (
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
              style={{
                position: 'absolute', inset: 0, borderRadius: 18,
                border: '2px solid rgba(37,99,235,0.5)',
                pointerEvents: 'none',
              }}
            />
          )}
        </motion.button>
      </div>
    </>
  );
}

export default memo(ChatWidget);
