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
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

/* ── helpers ─────────────────────────────────── */
function ImpactBadge({ label }) {
  const colors = {
    IMPORTANT: { bg: '#374151', color: '#fff' },
    'HIGH SCORE IMPACT': { bg: '#374151', color: '#fff' },
    'MEDIUM SCORE IMPACT': { bg: '#374151', color: '#fff' },
  };
  const c = colors[label] || { bg: '#374151', color: '#fff' };
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        ml: 1.5,
        fontFamily: 'var(--font-family)',
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: 0.5,
        bgcolor: c.bg,
        color: c.color,
        height: 22,
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
        borderBottom: '1px solid var(--divider)',
        '&:last-child': { borderBottom: 'none' },
        alignItems: 'flex-start',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'var(--font-family)',
          fontWeight: 600,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          minWidth: 160,
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
                  sx={{ fontFamily: 'var(--font-family)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
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
        <TableRow sx={{ '& th': { borderBottom: '2px solid var(--divider)', pb: 1 } }}>
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
          <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid var(--divider)', py: 1 } }}>
            <TableCell sx={{ pl: 0, fontFamily: 'var(--font-family)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              {row.locked ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 14,
                      bgcolor: 'var(--grey-light)',
                      borderRadius: 1,
                      filter: 'blur(4px)',
                    }}
                  />
                  <Button
                    size="small"
                    startIcon={<LockRoundedIcon sx={{ fontSize: 13 }} />}
                    sx={{
                      fontFamily: 'var(--font-family)',
                      fontSize: '0.75rem',
                      color: 'var(--primary)',
                      textTransform: 'none',
                      border: '1px solid var(--primary)',
                      borderRadius: 1,
                      p: '2px 8px',
                    }}
                  >
                    Unlock
                  </Button>
                </Box>
              ) : (
                row.skill
              )}
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
  { locked: true, inResume: false, count: 2 },
  { locked: true, inResume: false, count: 2 },
  { locked: true, inResume: false, count: 2 },
  { skill: 'Front-end development', inResume: false, count: 1 },
  { skill: 'User interface design', inResume: false, count: 1 },
  { skill: 'Mocha', inResume: false, count: 1 },
  { skill: 'React.js', inResume: false, count: 3 },
  { skill: 'JavaScript', inResume: false, count: 4 },
  { skill: 'Redux', inResume: false, count: 2 },
];

