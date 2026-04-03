import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery, alpha, Chip, Tooltip, IconButton, Grid } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Target, Settings, Users } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';

useNavigate;

const STAR_COLORS = { s: '#3b82f6', t: '#2563eb', a: '#0ea5e9', r: '#06b6d4' };
const STAR_LABELS = { s: 'Situation', t: 'Task', a: 'Action', r: 'Result' };

const QUESTION_BANK = {
  0: [
    { id: 'l1', question: 'Tell me about yourself and why you are applying for this role.', complexity: 'Medium', duration: '2-3 min', overview: 'Opening question that sets the tone — your elevator pitch.', intent: 'The interviewer wants a concise, structured summary of your career arc and genuine motivation for this specific role — not your life story.', expectations: ['Clear narrative arc', 'Relevant experience highlights', 'Specific motivation for this role'], sampleAnswer: `I'm a frontend engineer with 4 years building scalable React applications. At Acme, I led the migration from jQuery to React — reducing bundle size by 40% and improving load time by 2 seconds. I'm applying because I want to work on problems where frontend performance directly impacts millions of users, and this role is exactly that.`, starBreakdown: { s: true, t: true, a: true, r: true } },
    { id: 'l2', question: 'Describe a project you are most proud of. What was your specific contribution?', complexity: 'Hard', duration: '3-4 min', overview: 'Tests ownership, clarity of contribution, and ability to quantify impact.', intent: 'They want to understand exactly what YOU did — not what the team did. "We built X" is a red flag; "I designed X and led Y" is what they want.', expectations: ['Clear personal ownership', 'Quantifiable result', 'Technical depth without jargon'], sampleAnswer: `I built a real-time notification system for 500k+ daily users. My specific contribution was designing the WebSocket connection pool and the fallback polling strategy. I reduced notification latency from 8 seconds to under 300ms — and the feature drove a 12% improvement in user retention the following quarter.`, starBreakdown: { s: true, t: true, a: true, r: true } },
    { id: 'l3', question: 'How do you prioritize when you have multiple competing deadlines?', complexity: 'Medium', duration: '2 min', overview: 'Evaluates time management and stakeholder communication under pressure.', intent: 'They want a systematic approach, not reactivity. Strong answers involve proactive escalation rather than solo heroics.', expectations: ['Structured prioritization framework', 'Stakeholder communication', 'Concrete real example'], sampleAnswer: `I use an impact-vs-effort matrix. I list all tasks, clarify ambiguous deadlines with the requester, and escalate competing high-impact items to my manager early rather than making a unilateral call. Last quarter two deliveries collided — I surfaced it in standup, we reprioritized a feature by 2 days, and I shipped the critical bug fix without missing either date.`, starBreakdown: { s: true, t: true, a: true, r: true } },
    { id: 'l4', question: 'Tell me about a time you disagreed with a decision made by your team or manager.', complexity: 'Hard', duration: '3 min', overview: 'Tests professional maturity and constructive conflict resolution.', intent: 'They want proof you can voice disagreement respectfully and accept final decisions gracefully — without being a pushover or a bulldozer.', expectations: ['Respectful communication', 'Data-driven argument', 'Acceptance of final decision'], sampleAnswer: `My manager wanted to skip unit tests to hit a deadline. I raised my concern privately, backed by data — we had 3 production bugs the previous sprint from untested code. I proposed a middle ground: write tests only for the two highest-risk modules. They agreed, we shipped on time, and those modules had zero regressions post-launch.`, starBreakdown: { s: true, t: true, a: true, r: true } },
    { id: 'l5', question: 'Where do you see yourself in 3 years?', complexity: 'Easy', duration: '1-2 min', overview: 'Gauges ambition, self-awareness, and alignment with the role\'s growth path.', intent: 'They want to verify your trajectory makes sense for this role and that you are not just using it as a stepping stone to something unrelated.', expectations: ['Realistic ambition', 'Role alignment', 'Growth mindset without over-promising'], sampleAnswer: `In 3 years I want to be a senior engineer who deeply understands this product's architecture and is starting to take on tech lead responsibilities — owning a feature area end-to-end, mentoring juniors, and influencing technical direction. I'm drawn here because the engineering scale would accelerate that growth faster than anywhere else.`, starBreakdown: { s: false, t: false, a: false, r: false } },
  ],
  1: [
    { id: 't1', question: 'Explain the difference between controlled and uncontrolled components in React.', complexity: 'Medium', duration: '2 min', overview: 'Core React concept — tests practical understanding, not just textbook definitions.', intent: 'They want to know if you understand the tradeoffs and when to choose each — not just what they are. Bonus: mention when you\'d reach for one over the other.', expectations: ['Clear definition of both', 'Practical tradeoffs', 'Real-world usage example'], sampleAnswer: `A controlled component has its value managed by React state — every keystroke triggers setState and re-render. An uncontrolled component stores its own value internally in the DOM, accessed via a ref. Controlled gives you real-time validation and conditional logic; uncontrolled is simpler for basic forms or when integrating with non-React libraries. I default to controlled but reach for uncontrolled when integrating with DOM-manipulating third-party libraries.`, starBreakdown: { s: false, t: false, a: true, r: true } },
    { id: 't2', question: 'How would you approach optimizing a React app with slow renders?', complexity: 'Hard', duration: '3-5 min', overview: 'Tests performance debugging methodology — not just a list of optimizations.', intent: 'They want a systematic debugging approach. Mentioning Profiler before React.memo shows seniority — you profile first, optimize second.', expectations: ['Profiler-first methodology', 'React.memo / useMemo / useCallback knowledge', 'Virtualization awareness'], sampleAnswer: `First I\'d profile with React DevTools Profiler to find which components re-render unnecessarily. Then I\'d tackle the highest-cost ones: React.memo for pure components, useMemo for expensive calculations, useCallback to stabilize callback references. For long lists I\'d add react-window virtualization. Last, I\'d check if a Context is causing tree-wide re-renders and split it if needed.`, starBreakdown: { s: true, t: true, a: true, r: false } },
    { id: 't3', question: 'Design a scalable REST API for a job tracking application.', complexity: 'Hard', duration: '4 min', overview: 'Tests API design fundamentals and ability to think at scale.', intent: 'Looking for resource modeling, pagination strategy, auth design, versioning, and error handling — not just CRUD endpoints.', expectations: ['RESTful resource modeling', 'JWT auth strategy', 'Cursor-based pagination', 'Error handling standard'], sampleAnswer: `I\'d model core resources as /users, /applications, /jobs, and /resumes. Applications belong to users and have a status enum. Auth via JWT — access token 15 min, refresh token 7 days. All list endpoints use cursor-based pagination for consistency at scale. Versioning under /v1/ from day one. Errors use RFC 7807 problem+json so clients get structured, actionable messages.`, starBreakdown: { s: false, t: true, a: true, r: true } },
    { id: 't4', question: 'Explain event delegation and when you would use it.', complexity: 'Medium', duration: '2 min', overview: 'Core DOM/JS concept used in performance-critical frontend work.', intent: 'Tests your understanding of event bubbling and ability to apply it to real performance problems — not just define the term.', expectations: ['Bubbling explanation', 'Practical performance benefit', 'Concrete list example'], sampleAnswer: `Event delegation attaches one listener to a parent instead of individual listeners on each child. Because events bubble up, the parent catches events from all descendants. I use it for dynamic lists — like a todo list where items are added and removed. Instead of attaching/detaching listeners on each li I attach once to the ul and use event.target to identify which item was clicked. This reduces memory overhead significantly for long lists.`, starBreakdown: { s: false, t: true, a: true, r: true } },
  ],
  2: [
    { id: 'h1', question: 'Why are you looking to leave your current role?', complexity: 'Easy', duration: '2 min', overview: 'Tests professionalism and genuine forward-looking motivation.', intent: 'They want motivation without negativity. Any criticism of your current employer is a red flag — answer with what you\'re moving toward, not what you\'re running from.', expectations: ['Forward-looking framing', 'Zero negativity about current employer', 'Specific pull factors'], sampleAnswer: `I\'ve had a great run at my current company and learned a lot. I\'m at a point where I want to work on problems at a bigger scale — more users, more complex systems, and a team where I can learn from engineers ahead of me. This role stood out because of the engineering depth and the product impact.`, starBreakdown: { s: false, t: false, a: false, r: false } },
    { id: 'h2', question: 'How do you handle receiving critical feedback on your work?', complexity: 'Medium', duration: '3 min', overview: 'Tests emotional intelligence and growth mindset under pressure.', intent: 'They want to see that you don\'t become defensive, that you ask clarifying questions, and that you have evidence of acting on feedback.', expectations: ['Non-defensive response', 'Clarifying-question habit', 'Concrete improvement example'], sampleAnswer: `I try to listen fully before responding and ask clarifying questions to make sure I understand the feedback correctly. In my last review, my tech lead said my PRs were too large and hard to review. I took that seriously — I started breaking work into smaller PRs with clearer descriptions. My next review specifically noted the improvement, and my merge turnaround dropped from 3 days to under 1.`, starBreakdown: { s: true, t: true, a: true, r: true } },
    { id: 'h3', question: 'What is your preferred working style?', complexity: 'Easy', duration: '2 min', overview: 'Culture fit question — tests self-awareness and adaptability.', intent: 'They want you to articulate your style AND show you can adapt to their team culture — this is as much about fit as it is about self-awareness.', expectations: ['Clear self-awareness', 'Demonstrated flexibility', 'Team-orientation'], sampleAnswer: `I do my best deep thinking solo — I need uninterrupted blocks for architecture work. But I find the final solution is almost always better after whiteboarding with teammates, because blind spots surface fast. I structure my day with a morning focus block and keep afternoons open for collaboration. I\'ve worked in high-collaboration pairing environments and deep-focus async teams — both work well for me.`, starBreakdown: { s: false, t: false, a: true, r: false } },
    { id: 'h4', question: 'Tell me about your salary expectations.', complexity: 'Medium', duration: '2 min', overview: 'Compensation discussion — tests preparation and early alignment.', intent: 'Give a researched range with reasoning. The goal isn\'t to anchor them down — it\'s to show you\'ve done your homework and to open a conversation.', expectations: ['Market research demonstrated', 'Clear range with reasoning', 'Package flexibility framing'], sampleAnswer: `Based on Glassdoor, Levels.fyi, and conversations with peers, I\'m targeting a range of X to Y for this role and location. That said, I\'m open to discussing the full package — equity, benefits, and growth trajectory all factor in. If the base is at the lower end, I\'d want to understand the variable comp or equity opportunity.`, starBreakdown: { s: false, t: false, a: true, r: false } },
  ],
};

