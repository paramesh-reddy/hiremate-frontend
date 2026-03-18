import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Grid,
  Typography,
  Button,
  Box,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PageContainer from '../../components/common/PageContainer';

const JOB_DESCRIPTION_MAX = 10000;

function getInitials(title = '') {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words[0]) return words[0].slice(0, 2).toUpperCase();
  return 'IN';
}

const defaultInterviews = [
  { id: '1', title: 'Full Stack Developer', companyName: '[COMPANY NAME]' },
  { id: '2', title: 'Frontend Developer', companyName: 'Acme Corp' },
  { id: '3', title: 'React & JavaScript practice', companyName: '[COMPANY NAME]' },
];

export default function InterviewPractice() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [jobLink, setJobLink] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [interviews, setInterviews] = useState(defaultInterviews);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);

  const handleCreateInterview = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setJobLink('');
    setJobDescription('');
  };
  const charsLeft = JOB_DESCRIPTION_MAX - jobDescription.length;

  const handleSubmitCreateInterview = () => {
    const raw =
      jobDescription.trim().split(/\n/)[0]?.trim() ||
      jobDescription.trim().slice(0, 40) ||
      jobLink.trim() ||
      'New interview';
    const title = raw.length > 50 ? raw.slice(0, 47) + '...' : raw;
    setInterviews((prev) => [
      { id: String(Date.now()), title, companyName: '[COMPANY NAME]' },
      ...prev,
    ]);
    handleCloseModal();
  };

  const handleDeleteInterview = (id) => {
    setInterviews((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredInterviews = searchQuery.trim()
    ? interviews.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : interviews;

  const selectedInterview = interviews.find((i) => i.id === selectedInterviewId);

  return (
    <PageContainer
      sx={{
        height: 'calc(100vh - var(--navbar-height))',
        minHeight: 'calc(100vh - var(--navbar-height))',
        bgcolor: 'var(--bg-default)',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          flex: '0 0 auto',
          width: '100%',
          maxWidth: 520,
          pt: 2,
          pb: 2,
          pl: 2,
          pr: 2,
          borderRight: selectedInterviewId ? '1px solid #e5e7eb' : 'none',
          overflow: 'auto',
        }}
      >
        <Card
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid #e0e0e0',
          }}
        >
          <Grid container sx={{ p: 3 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Interview practice
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#6b7280', mb: 3 }}
            >
              Create mock interviews and get tailored feedback on your answers.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleCreateInterview}
              sx={{
                textTransform: 'none',
                backgroundColor: '#6C4EE3',
                borderRadius: '12px',
                py: 1.2,
                fontWeight: 600,
                '&:hover': { backgroundColor: '#5a3fd1' },
              }}
            >
              Create an interview
            </Button>

            {/* Search bar */}
            <TextField
              fullWidth
              placeholder="Search interviews"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <SearchRoundedIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
                  </InputAdornment>
                ),
                sx: {
                  mt: 3,
                  borderRadius: 2,
                  bgcolor: '#f9fafb',
                  '& fieldset': { borderColor: '#e5e7eb' },
                },
              }}
            />

            {/* Interview history list */}
            <Box sx={{ mt: 2 }}>
              {filteredInterviews.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="#6b7280">
                    {searchQuery.trim()
                      ? 'No interviews match your search.'
                      : 'No history yet. Create an interview to get started.'}
                  </Typography>
                </Box>
              ) : (
                filteredInterviews.map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => setSelectedInterviewId(item.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      px: 0,
                      borderRadius: 1,
                      border: '1px solid transparent',
                      cursor: 'pointer',
                      bgcolor: selectedInterviewId === item.id ? 'rgba(108, 78, 227, 0.08)' : 'transparent',
                      borderColor: selectedInterviewId === item.id ? '#6C4EE3' : 'transparent',
                      '&:hover': {
                        bgcolor: selectedInterviewId === item.id ? 'rgba(108, 78, 227, 0.08)' : 'rgba(0,0,0,0.02)',
                        borderColor: selectedInterviewId === item.id ? '#6C4EE3' : '#e5e7eb',
                        '& .delete-btn': { opacity: 1 },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(108, 78, 227, 0.14)',
                        color: '#6C4EE3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(item.title)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: '#111827' }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#6b7280', fontSize: '0.8125rem' }}
                      >
                        {item.companyName}
                      </Typography>
                    </Box>
                    <IconButton
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInterview(item.id);
                        if (selectedInterviewId === item.id) setSelectedInterviewId(null);
                      }}
                      size="small"
                      sx={{
                        opacity: 0,
                        color: '#6b7280',
                        '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                      }}
                      aria-label="Delete interview"
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Right side: two cards when an interview is selected */}
      {selectedInterviewId && selectedInterview && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 2,
            pb: 2,
            pr: 2,
            pl: 2,
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
              {selectedInterview.title} · {selectedInterview.companyName}
            </Typography>
          </Box>
          <Card
            onClick={() =>
              navigate(`/interview-practice/${selectedInterviewId}/questions`, {
                state: { profileTitle: `${selectedInterview.title} · ${selectedInterview.companyName}` },
              })
            }
            sx={{
              flex: 1,
              minHeight: 160,
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': {
                borderColor: '#6C4EE3',
                boxShadow: '0 4px 12px rgba(108, 78, 227, 0.15)',
              },
            }}
          >
            <Grid container sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(108, 78, 227, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: '#6C4EE3' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                  AI Questions and Answers Generator
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  Generate practice questions and sample answers tailored to this role.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#6C4EE3', fontWeight: 600, fontSize: '0.875rem' }}>
                  Get started
                  <ChevronRightRoundedIcon sx={{ fontSize: 20, ml: 0.5 }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
          <Card
            sx={{
              flex: 1,
              minHeight: 160,
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': {
                borderColor: '#6C4EE3',
                boxShadow: '0 4px 12px rgba(108, 78, 227, 0.15)',
              },
            }}
          >
            <Grid container sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(108, 78, 227, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <MicRoundedIcon sx={{ fontSize: 28, color: '#6C4EE3' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                  AI Mock Interview
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  Practice with an AI interviewer and get real-time feedback on your responses.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#6C4EE3', fontWeight: 600, fontSize: '0.875rem' }}>
                  Start mock interview
                  <ChevronRightRoundedIcon sx={{ fontSize: 20, ml: 0.5 }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Box>
      )}

      {/* Create interview modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'visible',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header: icon left, close right */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              pt: 2.5,
              px: 2.5,
              pb: 0,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(108, 78, 227, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FlagRoundedIcon sx={{ fontSize: 22, color: '#6C4EE3' }} />
            </Box>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'rgba(108, 78, 227, 0.12)',
                color: '#6C4EE3',
                '&:hover': { bgcolor: 'rgba(108, 78, 227, 0.2)' },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Title & subtitle */}
          <Box sx={{ px: 2.5, pt: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
              Import a job to create an interview
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              Paste a link or job description to get started.
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Job link
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g. linkedin.com/jobs/..."
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <Typography component="span" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      https://
                    </Typography>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 1,
                  bgcolor: '#f9fafb',
                  '& fieldset': { borderColor: '#e5e7eb' },
                },
              }}
              sx={{ mb: 2 }}
            />

            <Typography
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                color: '#374151',
                my: 1.5,
                fontSize: '0.875rem',
              }}
            >
              OR
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Job description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder="Paste in the job description here..."
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value.slice(0, JOB_DESCRIPTION_MAX))
              }
              size="small"
              InputProps={{
                sx: {
                  borderRadius: 1,
                  bgcolor: '#f9fafb',
                  '& fieldset': { borderColor: '#e5e7eb' },
                },
              }}
              sx={{ mb: 0.5 }}
            />
            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 2 }}>
              {charsLeft.toLocaleString()} characters left
            </Typography>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              <Button
                onClick={handleCloseModal}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#374151',
                  borderColor: '#d1d5db',
                  '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitCreateInterview}
                disabled={!jobLink.trim() && !jobDescription.trim()}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: '#6C4EE3',
                  '&:hover': { backgroundColor: '#5a3fd1' },
                }}
              >
                Create interview
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