const SOFT_SKILLS_ROWS = [
  { locked: true, inResume: false, count: 2 },
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
      <Box sx={{ border: '1px solid var(--divider)', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={subTab}
          onChange={(_, v) => setSubTab(v)}
          sx={{
            minHeight: 42,
            bgcolor: 'var(--grey-5)',
            borderBottom: '1px solid var(--divider)',
            '& .MuiTabs-indicator': { bgcolor: 'var(--primary)', height: 3 },
            '& .MuiTab-root': {
              fontFamily: 'var(--font-family)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              color: 'var(--text-secondary)',
              minHeight: 42,
              '&.Mui-selected': { color: 'var(--primary)' },
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
            <mark key={i} style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 2, padding: '0 2px' }}>
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
      {/* ATS Tip Banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'var(--warning-bg)',
          border: '1px solid #fde68a',
          borderRadius: 1.5,
          px: 2,
          py: 1.2,
          mb: 3,
        }}
      >
        <BoltRoundedIcon sx={{ color: 'var(--warning)', fontSize: 20, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', flex: 1 }}>
          <strong style={{ color: 'var(--text-primary)' }}>ATS-Specific Tips</strong>
          {' '}Adding this job&apos;s company name and web address can{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>help us provide</span> you ATS-specific tips.
        </Typography>
        <Button
          size="small"
          startIcon={<BoltRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{
            fontFamily: 'var(--font-family)',
            fontSize: '0.75rem',
            color: 'var(--warning)',
            textTransform: 'none',
            border: '1px solid #fde68a',
            borderRadius: 1,
            bgcolor: '#fef3c7',
            flexShrink: 0,
            '&:hover': { bgcolor: '#fde68a' },
          }}
        >
          ATS tip
        </Button>
      </Box>

      {/* Searchability */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Searchability" badge="IMPORTANT" />
        <SectionDesc>
          An ATS (Applicant Tracking System) is a software used by 90% of companies and recruiters to search for resumes
          and manage the hiring process. Below is how well your resume appears in an ATS and a recruiter search.
        </SectionDesc>
        <TipText>Fix the red Xs to ensure your resume is easily searchable by recruiters and parsed correctly by the ATS.</TipText>
        <Box sx={{ border: '1px solid var(--divider)', borderRadius: 2, overflow: 'hidden' }}>
          {searchabilityRows.map((row, i) => (
            <Box key={i} sx={{ px: 2, bgcolor: i % 2 === 0 ? 'var(--bg-default)' : 'var(--bg-light)' }}>
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
        <Box sx={{ border: '1px solid var(--divider)', borderRadius: 2, overflow: 'hidden' }}>
          {recruiterTipsRows.map((row, i) => (
            <Box key={i} sx={{ px: 2, bgcolor: i % 2 === 0 ? 'var(--bg-default)' : 'var(--bg-light)' }}>
              <CheckRow label={row.label} items={row.items} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Formatting */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Formatting" />
        <Box sx={{ border: '1px solid var(--divider)', borderRadius: 2, overflow: 'hidden' }}>
          {formattingRows.map((row, i) => (
            <Box key={i} sx={{ px: 2, bgcolor: i % 2 === 0 ? 'var(--bg-default)' : 'var(--bg-light)' }}>
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
  return (
    <Card
      sx={{
        width: { xs: '100%', md: 270 },
        minWidth: { md: 250 },
        flexShrink: 0,
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        alignSelf: 'flex-start',
        position: { md: 'sticky' },
        top: { md: 16 },
      }}
    >
      <Grid container sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Grid item xs={12}>
        {/* Circular score */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-secondary)', mb: 2, fontWeight: 700, fontSize: '1.1rem' }}
          >
            Match Rate
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={150}
              thickness={5}
              sx={{ color: 'var(--grey-light)', position: 'absolute' }}
            />
            <CircularProgress
              variant="determinate"
              value={score}
              size={150}
              thickness={5}
              sx={{
                color: score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--primary-light)',
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
              <Typography
                sx={{ fontFamily: 'var(--font-family)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)' }}
              >
                {score}
                <Typography component="span" sx={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-secondary)' }}>%</Typography>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Buttons */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<FileUploadRoundedIcon />}
          onClick={() => navigate('/job-scan')}
          sx={{
            fontFamily: 'var(--font-family)',
            fontWeight: 600,
            fontSize: '0.82rem',
            bgcolor: 'var(--primary)',
            color: 'white',
            borderRadius: 1.5,
            textTransform: 'none',
            mb: 1,
            py: 1,
            '&:hover': { bgcolor: 'var(--primary-dark)' },
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
            fontFamily: 'var(--font-family)',
            fontWeight: 600,
            fontSize: '0.82rem',
            color: 'var(--primary)',
            borderColor: 'var(--primary)',
            borderRadius: 1.5,
            textTransform: 'none',
            py: 1,
            '&:hover': { bgcolor: 'var(--light-blue-bg)', borderColor: 'var(--primary-dark)' },
          }}
        >
          One-Click Optimize
        </Button>

        {/* Category scores */}
        <Box sx={{ mt: 3.5 }}>
          {categories.map((cat) => (
            <Box key={cat.label} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  {cat.label}
                </Typography>
                {cat.issues > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'var(--font-family)', color: 'var(--error)', fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    {cat.issues} issues to fix
                  </Typography>
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={cat.value}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'var(--grey-light)',
                  '& .MuiLinearProgress-bar': { bgcolor: cat.color, borderRadius: 3 },
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
    <Box sx={{ minHeight: '100%', background: 'var(--bg-app)', fontFamily: 'var(--font-family)' }}>
      {/* Page header */}
      <Box
        sx={{
          bgcolor: 'var(--bg-paper)',
          borderBottom: '1px solid var(--divider)',
          px: { xs: 2, sm: 4 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Back to ATS Scanner">
            <IconButton size="small" onClick={() => navigate('/job-scan')} sx={{ color: 'var(--text-secondary)' }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography
              variant="caption"
              sx={{ fontFamily: 'var(--font-family)', color: 'var(--text-muted)', display: 'block', mb: 0.25, fontSize: '0.78rem' }}
            >
              Resume scan results
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                variant="h6"
                sx={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}
              >
                {fileName ? `${fileName} – ATS Report` : 'Company - React.js Developer'}
              </Typography>
              <Tooltip title="Edit title">
                <IconButton size="small" sx={{ color: 'var(--text-secondary)', p: 0.5 }}>
                  <EditRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<BookmarkBorderRoundedIcon sx={{ fontSize: 17 }} />}
            variant="outlined"
            sx={{
              fontFamily: 'var(--font-family)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--primary)',
              borderColor: 'var(--primary)',
              borderRadius: 1.5,
              '&:hover': { bgcolor: 'var(--light-blue-bg)' },
            }}
          >
            Track
          </Button>
          <Button
            size="small"
            startIcon={<PrintRoundedIcon sx={{ fontSize: 17 }} />}
            variant="outlined"
            sx={{
              fontFamily: 'var(--font-family)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-color)',
              borderRadius: 1.5,
              '&:hover': { bgcolor: 'var(--bg-light)' },
            }}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
          display: 'flex',
          gap: 3,
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Left: ATS Score Card */}
        <AtsScoreCard score={score} scoreCategories={scoreCategories} />

        {/* Right: Details Card */}
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Main Tabs */}
          <Tabs
            value={mainTab}
            onChange={(_, v) => setMainTab(v)}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid var(--divider)',
              '& .MuiTabs-indicator': { bgcolor: 'var(--primary)', height: 3 },
              '& .MuiTab-root': {
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                color: 'var(--text-secondary)',
                minHeight: 52,
                '&.Mui-selected': { color: 'var(--primary)' },
                '&:not(.Mui-selected)': { bgcolor: 'var(--grey-5)' },
              },
            }}
          >
            <Tab label="Resume Report" />
            <Tab label="Job Description" />
          </Tabs>

          <Grid container sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: 3 } }}>
            <Grid item xs={12}>
              {mainTab === 0 && <ResumeReportTab report={stateReport} />}
              {mainTab === 1 && <JobDescriptionTab jobDescriptionPreview={stateReport?.job_description_preview} />}
            </Grid>
          </Grid>
        </Card>
      </Box>
    </Box>
  );
}
