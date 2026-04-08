import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';

const THEME = {
  primary: 'var(--primary, #335ede)',
  primarySoft: 'rgba(51, 94, 222, 0.08)',
  border: 'var(--divider, rgba(0,0,0,0.08))',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
};

/* ── helpers ─────────────────────────────────── */
function ImpactBadge({ label }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        ml: 1.5,
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: 0.06,
        bgcolor: '#1e293b',
        color: '#fff',
        height: 24,
        borderRadius: 1,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

function StatusIcon({ status }) {
  if (status === 'pass')
    return <CheckCircleRoundedIcon sx={{ color: 'var(--success)', fontSize: 20 }} />;
  if (status === 'fail')
    return <CancelRoundedIcon sx={{ color: 'var(--error)', fontSize: 20 }} />;
  if (status === 'warn')
    return <WarningAmberRoundedIcon sx={{ color: 'var(--warning)', fontSize: 20 }} />;
  return null;
}

function SectionHeader({ title, badge }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography
        variant="h6"
        sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}
      >
        {title}
      </Typography>
      {badge && <ImpactBadge label={badge} />}
    </Box>
  );
}

function SectionDesc({ children }) {
  return (
    <Typography
      variant="body2"
      sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', mb: 0.5, lineHeight: 1.6 }}
    >
      {children}
    </Typography>
  );
}

function TipText({ children }) {
  return (
    <Typography
      variant="body2"
      sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', mb: 1.5, lineHeight: 1.6 }}
    >
      <strong>Tip: </strong>
      {children}
    </Typography>
  );
}

