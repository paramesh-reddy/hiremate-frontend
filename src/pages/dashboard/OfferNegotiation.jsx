import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, useTheme,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PageContainer from '../../components/common/PageContainer';

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'ai',
    name: 'Sarah (Stripe HR)',
    text: `Hi! I'm reaching out to formally extend our offer for the Senior Frontend Engineer role at Stripe. We're very excited to have you join the team.

Our offer is as follows:
• Base Salary: ₹28,00,000 per annum
• Annual Bonus: 10% performance-based
• ESOPs: 0.05% over 4 years with a 1-year cliff
• Benefits: Full health insurance, meal allowance, learning budget of ₹1L/year

We'd love to have your decision by end of next week. How does this sound?`,
  },
];

const TACTIC_SUGGESTIONS = [
  { label: '⚓ Anchor Higher', prompt: 'My research and competing offers suggest a range of ₹32–35L. Is there flexibility on the base to get closer to that range?', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { label: '⏳ Ask for Time', prompt: "Thank you for the offer! I'm very excited about the opportunity. Could I have until end of this week to review the full details with my family?", color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  { label: '📦 Bundle Ask', prompt: 'The base is slightly below my target of ₹32L. Could we explore either a higher base or additional ESOPs to bridge the gap?', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { label: '⚡ Competing Offer', prompt: 'I have a competing offer at ₹31L base. Stripe is my first choice — is there any flexibility to get closer to that number?', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { label: '✅ Accept Gracefully', prompt: "Thank you so much! I'm thrilled to accept. I'd love to start as soon as possible. What are the next steps?", color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
];

const AI_RESPONSES = {
  anchor: `Thank you for sharing that context. I appreciate your transparency.

While ₹28L is our budgeted range for this level, I can speak with the hiring manager about moving to ₹29.5L. We might also be able to accelerate your first salary review to 6 months instead of 12.

Would that work for you?`,
  bundle: `That's a reasonable ask. We do have some flexibility on the equity side. We could increase the ESOP grant to 0.07% — that's an additional ₹3–4L at our current valuation.

Alternatively, we could add a joining bonus of ₹1.5L to bridge the gap this year.

Would either of those options help?`,
  competing: `I understand, and we do want to make this work. Let me check with the team on a one-time basis.

We can move to ₹30L base — that's our final on the base salary. To sweeten the package further, I can add an additional 0.02% in ESOPs.

Does that feel right?`,
  default: `That's helpful context. Let me see what I can do. We really want you on the team, and I'll do my best to make this work within our budget constraints.

Give me a day to circle back with the hiring manager. Can I follow up tomorrow?`,
};

function getAIResponse(text) {
  const lower = text.toLowerCase();
  if (lower.includes('32') || lower.includes('35') || lower.includes('anchor') || lower.includes('research')) return AI_RESPONSES.anchor;
  if (lower.includes('bundle') || lower.includes('esop') || lower.includes('equity') || lower.includes('bridge')) return AI_RESPONSES.bundle;
  if (lower.includes('competing') || lower.includes('other offer') || lower.includes('31')) return AI_RESPONSES.competing;
  return AI_RESPONSES.default;
}

function renderMessageText(text, isDark) {
  return text.split('\n').map((line, i) => (
    <Typography key={i} sx={{ fontSize: '0.88rem', lineHeight: 1.85, color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.75)', whiteSpace: 'pre-wrap' }}>
      {line.startsWith('•') ? `· ${line.slice(1).trim()}` : line}
    </Typography>
  ));
}

export default function OfferNegotiation() {
  const { interviewId: _interviewId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const bg = isDark ? '#0f0f13' : '#f4f5f9';
  const surface = isDark ? '#16161e' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const muted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const textColor = isDark ? '#ffffff' : '#0f0f13';

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [usedTactics, setUsedTactics] = useState([]);
  const [offerHistory, setOfferHistory] = useState([{ label: 'Initial Offer', value: '₹28L base' }]);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const sendMessage = (text) => {
    if (!text.trim() || isAiTyping) return;
    const userMsg = { id: Date.now(), role: 'user', name: 'You', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const lower = text.toLowerCase();
    if (lower.includes('32') || lower.includes('35') || lower.includes('research')) {
      setUsedTactics((t) => [...new Set([...t, 'Anchoring'])]);
      setOfferHistory((h) => [...h, { label: 'Your Counter', value: '₹32–35L' }]);
    }
    if (lower.includes('competing') || lower.includes('other offer')) setUsedTactics((t) => [...new Set([...t, 'BATNA'])]);
    if (lower.includes('esop') || lower.includes('bundle')) setUsedTactics((t) => [...new Set([...t, 'Bundling'])]);
    if (lower.includes('time') || lower.includes('week') || lower.includes('family')) setUsedTactics((t) => [...new Set([...t, 'Buying Time'])]);
    if (lower.includes('accept') || lower.includes('thrilled') || lower.includes('excited to accept')) setUsedTactics((t) => [...new Set([...t, 'Close'])]);

    setIsAiTyping(true);
    setTimeout(() => {
      const aiResponse = getAIResponse(text);
      if (lower.includes('29.5')) setOfferHistory((h) => [...h, { label: 'Stripe Counter', value: '₹29.5L base' }]);
      if (lower.includes('₹30') || lower.includes('30l')) setOfferHistory((h) => [...h, { label: 'Final Offer', value: '₹30L base' }]);
      setMessages((prev) => [...prev, { id: Date.now(), role: 'ai', name: 'Sarah (Stripe HR)', text: aiResponse }]);
      setIsAiTyping(false);
    }, 1800);
  };

  return (
    <PageContainer
      sx={{
        height: 'calc(100vh - var(--navbar-height))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 0,
        bgcolor: bg,
      }}
    >
      {/* ── Top bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: surface,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <IconButton
          onClick={() => navigate('/interview-practice')}
          size="small"
          sx={{
            color: muted,
            border: `1px solid ${border}`,
            borderRadius: 1.5,
            '&:hover': { color: '#f59e0b', borderColor: 'rgba(245,158,11,0.35)', bgcolor: 'rgba(245,158,11,0.06)' },
          }}
        >
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SavingsRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: textColor }}>
            Offer Negotiation Simulator
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: muted, mt: 0.15 }}>
            Stripe · Senior Frontend Engineer · AI Roleplay
          </Typography>
        </Box>

        <Box
          sx={{
            px: 1.5,
            py: 0.6,
            borderRadius: 6,
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b' }}>🎭 AI Roleplay</Typography>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.75,
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Avatar */}
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: msg.role === 'ai'
                          ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: msg.role === 'ai'
                          ? '0 4px 12px rgba(245,158,11,0.3)'
                          : '0 4px 12px rgba(99,102,241,0.3)',
                      }}
                    >
                      {msg.role === 'ai'
                        ? <SmartToyRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />
                        : <PersonRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />
                      }
                    </Box>

                    <Box sx={{ maxWidth: '78%' }}>
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: muted,
                          mb: 0.6,
                          textAlign: msg.role === 'user' ? 'right' : 'left',
                        }}
                      >
                        {msg.name}
                      </Typography>
                      <Box
                        sx={{
                          p: 2.25,
                          borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          bgcolor: msg.role === 'ai'
                            ? surface
                            : isDark
                              ? 'rgba(99,102,241,0.15)'
                              : 'rgba(99,102,241,0.07)',
                          border: `1px solid ${msg.role === 'ai' ? border : 'rgba(99,102,241,0.22)'}`,
                          boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        {renderMessageText(msg.text, isDark)}
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isAiTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SmartToyRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />
                  </Box>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      borderRadius: '4px 16px 16px 16px',
                      bgcolor: surface,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: 18 }}>
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: '#f59e0b',
                            animation: 'bounce 1s ease-in-out infinite',
                            animationDelay: `${delay}s`,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Tactic chips */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              pt: 2,
              pb: 1.25,
              borderTop: `1px solid ${border}`,
              bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: muted, mb: 1.25, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Suggested tactics
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {TACTIC_SUGGESTIONS.map((t) => (
                <Box
                  key={t.label}
                  onClick={() => !isAiTyping && sendMessage(t.prompt)}
                  sx={{
                    px: 1.75,
                    py: 0.6,
                    borderRadius: 6,
                    bgcolor: t.bg,
                    border: `1px solid ${t.color}35`,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: t.color,
                    cursor: isAiTyping ? 'default' : 'pointer',
                    opacity: isAiTyping ? 0.5 : 1,
                    transition: 'all 0.18s',
                    '&:hover': !isAiTyping ? {
                      bgcolor: `${t.color}20`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 3px 10px ${t.color}25`,
                    } : {},
                  }}
                >
                  {t.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Input bar */}
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              borderTop: `1px solid ${border}`,
              bgcolor: surface,
              display: 'flex',
              gap: 1.5,
              alignItems: 'flex-end',
            }}
          >
            <Box
              sx={{
                flex: 1,
                borderRadius: 3,
                border: `1.5px solid ${border}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                '&:focus-within': { borderColor: 'rgba(99,102,241,0.45)' },
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                disabled={isAiTyping}
                placeholder="Type your response to the recruiter..."
                rows={2}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  padding: '12px 16px',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  background: 'transparent',
                  color: isDark ? 'rgba(255,255,255,0.87)' : '#0f0f13',
                  boxSizing: 'border-box',
                }}
              />
            </Box>
            <Box
              onClick={() => sendMessage(input)}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: input.trim() && !isAiTyping
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isAiTyping ? 'pointer' : 'default',
                transition: 'all 0.2s',
                flexShrink: 0,
                boxShadow: input.trim() && !isAiTyping ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                '&:hover': input.trim() && !isAiTyping ? { transform: 'translateY(-1px)' } : {},
              }}
            >
              <SendRoundedIcon sx={{ fontSize: 18, color: input.trim() && !isAiTyping ? '#fff' : muted }} />
            </Box>
          </Box>
        </Box>

        {/* Right sidebar tracker */}
        <Box
          sx={{
            width: 250,
            flexShrink: 0,
            borderLeft: `1px solid ${border}`,
            bgcolor: surface,
            p: 2.5,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 3,
            overflow: 'auto',
          }}
        >
          {/* Offer history */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpRoundedIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: textColor }}>Offer History</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {offerHistory.map((o, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 1.75,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: i === offerHistory.length - 1
                        ? 'rgba(16,185,129,0.08)'
                        : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${i === offerHistory.length - 1 ? 'rgba(16,185,129,0.25)' : border}`,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: muted }}>{o.label}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: i === offerHistory.length - 1 ? '#10b981' : textColor }}>
                      {o.value}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          <Box sx={{ height: '1px', bgcolor: border }} />

          {/* Tactics used */}
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: textColor, mb: 1.5 }}>Tactics Used</Typography>
            {usedTactics.length === 0 ? (
              <Typography sx={{ fontSize: '0.75rem', color: muted, fontStyle: 'italic', lineHeight: 1.7 }}>
                No tactics detected yet. Try anchoring or using a competing offer.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {usedTactics.map((t) => (
                  <Box
                    key={t}
                    sx={{
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 4,
                      bgcolor: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#6366f1',
                    }}
                  >
                    {t}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ height: '1px', bgcolor: border }} />

          {/* Coach tip */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
              <LightbulbOutlinedIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: textColor }}>Coach Tip</Typography>
            </Box>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2.5,
                bgcolor: 'rgba(245,158,11,0.07)',
                border: '1px solid rgba(245,158,11,0.18)',
              }}
            >
              <Typography sx={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)', lineHeight: 1.8 }}>
                Most candidates leave money on the table by not anchoring. The first number sets the range — always counter before accepting.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
      `}} />
    </PageContainer>
  );
}
