import { useState } from 'react';
import { Box, Button, TextField, CircularProgress } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { BASE_URL } from '../../../utilities/const';

/**
 * AI section regeneration button + streaming preview.
 *
 * Props:
 *   section    – 'summary' | 'skills' | 'experience_bullet'
 *   resumeId   – current UserResume.id (null = no resume selected, button disabled)
 *   onChange   – (content: string) => void  called once streaming finishes
 *   context    – optional { role_index?, bullet_index?, instruction? }
 */
export default function SectionEditor({ section, resumeId, onChange, context }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [instruction, setInstruction] = useState('');

  async function handleGenerate() {
    if (!resumeId) return;

    setIsGenerating(true);
    setStreamedContent('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/resume/${resumeId}/section/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          section,
          stream: true,
          context: instruction.trim()
            ? { ...(context || {}), instruction: instruction.trim() }
            : context || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalContent = '';

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.error) {
              throw new Error(event.error);
            }
            if (event.delta) {
              finalContent += event.delta;
              setStreamedContent(finalContent);
            }
            if (event.done) {
              onChange(event.full_content);
              setInstruction('');
            }
          } catch (e) {
            if (e.message && !e.message.startsWith('JSON')) throw e;
          }
        }
      }
    } catch (err) {
      console.error('Section generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Optional: custom instruction (e.g. 'make it more quantified')"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
          disabled={isGenerating}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.8rem' } }}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={isGenerating ? <CircularProgress size={14} /> : <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={handleGenerate}
          disabled={isGenerating || !resumeId}
          sx={{ whiteSpace: 'nowrap', minWidth: 130, textTransform: 'none', fontFamily: 'var(--font-family)', fontSize: '0.8rem', borderRadius: 1 }}
        >
          {isGenerating ? 'Generating…' : 'Generate AI'}
        </Button>
      </Box>

      {isGenerating && streamedContent && (
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            bgcolor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 1,
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            color: '#374151',
            lineHeight: 1.6,
          }}
        >
          {streamedContent}
          <span className="blinking-cursor">|</span>
        </Box>
      )}
    </Box>
  );
}