const TAB_LABELS = [
  { label: 'Likely Questions', icon: Target },
  { label: 'Technical', icon: Settings },
  { label: 'HR & Culture', icon: Users }
];

export default function InterviewQnAGenerator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const profileTitle = location.state?.profileTitle || 'Software Engineer';

  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [expanded, setExpanded] = useState('intent');
  const [detailTab, setDetailTab] = useState(0); // 0: Coach Insight, 1: Model Answer

  const questions = QUESTION_BANK[activeTab] ?? [];
  const filtered = useMemo(() => {
    if (!search.trim()) return questions;
    return questions.filter((q) => q.question.toLowerCase().includes(search.toLowerCase()));
  }, [search, questions]);

  const selected = filtered[selectedIdx] ?? filtered[0];

  const prev = () => setSelectedIdx((i) => Math.max(0, i - 1));
  const next = () => setSelectedIdx((i) => Math.min(filtered.length - 1, i + 1));

  return (
    <PageContainer sx={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0, bgcolor: 'background.default' }}>

      {/* ── Top bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton size="small" onClick={() => navigate('/interview-practice')} sx={{ color: 'text.secondary', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>Prep Guide</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>{profileTitle}</Typography>
        </Box>
        <Chip label={`${filtered.length} questions`} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha('#2563eb', 0.1), color: '#2563eb' }} />
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => { setActiveTab(v); setSelectedIdx(0); setSearch(''); }}
          variant={isMobile ? 'scrollable' : 'standard'}
          sx={{
            px: 2,
            minHeight: 48,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              minHeight: 48,
              gap: 1,
              flexDirection: 'row',
              color: 'text.secondary',
              '&.Mui-selected': { color: '#2563eb' },
            },
            '& .MuiTabs-indicator': {
              background: '#2563eb',
              height: 3,
              borderRadius: 2
            }
          }}
        >
          {TAB_LABELS.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={i}
                label={tab.label}
                icon={<Icon size={16} />}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Question list */}
        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: { md: '1px solid' }, borderColor: 'divider' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
              <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); }} placeholder="Search questions…" style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.83rem', color: isDark ? '#e2e8f0' : '#1e293b', fontFamily: 'inherit' }} />
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
            {filtered.map((q, idx) => {
              const isActive = selected?.id === q.id;
              return (
                <motion.div key={q.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}>
                <Box onClick={() => setSelectedIdx(idx)} sx={{ p: 1.75, mb: 0.75, borderRadius: 2.5, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s ease', borderColor: isActive ? '#2563eb' : 'transparent', bgcolor: isActive ? alpha('#2563eb', 0.08) : 'transparent', '&:hover': { bgcolor: isActive ? alpha('#2563eb', 0.1) : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, boxShadow: isActive ? `0 4px 12px ${alpha('#2563eb', 0.15)}` : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: isActive ? '#2563eb' : 'text.disabled', fontSize: '0.65rem' }}>Q{idx + 1}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: q.complexity === 'Easy' ? '#0ea5e9' : q.complexity === 'Medium' ? '#2563eb' : '#1d4ed8' }} />
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'text.disabled' }}>{q.duration}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.5, color: isActive ? 'text.primary' : 'text.secondary' }}>{q.question}</Typography>
                  </Box>
                </motion.div>
              );
            })}
            {filtered.length === 0 && <Box sx={{ textAlign: 'center', py: 6 }}><Typography variant="body2" sx={{ color: 'text.disabled' }}>No matches</Typography></Box>}
          </Box>
        </Box>

        {/* Detail panel */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 4 }, '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                <Box sx={{  mx: 'auto' }}>

                  {/* Question hero */}
                  <Box sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4, position: 'relative', overflow: 'hidden', background: isDark ? 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(14,165,233,0.12) 100%)' : 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(14,165,233,0.05) 100%)', border: '1px solid', borderColor: isDark ? 'rgba(37,99,235,0.2)' : 'rgba(37,99,235,0.12)' }}>
                    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(37,99,235,0.05)', filter: 'blur(30px)' }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={selected.complexity} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', color: selected.complexity === 'Easy' ? '#0ea5e9' : selected.complexity === 'Medium' ? '#2563eb' : '#1d4ed8', bgcolor: alpha(selected.complexity === 'Easy' ? '#0ea5e9' : selected.complexity === 'Medium' ? '#2563eb' : '#1d4ed8', 0.1), height: 22 }} />
                      <Chip label={selected.duration} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', color: 'text.secondary', bgcolor: alpha(theme.palette.text.secondary, 0.08), height: 22 }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.3, mb: 2, fontSize: { xs: '1.4rem', md: '1.85rem' }, color: isDark ? '#f8fafc' : '#1e293b' }}>{selected.question}</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: '0.92rem', borderLeft: '3px solid', borderColor: '#2563eb', pl: 2 }}>{selected.overview}</Typography>
                  </Box>

                  {/* Intelligence Tabs */}
                  <Box sx={{ mb: 2, display: 'flex', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    {['Coach Insight', 'Model Answer'].map((label, i) => (
                      <Box
                        key={label}
                        onClick={() => setDetailTab(i)}
                        sx={{
                          px: 3, py: 1.5, cursor: 'pointer', position: 'relative',
                          color: detailTab === i ? '#2563eb' : 'text.disabled',
                          fontWeight: 700, fontSize: '0.88rem',
                          transition: 'all 0.2s',
                          '&:hover': { color: '#2563eb' }
                        }}
                      >
                        {label}
                        {detailTab === i && (
                          <motion.div layoutId="detailUnderline" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #2563eb, #0ea5e9)', borderRadius: '2px 2px 0 0' }} />
                        )}
                      </Box>
                    ))}
                  </Box>

                  <AnimatePresence mode="wait">
                    {detailTab === 0 ? (
                      <motion.div key="insight" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 3, height: '100%', borderRadius: 4, bgcolor: isDark ? 'rgba(37,99,235,0.04)' : 'rgba(37,99,235,0.03)', border: '1px solid', borderColor: alpha('#2563eb', 0.1) }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                                <PsychologyRoundedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                                <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', color: '#2563eb' }}>The Interviewer's Intent</Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontStyle: 'italic', fontSize: '0.9rem' }}>"{selected.intent}"</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ p: 3, height: '100%', borderRadius: 4, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                                <ChecklistRoundedIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                                <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase' }}>Success Criteria</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {selected.expectations.map((e) => (
                                  <Chip key={e} label={e} size="small" sx={{ fontWeight: 600, fontSize: '0.72rem', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: 'text.secondary', borderRadius: 1.5 }} />
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? 'rgba(14,165,233,0.04)' : 'rgba(14,165,233,0.03)', border: '1px solid', borderColor: alpha('#0ea5e9', 0.1), display: 'flex', gap: 2 }}>
                              <LightbulbOutlinedIcon sx={{ fontSize: 20, color: '#0ea5e9', mt: 0.3 }} />
                              <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', color: '#0ea5e9', mb: 0.5 }}>Pro Coach Tip</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.9rem' }}>Keep your answer under 2 minutes. If your Situation section runs longer than 2 sentences you've given too much context. Focus on the <strong>Action</strong> and <strong>Result</strong>.</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </motion.div>
                    ) : (
                      <motion.div key="model" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                        <Box sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)' }}>
                          
                          {/* STAR Path Visualization */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', mb: 4, px: 2 }}>
                            {['S', 'T', 'A', 'R'].map((key, i) => {
                              const lowKey = key.toLowerCase();
                              const covered = selected.starBreakdown?.[lowKey];
                              const color = STAR_COLORS[lowKey];
                              return (
                                <Box key={key} sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                  <Tooltip title={STAR_LABELS[lowKey]} arrow>
                                    <Box sx={{ 
                                      width: 32, height: 32, borderRadius: '50%', 
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      bgcolor: covered ? color : 'divider',
                                      color: covered ? '#fff' : 'text.disabled',
                                      fontWeight: 900, fontSize: '0.75rem',
                                      transition: 'all 0.3s',
                                      boxShadow: covered ? `0 0 12px ${alpha(color, 0.4)}` : 'none'
                                    }}>
                                      {covered ? <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> : key}
                                    </Box>
                                  </Tooltip>
                                  {i < 3 && (
                                    <Box sx={{ flex: 1, height: 2, bgcolor: covered && selected.starBreakdown?.[['s','t','a','r'][i+1].toLowerCase()] ? STAR_COLORS[['s','t','a','r'][i+1].toLowerCase()] : 'divider', mx: 1, borderRadius: 1 }} />
                                  )}
                                </Box>
                              );
                            })}
                          </Box>

                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem', mb: 2 }}>Expert Sample Response</Typography>
                          <Typography variant="body1" sx={{ lineHeight: 2, fontSize: '1.02rem', color: isDark ? 'rgba(255,255,255,0.85)' : '#334155', whiteSpace: 'pre-line' }}>
                            {selected.sampleAnswer}
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pagination */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box onClick={prev} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', cursor: selectedIdx === 0 ? 'not-allowed' : 'pointer', opacity: selectedIdx === 0 ? 0.4 : 1, '&:hover': { borderColor: selectedIdx === 0 ? 'divider' : '#2563eb' }, transition: 'all 0.2s' }}>
                      <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Previous</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{selectedIdx + 1} / {filtered.length}</Typography>
                    <Box onClick={next} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', cursor: selectedIdx >= filtered.length - 1 ? 'not-allowed' : 'pointer', opacity: selectedIdx >= filtered.length - 1 ? 0.4 : 1, '&:hover': { borderColor: selectedIdx >= filtered.length - 1 ? 'divider' : '#2563eb' }, transition: 'all 0.2s' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Next</Typography>
                      <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ) : (
              <Box sx={{ textAlign: 'center', py: 12 }}><Typography color="text.secondary">No questions found.</Typography></Box>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </PageContainer>
  );
}