function CheckRow({ label, items }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 1.5,
        borderBottom: `1px solid ${THEME.border}`,
        '&:last-child': { borderBottom: 'none' },
        alignItems: 'flex-start',
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: THEME.textPrimary,
          minWidth: { xs: 120, sm: 160 },
          pt: 0.25,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: i < items.length - 1 ? 0.75 : 0 }}>
            <Box sx={{ mt: 0.1, flexShrink: 0 }}>
              <StatusIcon status={item.status} />
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', lineHeight: 1.55 }}
              >
                {item.text}
              </Typography>
              {item.link && (
                <Typography
                  variant="body2"
                  sx={{ color: THEME.primary, cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  {item.link}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function SkillsTable({ rows }) {
  return (
    <Table size="small" sx={{ mt: 1 }}>
      <TableHead>
        <TableRow sx={{ '& th': { borderBottom: `2px solid ${THEME.border}`, pb: 1, bgcolor: '#f1f5f9' } }}>
          <TableCell sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--text-primary)', pl: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Skill
              <Button
                size="small"
                startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  minWidth: 0,
                  p: '2px 6px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 1,
                }}
              >
                Copy All
              </Button>
            </Box>
          </TableCell>
          <TableCell align="center" sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Resume
          </TableCell>
          <TableCell align="center" sx={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Job Description
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i} sx={{ '& td': { borderBottom: `1px solid ${THEME.border}`, py: 1 } }}>
            <TableCell sx={{ pl: 0, color: THEME.textPrimary, fontSize: '0.875rem', fontWeight: 500 }}>
              {row.skill || '—'}
            </TableCell>
            <TableCell align="center">
              {row.inResume ? (
                <CheckCircleRoundedIcon sx={{ color: 'var(--success)', fontSize: 18 }} />
              ) : (
                <CancelRoundedIcon sx={{ color: 'var(--error)', fontSize: 18 }} />
              )}
            </TableCell>
            <TableCell align="center" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {row.count}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function AddSkillRow() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
      <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Don&apos;t see skills from the job description?
      </Typography>
      <Button
        size="small"
        startIcon={<AddRoundedIcon sx={{ fontSize: 14 }} />}
        sx={{
          fontFamily: 'var(--font-family)',
          fontSize: '0.8rem',
          color: 'var(--primary)',
          textTransform: 'none',
          fontWeight: 600,
          p: '2px 4px',
        }}
      >
        Add Skill
      </Button>
    </Box>
  );
}

/* ── static data ──────────────────────────────── */
const SCORE_CATEGORIES = [
  { label: 'Searchability', issues: 5, value: 35, color: 'var(--primary)' },
  { label: 'Hard Skills', issues: 8, value: 22, color: 'var(--error)' },
  { label: 'Soft Skills', issues: 1, value: 60, color: 'var(--primary)' },
  { label: 'Recruiter Tips', issues: 3, value: 48, color: 'var(--primary)' },
  { label: 'Formatting', issues: 0, value: 75, color: 'var(--primary)' },
];

const SEARCHABILITY_ROWS = [
  {
    label: 'Contact Information',
    items: [
      { status: 'fail', text: 'We did not find an address in your resume or the address is incomplete. Recruiters use your address to validate your location for job matches.' },
      { status: 'pass', text: 'You provided your email. Recruiters use your email to contact you for job matches.' },
      { status: 'pass', text: 'You provided your phone number.' },
    ],
  },
  {
    label: 'Summary',
    items: [
      { status: 'warn', text: 'We did not find a summary section on your resume. The summary provides a quick overview of the candidate\'s qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position.' },
    ],
  },
  {
    label: 'Section Headings',
    items: [
      { status: 'pass', text: 'We found the education section in your resume.' },
      { status: 'pass', text: 'We found the work experience section in your resume.' },
      { status: 'pass', text: 'We found work history in your resume.' },
    ],
  },
  {
    label: 'Job Title Match',
    items: [
      { status: 'fail', text: "The job title 'React.js Developer' from the job description was not found in your resume. We recommend having the exact title of the job for which you're applying in your resume. This ensures you'll be found when a recruiter searches by job title. If you haven't held this position before, include it as part of your summary statement.", link: 'Update scan information' },
    ],
  },
  {
    label: 'Date Formatting',
    items: [
      { status: 'fail', text: 'ATS and recruiters prefer specific date formatting for your work experience. Please use the following formats: "MM/YY or MM/YYYY or Month YYYY" (e.g. 03/19, 03/2019, Mar 2019 or March 2019).', link: 'View Incorrectly formatted dates' },
    ],
  },
  {
    label: 'Education Match',
    items: [
      { status: 'fail', text: 'Your education does not match the preferred (Bachelor) education listed in the job description. If your experience is strong, consider explaining this in your summary or cover letter.', link: 'Update required education level' },
    ],
  },
];

const HARD_SKILLS_ROWS = [
  { skill: 'Front-end development', inResume: false, count: 1 },
  { skill: 'User interface design', inResume: false, count: 1 },
  { skill: 'Mocha', inResume: false, count: 1 },
  { skill: 'React.js', inResume: false, count: 3 },
  { skill: 'JavaScript', inResume: false, count: 4 },
  { skill: 'Redux', inResume: false, count: 2 },
];

const SOFT_SKILLS_ROWS = [
  { skill: 'Communication', inResume: false, count: 1 },
  { skill: 'Problem-solving', inResume: false, count: 1 },
];

const RECRUITER_TIPS_ROWS = [
  {
    label: 'Job Level Match',
    items: [
      { status: 'warn', text: 'No specific years of experience were found in this job description. Focus on matching your skills and qualifications to the role\'s requirements. Consider how your experience, regardless of duration, aligns with the job\'s key responsibilities before applying.' },
    ],
  },
  {
    label: 'Measurable Results',
    items: [
      { status: 'warn', text: 'We found 0 mentions of measurable results in your resume. Consider adding at least 5 specific achievements or impact you had in your job (e.g. time saved, increase in sales, etc).' },
    ],
  },
  {
    label: 'Resume Tone',
    items: [
      { status: 'warn', text: "We've found some negative phrases or clichés in your resume:", link: 'View Negative Words' },
    ],
  },
  {
    label: 'Web Presence',
    items: [
      { status: 'pass', text: "Nice - You've linked to a website that builds your web credibility. Recruiters appreciate the convenience and credibility associated with a professional website." },
    ],
  },
  {
    label: 'Word Count',
    items: [
      { status: 'pass', text: 'There are 374 words in your resume, which is under the suggested 1000 word count for relevance and ease of reading reasons.' },
    ],
  },
];

const FORMATTING_ROWS = [
  {
    label: 'Layout',
    items: [
      { status: 'pass', text: 'Your resume is within the recommended 1-2 page length.' },
      { status: 'pass', text: 'Your resume does not have tables which can confuse ATS parsers.' },
      { status: 'pass', text: 'Your resume does not use text boxes.' },
      { status: 'pass', text: 'Your resume does not use headers or footers.' },
    ],
  },
  {
    label: 'Font Check',
    items: [
      { status: 'pass', text: 'Your resume uses a standard, ATS-friendly font.' },
    ],
  },
  {
    label: 'Page Setup',
    items: [
      { status: 'pass', text: 'Your resume uses standard page margins.' },
    ],
  },
];

const JOB_DESCRIPTION_TEXT = `React.js Developer

We are looking for a skilled React.js Developer to join our front-end development team. In this role, you will be responsible for developing and implementing user interface components using React.js concepts and workflows such as Redux, Flux, and Webpack. You will also be responsible for profiling and improving front-end performance and documenting our front-end codebase.

To ensure success as a React.js Developer, you should have in-depth knowledge of JavaScript and React concepts, excellent front-end coding skills, and a good understanding of progressive web applications. Ultimately, a top-class React.js Developer should be able to design and build modern user interface components to enhance application performance.

React.js Developer Responsibilities:
Meeting with the development team to discuss user interface ideas and applications.
Reviewing application requirements and interface designs.
Identifying web-based user interactions.
Developing and implementing highly-responsive user interface components using React concepts.
Writing application interface codes using JavaScript following React.js workflows.
Troubleshooting interface software and debugging application codes.
Developing and implementing front-end architecture to support user interface concepts.
Monitoring and improving front-end performance.
Documenting application changes and developing updates.

React.js Developer Requirements:
2+ years of experience with React.js.
In-depth knowledge of JavaScript, CSS, HTML, and front-end languages.
Knowledge of REACT tools including React.js, Webpack, Enzyme, Redux, and Flux.
Experience with user interface design.
Knowledge of performance testing frameworks including Mocha and Jest.
Experience with browser-based debugging and performance testing software.
Excellent troubleshooting skills.
Good project management skills.`;

const HIGHLIGHTED_KEYWORDS = ['front-end development', 'Redux', 'JavaScript', 'React.js', 'web applications', 'coding', 'codebase', 'codes'];

/* ── sub-tabs component ───────────────────────── */
function SkillSection({ title, badge, desc, tip, rows }) {
  const [subTab, setSubTab] = useState(0);

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader title={title} badge={badge} />
      <SectionDesc>{desc}</SectionDesc>
      <TipText>{tip}</TipText>
      <Box sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
        <Tabs
          value={subTab}
          onChange={(_, v) => setSubTab(v)}
          sx={{
            minHeight: 42,
            bgcolor: '#f8fafc',
            borderBottom: `1px solid ${THEME.border}`,
            '& .MuiTabs-indicator': { bgcolor: THEME.primary, height: 3 },
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              color: THEME.textSecondary,
              minHeight: 42,
              '&.Mui-selected': { color: THEME.primary },
            },
          }}
        >
          <Tab label="Skills Comparison" />
          <Tab label="Highlighted Skills" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {subTab === 0 && <SkillsTable rows={rows} />}
          {subTab === 1 && (
            <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', py: 2 }}>
              Skills highlighted in the job description will appear here.
            </Typography>
          )}
        </Box>
      </Box>
      <AddSkillRow />
    </Box>
  );
}

