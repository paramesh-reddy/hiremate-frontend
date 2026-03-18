import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';

const RADIUS_LG = 2.5; // 20px for main content cards (8px grid)

const MOCK_QUESTIONS = [
  {
    id: '1',
    question: 'How would you solve a problem on where to place new AmazonGo stores based on a map of current Amazon locations?',
    overview: "This question tests a candidate's ability to think through a problem and come up with a solution.",
    expectations: ['Problem-solving skills', 'Ability to think through a problem', 'Creativity'],
    sampleAnswer: 'I would start by drawing a map of the current Amazon locations. Then I would look at the map and try to find patterns in where they are located. I would then try to find a pattern in the new proposed locations and see if there is a way to optimize the placement of new stores.',
    readMoreUrl: 'https://www.google.com/search?q=AmazonGo+store+placement',
  },
  {
    id: '2',
    question: 'What is your experience with Java?',
    overview: 'Assesses technical depth and hands-on experience with Java.',
    expectations: ['Technical knowledge', 'Relevant experience', 'Communication'],
    sampleAnswer: 'I have 4+ years of experience with Java, including Spring Boot, multithreading, and JVM tuning. I have built REST APIs and event-driven systems in production.',
    readMoreUrl: 'https://www.google.com/search?q=Java+interview',
  },
  {
    id: '3',
    question: 'How would you reverse a string?',
    overview: 'Tests basic coding and string manipulation skills.',
    expectations: ['Coding ability', 'Edge cases', 'Complexity awareness'],
    sampleAnswer: 'I would iterate from the end to the start and build a new string, or use two pointers to swap characters in place. I would also consider unicode and immutability depending on the language.',
    readMoreUrl: 'https://www.google.com/search?q=reverse+string+interview',
  },
  {
    id: '4',
    question: 'How would you design a LRU cache?',
    overview: 'Evaluates system design and data structure knowledge.',
    expectations: ['Data structures', 'Time/space tradeoffs', 'API design'],
    sampleAnswer: 'I would use a hash map for O(1) lookup and a doubly linked list to maintain access order. On get, move node to front; on put, evict from tail if at capacity.',
    readMoreUrl: 'https://www.google.com/search?q=LRU+cache+design',
  },
  {
    id: '5',
    question: 'What are your hobbies?',
    overview: 'Behavioral question to understand personality and fit.',
    expectations: ['Authenticity', 'Balance', 'Communication'],
    sampleAnswer: 'I enjoy reading tech blogs, contributing to open source, and hiking. I find side projects help me stay curious and apply new concepts.',
    readMoreUrl: 'https://www.google.com/search?q=hobbies+interview',
  },
  {
    id: '6',
    question: 'Implement a stack from scratch and include a min() function that performs at O(1) time.',
    overview: 'Tests data structure implementation and optimization.',
    expectations: ['Coding', 'Complexity analysis', 'Clean code'],
    sampleAnswer: 'Use two stacks: one for values, one for minimums. On push, push value and push min(current min, value) to min stack. min() returns top of min stack. Pop from both.',
    readMoreUrl: 'https://www.google.com/search?q=min+stack+O(1)',
  },
  {
    id: '7',
    question: 'What is a linked list?',
    overview: 'Basic CS fundamentals check.',
    expectations: ['Fundamentals', 'Clarity'],
    sampleAnswer: 'A linked list is a linear structure where each node holds a value and a reference to the next node. It allows O(1) insert/delete at head and sequential access.',
    readMoreUrl: 'https://www.google.com/search?q=linked+list',
  },
  {
    id: '8',
    question: 'How will you find the first pair of numbers that sums to a given target value?',
    overview: 'Tests array manipulation and hash-based thinking.',
    expectations: ['Algorithm design', 'Tradeoffs', 'Edge cases'],
    sampleAnswer: 'Use a hash map: for each number, check if (target - number) exists in the map; if so return the indices. Otherwise store number and its index. Single pass O(n).',
    readMoreUrl: 'https://www.google.com/search?q=two+sum',
  },
  {
    id: '9',
    question: 'What is the difference between Code-First and Database-First method?',
    overview: 'ORM and development workflow knowledge.',
    expectations: ['Framework knowledge', 'Database design'],
    sampleAnswer: 'Code-First: define entities in code and generate migrations/database. Database-First: design DB first and generate entity classes. Code-First suits iterative development; DB-First suits existing schemas.',
    readMoreUrl: 'https://www.google.com/search?q=code+first+vs+database+first',
  },
  {
    id: '10',
    question: 'What would you like to tell me about yourself?',
    overview: 'Classic opener to assess communication and self-presentation.',
    expectations: ['Clarity', 'Relevance', 'Conciseness'],
    sampleAnswer: 'I am a software engineer with X years of experience focused on [domain]. I am passionate about [relevant interest] and recently [achievement]. I am excited about this role because [fit].',
    readMoreUrl: 'https://www.google.com/search?q=tell+me+about+yourself',
  },
];

