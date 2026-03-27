import { useDispatch, useSelector } from 'react-redux';
import { Box, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CustomInput from '../../../components/inputs/CustomInput';
import CustomSelect from '../../../components/inputs/CustomSelect';
import CustomButton from '../../../components/common/CustomButton';
import SectionCard from '../components/SectionCard';
import { setExperiences } from '../../../store/profile/profileSlice';
import { FORM_GRID_SX, SECTION_TITLE_SX } from '../constants';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

const defaultExperience = {
  jobTitle: '', companyName: '', employmentType: '', startDate: '', endDate: '',
  location: '', workMode: '', description: '', techStack: '', noticePeriod: '',
};

export default function ExperienceTab() {
  const dispatch = useDispatch();
  const experiences = useSelector((state) => state.profile?.form?.experiences) ?? [{ ...defaultExperience }];

  const updateAt = (idx, field, value) => {
    const next = experiences.map((x, i) => (i === idx ? { ...x, [field]: value } : x));
    dispatch(setExperiences(next));
  };

  const addExperience = () => dispatch(setExperiences([...experiences, { ...defaultExperience }]));
  const removeExperience = (idx) => {
    if (experiences.length <= 1) return;
    dispatch(setExperiences(experiences.filter((_, i) => i !== idx)));
  };
  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...experiences];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    dispatch(setExperiences(arr));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Box component="p" sx={{ m: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          List your work experience (latest first). Bullet-style descriptions are ATS-friendly.
        </Box>
      </Box>

      {experiences.map((exp, idx) => (
        <SectionCard key={idx} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box component="span" sx={SECTION_TITLE_SX}>
              Experience #{idx + 1}
            </Box>
            <Box>
              <IconButton size="small" onClick={() => moveUp(idx)} disabled={idx === 0} aria-label="Move up">
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => removeExperience(idx)} disabled={experiences.length <= 1} aria-label="Delete">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={FORM_GRID_SX}>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Job Title *" fullWidth value={exp.jobTitle} onChange={(e) => updateAt(idx, 'jobTitle', e.target.value)} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Company Name *" fullWidth value={exp.companyName} onChange={(e) => updateAt(idx, 'companyName', e.target.value)} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomSelect label="Employment Type" value={exp.employmentType} onChange={(e) => updateAt(idx, 'employmentType', e.target.value)}>
                {EMPLOYMENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </CustomSelect>
            </Box>
            <CustomInput label="Start Date (MM/YYYY)" placeholder="01/2022" value={exp.startDate} onChange={(e) => updateAt(idx, 'startDate', e.target.value)} />
            <CustomInput label="End Date (MM/YYYY) or Present" placeholder="Present" value={exp.endDate} onChange={(e) => updateAt(idx, 'endDate', e.target.value)} />
            {(exp.endDate.trim().toLowerCase() === 'present' || exp.endDate.trim() === '') && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <CustomInput
                  label="Notice Period"
                  placeholder="e.g. 30 days, 2 months, Immediate"
                  value={exp.noticePeriod ?? ''}
                  onChange={(e) => updateAt(idx, 'noticePeriod', e.target.value)}
                />
              </Box>
            )}
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Location (City, Country)" value={exp.location} onChange={(e) => updateAt(idx, 'location', e.target.value)} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomSelect label="Remote / Hybrid / On-site" value={exp.workMode} onChange={(e) => updateAt(idx, 'workMode', e.target.value)}>
                {WORK_MODES.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </CustomSelect>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Description (ATS-optimized, bullet-style)" multiline rows={4} placeholder="• Achievement 1&#10;• Achievement 2" value={exp.description} onChange={(e) => updateAt(idx, 'description', e.target.value)} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <CustomInput label="Tech Stack" placeholder="React, Node.js, PostgreSQL" value={exp.techStack} onChange={(e) => updateAt(idx, 'techStack', e.target.value)} />
            </Box>
          </Box>
        </SectionCard>
      ))}

      <CustomButton variant="outlined" startIcon={<AddIcon />} onClick={addExperience} sx={{ mt: 1 }}>
        Add Experience
      </CustomButton>
    </Box>
  );
}