/* ── Job Description Tab ─────────────────────── */
function JobDescriptionTab({ jobDescriptionPreview }) {
  const text = (jobDescriptionPreview || JOB_DESCRIPTION_TEXT).trim() || JOB_DESCRIPTION_TEXT;
  const paragraphs = text.split('\n\n').filter(Boolean);

  function highlightText(text) {
    let parts = [text];
    HIGHLIGHTED_KEYWORDS.forEach((kw) => {
      parts = parts.flatMap((part) => {
        if (typeof part !== 'string') return [part];
        const regex = new RegExp(`(${kw})`, 'gi');
        return part.split(regex).map((seg, i) =>
          regex.test(seg) ? (
            <mark key={i} style={{ background: 'rgba(51, 94, 222, 0.12)', color: '#335ede', borderRadius: 2, padding: '0 2px' }}>
              {seg}
            </mark>
          ) : (
            seg
          )
        );
      });
    });
    return parts;
  }

  return (
    <Box sx={{ p: 3 }}>
      {paragraphs.map((para, i) => {
        const isTitle = i === 0;
        return (
          <Typography
            key={i}
            variant={isTitle ? 'h5' : 'body2'}
            sx={{
              fontFamily: 'var(--font-family)',
              fontWeight: isTitle ? 700 : 400,
              color: 'var(--text-primary)',
              mb: 2,
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}
          >
            {highlightText(para)}
          </Typography>
        );
      })}
    </Box>
  );
}

/* ── Resume Report Tab ───────────────────────── */
function ResumeReportTab({ report }) {
  const searchabilityRows = report?.searchability_rows ?? SEARCHABILITY_ROWS;
  const hardSkillsRows = report?.hard_skills_rows ?? HARD_SKILLS_ROWS;
  const softSkillsRows = report?.soft_skills_rows ?? SOFT_SKILLS_ROWS;
  const recruiterTipsRows = report?.recruiter_tips_rows ?? RECRUITER_TIPS_ROWS;
  const formattingRows = report?.formatting_rows ?? FORMATTING_ROWS;

  return (
    <Box>
      {/* Insight banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          bgcolor: THEME.primarySoft,
          border: `1px solid rgba(51, 94, 222, 0.2)`,
          borderRadius: 2,
          px: 2,
          py: 1.5,
          mb: 3,
        }}
      >
        <BoltRoundedIcon sx={{ color: THEME.primary, fontSize: 22, flexShrink: 0, mt: 0.15 }} />
        <Typography variant="body2" sx={{ color: THEME.textSecondary, flex: 1, fontSize: '0.875rem', lineHeight: 1.55 }}>
          <strong style={{ color: THEME.textPrimary }}>Production insight</strong>
          {' — '}
          Align exact wording from the job description with your resume headers and skills list to maximize ATS keyword matching.
        </Typography>
      </Box>

      {/* Searchability */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Searchability" badge="IMPORTANT" />
        <SectionDesc>
          An ATS (Applicant Tracking System) is a software used by 90% of companies and recruiters to search for resumes
          and manage the hiring process. Below is how well your resume appears in an ATS and a recruiter search.
        </SectionDesc>
        <TipText>Fix the red Xs to ensure your resume is easily searchable by recruiters and parsed correctly by the ATS.</TipText>
        <Box sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
          {searchabilityRows.map((row, i) => (
            <Box key={i} sx={{ px: 2, bgcolor: i % 2 === 0 ? '#fafbfc' : '#fff' }}>
              <CheckRow label={row.label} items={row.items} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Hard Skills */}
      <SkillSection
        title="Hard skills"
        badge="HIGH SCORE IMPACT"
        desc="Hard skills enable you to perform job-specific duties and responsibilities. You can learn hard skills in the classroom, training courses, and on the job. These skills are typically focused on teachable tasks and measurable abilities such as the use of tools, equipment, or software. Hard skills have a high impact on your match score."
        tip="Match the skills in your resume to the exact spelling in the job description. Prioritize skills that appear most frequently in the job description."
        rows={hardSkillsRows}
      />

      {/* Soft Skills */}
      <SkillSection
        title="Soft skills"
        badge="MEDIUM SCORE IMPACT"
        desc="Soft skills are your traits and abilities that are not unique to any job. Your soft skills are part of your personality, and can be learned also. These skills are the traits that typically make you a good employee for any company such as time management and communication. Soft skills have a medium impact on your match score."
        tip="Prioritize hard skills in your resume to get interviews, and then showcase your soft skills in the interview to get jobs."
        rows={softSkillsRows}
      />

      {/* Recruiter Tips */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Recruiter tips" badge="IMPORTANT" />
        <Box sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
          {recruiterTipsRows.map((row, i) => (
            <Box key={i} sx={{ px: 2, bgcolor: i % 2 === 0 ? '#fafbfc' : '#fff' }}>
              <CheckRow label={row.label} items={row.items} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Formatting */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Formatting" />
        <Box sx={{ border: `1px solid ${THEME.border}`, borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
          {formattingRows.map((row, i) => (
            <Box key={i} sx={{ px: 2, bgcolor: i % 2 === 0 ? '#fafbfc' : '#fff' }}>
              <CheckRow label={row.label} items={row.items} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ── ATS Score Card ───────────────────────────── */
function AtsScoreCard({ score, scoreCategories }) {
  const navigate = useNavigate();
  const categories = scoreCategories ?? SCORE_CATEGORIES;
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  return (
    <Card
      elevation={0}
      sx={{
        width: { xs: '100%', md: 280 },
        minWidth: { md: 260 },
        flexShrink: 0,
        borderRadius: 2,
        border: `1px solid ${THEME.border}`,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        bgcolor: '#fff',
        alignSelf: 'flex-start',
        position: { md: 'sticky' },
        top: { md: 12 },
      }}
    >
      <Grid container sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Grid item xs={12}>
        {/* Circular score */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{ color: THEME.textSecondary, mb: 1.5, fontWeight: 700, fontSize: '0.65rem', letterSpacing: 0.08, textTransform: 'uppercase' }}
          >
            Match rate
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={150}
              thickness={5}
              sx={{ color: '#f1f5f9', position: 'absolute' }}
            />
            <CircularProgress
              variant="determinate"
              value={pct}
              size={150}
              thickness={5}
              sx={{
                color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : THEME.primary,
                '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
              }}
            />
            <Box
              sx={{
                top: 0, left: 0, bottom: 0, right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: THEME.textPrimary }}>
                {Math.round(pct)}
                <Typography component="span" sx={{ fontSize: '1.15rem', fontWeight: 600, color: THEME.textSecondary }}>%</Typography>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Buttons */}
        <Button
          variant="contained"
          disableElevation
          fullWidth
          startIcon={<FileUploadRoundedIcon />}
          onClick={() => navigate('/job-scan')}
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            bgcolor: THEME.primary,
            color: '#fff',
            borderRadius: 1,
            textTransform: 'none',
            mb: 1,
            py: 1,
            '&:hover': { bgcolor: 'var(--primary-dark, #2a4bc4)' },
          }}
        >
          Upload & rescan
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AutoFixHighRoundedIcon />}
          onClick={() => navigate('/resume-generator')}
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: THEME.primary,
            borderColor: THEME.primary,
            borderRadius: 1,
            textTransform: 'none',
            py: 1,
            '&:hover': { bgcolor: THEME.primarySoft, borderColor: THEME.primary },
          }}
        >
          Open resume generator
        </Button>

        {/* Category scores */}
        <Box sx={{ mt: 3.5 }}>
          {categories.map((cat) => (
            <Box key={cat.label} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography variant="body2" sx={{ color: THEME.textPrimary, fontWeight: 600, fontSize: '0.875rem' }}>
                  {cat.label}
                </Typography>
                {cat.issues > 0 && (
                  <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>
                    {cat.issues} issues to fix
                  </Typography>
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, cat.value))}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: String(cat.color || '').includes('error') ? '#dc2626' : THEME.primary,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

/* ── Main Page ────────────────────────────────── */
export default function ScanReport() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState(0);
  const location = useLocation();
  const stateReport = location.state?.report;
  const fileName = location.state?.fileName;
  const score = stateReport?.score ?? 32;
  const scoreCategories = stateReport?.score_categories;

  return (
    <Box
      sx={{
        minHeight: '100%',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        bgcolor: '#fafbfc',
        fontFamily: 'var(--font-family)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          px: { xs: 2, sm: 2.5, md: 3 },
          py: 3,
        }}
      >
        <PageBreadcrumb
          items={[
            { label: 'AI Resume Studio', to: '/ai-resume-studio', showBackIcon: true },
            { label: 'ATS Scanner', to: '/job-scan' },
            { label: 'Match report' },
          ]}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3, gap: { sm: 2 } }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: 0.08,
                color: THEME.primary,
                textTransform: 'uppercase',
                mb: 0.75,
              }}
            >
              ATS analysis
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                color: THEME.textPrimary,
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              {fileName || 'Resume'} — match report
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: THEME.textSecondary, mt: 0.75, lineHeight: 1.5 }}>
              Keyword alignment, searchability, skills, and formatting — same visual language as your resume analysis reports.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              startIcon={<BookmarkBorderRoundedIcon sx={{ fontSize: 18 }} />}
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: THEME.primary,
                borderColor: THEME.primary,
                borderRadius: 1,
                '&:hover': { bgcolor: THEME.primarySoft },
              }}
            >
              Track
            </Button>
            <Button
              size="small"
              startIcon={<PrintRoundedIcon sx={{ fontSize: 18 }} />}
              variant="outlined"
              onClick={() => window.print()}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: THEME.textSecondary,
                borderColor: THEME.border,
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.04)' },
              }}
            >
              Print
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 2, md: 3 },
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', lg: 'row' },
            width: '100%',
            minWidth: 0,
          }}
        >
          <AtsScoreCard score={score} scoreCategories={scoreCategories} />

          <Card
            elevation={0}
            sx={{
              flex: '1 1 0%',
              minWidth: 0,
              width: '100%',
              borderRadius: 2,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <Tabs
              value={mainTab}
              onChange={(_, v) => setMainTab(v)}
              variant="fullWidth"
              sx={{
                bgcolor: '#fff',
                borderBottom: `1px solid ${THEME.border}`,
                minHeight: 48,
                '& .MuiTabs-indicator': { bgcolor: THEME.primary, height: 3 },
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  textTransform: 'none',
                  color: THEME.textSecondary,
                  minHeight: 48,
                  '&.Mui-selected': { color: THEME.primary },
                  '&:not(.Mui-selected)': { bgcolor: '#f8fafc' },
                },
              }}
            >
              <Tab label="Resume report" />
              <Tab label="Job description" />
            </Tabs>

            <Grid container sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: 3 } }}>
              <Grid item xs={12}>
                {mainTab === 0 && <ResumeReportTab report={stateReport} />}
                {mainTab === 1 && <JobDescriptionTab jobDescriptionPreview={stateReport?.job_description_preview} />}
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