const TAB_LABELS = [
  'Likely questions',
  'Technical (JD-based)',
  'HR questions',
];

export default function InterviewQnAGenerator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const profileTitle = location.state?.profileTitle || 'Software Engineer';

  const [activeTab, setActiveTab] = useState(0);
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('overview');

  const questions = MOCK_QUESTIONS;
  const filteredQuestions = useMemo(() => {
    if (!questionSearch.trim()) return questions;
    const q = questionSearch.toLowerCase();
    return questions.filter((item) => item.question.toLowerCase().includes(q));
  }, [questionSearch]);

  const selectedQuestion = filteredQuestions[selectedQuestionIndex] ?? filteredQuestions[0];

  const handlePrev = () => setSelectedQuestionIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setSelectedQuestionIndex((i) => Math.min(filteredQuestions.length - 1, i + 1));
  const handleAccordion = (panel) => (_, isExp) => setExpandedAccordion(isExp ? panel : false);

  // AccordionDetails: constrained height, scroll, smooth scroll, custom scrollbar (theme-aware)
  const accordionDetailsSx = useMemo(
    () => ({
      py: 2,
      px: 2.5,
      maxHeight: { xs: 240, sm: 280, md: 320 },
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
      // Thin modern scrollbar – WebKit
      '&::-webkit-scrollbar': { width: 6 },
      '&::-webkit-scrollbar-track': {
        background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04),
        borderRadius: 3,
      },
      '&::-webkit-scrollbar-thumb': {
        background: alpha(theme.palette.primary.main, 0.35),
        borderRadius: 3,
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: alpha(theme.palette.primary.main, 0.5),
      },
      // Firefox
      scrollbarWidth: 'thin',
      scrollbarColor: `${alpha(theme.palette.primary.main, 0.4)} ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04)}`,
    }),
    [theme]
  );

  const bgGradient = isDark
    ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.default} 24%)`
    : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${theme.palette.background.default} 20%)`;

  return (
    <PageContainer
      sx={{
        height: 'calc(100vh - var(--navbar-height, 64px))',
        minHeight: 'calc(100vh - var(--navbar-height, 64px))',
        background: bgGradient,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        px: 0,
        maxWidth: '100%',
      }}
    >
      {/* Top bar: Back + profile */}
      <Box
        sx={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.shadows[1],
        }}
      >
        <IconButton
          onClick={() => navigate('/interview-practice')}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
          }}
          aria-label="Back"
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
            Profile
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {profileTitle}
          </Typography>
        </Box>
      </Box>

      {/* Sticky Tabs with animated underline */}
      <Box
        sx={{
          flex: '0 0 auto',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.shadows[1],
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => { setActiveTab(v); setSelectedQuestionIndex(0); }}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{
            minHeight: 56,
            px: { xs: 1, sm: 2 },
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', py: 2 },
            '& .Mui-selected': { color: 'primary.main' },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& .MuiTabs-flexContainer': { gap: 1 },
          }}
        >
          {TAB_LABELS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Main content: sidebar + detail */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left: Question list as cards */}
        <Box
          sx={{
            width: { xs: '100%', md: 360 },
            minWidth: { md: 320 },
            maxWidth: { md: 420 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: { md: '1px solid' },
            borderColor: { md: 'divider' },
            bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.primary.main, 0.02),
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Questions ({filteredQuestions.length})
            </Typography>
            <TextField
              placeholder="Search questions"
              value={questionSearch}
              onChange={(e) => setQuestionSearch(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s ease',
                  '& fieldset': { borderColor: 'divider' },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
            {filteredQuestions.map((q, idx) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <Card
                  key={q.id}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  elevation={0}
                  sx={{
                    mb: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderLeft: '4px solid',
                    borderLeftColor: isSelected ? 'primary.main' : 'transparent',
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08)
                      : 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12)
                        : alpha(theme.palette.primary.main, isDark ? 0.06 : 0.04),
                      boxShadow: theme.shadows[2],
                    },
                  }}
                >
                  <Grid container sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 600 : 500,
                          color: 'text.primary',
                          lineHeight: 1.4,
                        }}
                      >
                        {idx + 1}. {q.question}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Right: Content card with accordion – constrained height, flex, no body overflow */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            p: { xs: 2, sm: 3 },
            maxHeight: { xs: 'none', sm: '70vh' },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              pb: 2,
              // Same scrollbar styling as accordion for consistency
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04),
                borderRadius: 3,
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.35),
                borderRadius: 3,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: alpha(theme.palette.primary.main, 0.5),
              },
              scrollbarWidth: 'thin',
              scrollbarColor: `${alpha(theme.palette.primary.main, 0.4)} ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04)}`,
            }}
          >
          {selectedQuestion ? (
            <>
              <Card
                elevation={0}
                sx={{
                  borderRadius: RADIUS_LG,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: theme.shadows[2],
                  overflow: 'hidden',
                  mb: 2,
                  flexShrink: 0,
                }}
              >
                <Grid container sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                  <Grid item xs={12}>
                    <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      lineHeight: 1.4,
                      mb: 3,
                    }}
                  >
                    {selectedQuestion.question}
                  </Typography>

                  <Accordion
                    expanded={expandedAccordion === 'overview'}
                    onChange={handleAccordion('overview')}
                    disableGutters
                    elevation={0}
                    sx={{
                      bgcolor: 'transparent',
                      '&:before': { display: 'none' },
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px !important',
                      mb: 1.5,
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: theme.shadows[1] },
                      '&.Mui-expanded': { my: 0 },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'primary.main' }} />}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': { my: 1.5 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LightbulbOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Overview</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={accordionDetailsSx}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {selectedQuestion.overview}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    expanded={expandedAccordion === 'expectations'}
                    onChange={handleAccordion('expectations')}
                    disableGutters
                    elevation={0}
                    sx={{
                      bgcolor: 'transparent',
                      '&:before': { display: 'none' },
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px !important',
                      mb: 1.5,
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: theme.shadows[1] },
                      '&.Mui-expanded': { my: 0 },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'primary.main' }} />}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': { my: 1.5 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <ChecklistRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Interview Expectations</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={accordionDetailsSx}>
                      <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { color: 'text.secondary', lineHeight: 1.8, mb: 0.5 } }}>
                        {selectedQuestion.expectations.map((exp, i) => (
                          <Typography key={i} component="li" variant="body2">
                            {exp}
                          </Typography>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion
                    expanded={expandedAccordion === 'sample'}
                    onChange={handleAccordion('sample')}
                    disableGutters
                    elevation={0}
                    sx={{
                      bgcolor: 'transparent',
                      '&:before': { display: 'none' },
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px !important',
                      mb: 1.5,
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: theme.shadows[1] },
                      '&.Mui-expanded': { my: 0 },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'primary.main' }} />}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': { my: 1.5 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MenuBookOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Sample Answer</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={accordionDetailsSx}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
                        {selectedQuestion.sampleAnswer}
                      </Typography>
                      <Typography
                        component="a"
                        href={selectedQuestion.readMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'primary.main',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                        Read more on Google
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  </Grid>
                </Grid>
              </Card>

              {/* Beta notice */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.06),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  mb: 2,
                }}
              >
                <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.25 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  You're looking at the Beta version of our interview prep module. We wanted you to have early access to a comprehensive Q&A bank for your dream job.
                </Typography>
              </Box>

              {/* Nav: Previous / Next */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  disabled={selectedQuestionIndex === 0}
                  startIcon={<ChevronLeftRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleNext}
                  disabled={selectedQuestionIndex >= filteredQuestions.length - 1}
                  endIcon={<ChevronRightRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                  }}
                >
                  Next
                </Button>
              </Box>
            </>
          ) : (
            <Card
              elevation={0}
              sx={{
                borderRadius: RADIUS_LG,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No questions match your search. Try a different query.
              </Typography>
            </Card>
          )}
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
