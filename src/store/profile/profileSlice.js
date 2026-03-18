import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileDataAPI, patchProfileAPI, invalidateFieldAnswersAPI } from '../../services';
import {
  mapParsedProfile,
  mapParsedExperience,
  mapParsedEducation,
  mapParsedSkills,
  mapParsedProjects,
  mapParsedLinks,
  mapParsedPreferences,
} from '../../utilities/resumeParsedMapper';
import {
  toLegacyTechSkill,
  toLegacySoftSkill,
  fromLegacyTechSkill,
  fromLegacySoftSkill,
  createEmptyTechSkill,
  createEmptySoftSkill,
} from '../../pages/profile/skills/normalizers';

const emptyExperience = {
  jobTitle: '', companyName: '', employmentType: '', startDate: '', endDate: '',
  location: '', workMode: '', description: '', techStack: '',
};
const emptyEducation = {
  degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '', grade: '', location: '',
};
const emptyProject = {
  name: '', description: '', role: '', techStack: '', githubUrl: '', liveUrl: '', projectType: '',
};
const emptyLink = { label: '', url: '' };

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  willingToWorkIn: [],
  professionalHeadline: '',
  professionalSummary: '',
  experiences: [{ ...emptyExperience }],
  educations: [{ ...emptyEducation }],
  techSkills: [createEmptyTechSkill()],
  softSkills: [createEmptySoftSkill()],
  projects: [{ ...emptyProject }],
  preferences: {
    desiredRoles: '',
    employmentType: [],
    experienceLevel: '',
    openToRemote: '',
    willingToRelocate: '',
    preferredLocations: [],
    expectedSalaryRange: '',
  },
  links: {
    linkedInUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    otherLinks: [{ ...emptyLink }],
  },
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getProfileDataAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Failed to load profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { profile } = getState();
      const payload = buildProfilePayload(profile.form);
      const { data } = await patchProfileAPI(payload);
      try {
        await invalidateFieldAnswersAPI();
        if (typeof window !== 'undefined') {
          window.postMessage({ type: 'HIREMATE_PROFILE_SAVED' }, window.location.origin);
        }
      } catch (_) { /* non-blocking */ }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Failed to save profile');
    }
  }
);

function buildProfilePayload(form) {
  return {
    firstName: form.firstName ?? '',
    lastName: form.lastName ?? '',
    email: form.email ?? '',
    phone: form.phone ?? '',
    city: form.city ?? '',
    country: form.country ?? '',
    willingToWorkIn: Array.isArray(form.willingToWorkIn) ? form.willingToWorkIn : [],
    professionalHeadline: form.professionalHeadline ?? '',
    professionalSummary: form.professionalSummary ?? '',
    experiences: Array.isArray(form.experiences) ? form.experiences : [],
    educations: Array.isArray(form.educations) ? form.educations : [],
    techSkills: Array.isArray(form.techSkills) ? form.techSkills.map(toLegacyTechSkill) : [],
    softSkills: Array.isArray(form.softSkills) ? form.softSkills.map(toLegacySoftSkill) : [],
    projects: Array.isArray(form.projects) ? form.projects : [],
    preferences: {
      desiredRoles: form.preferences?.desiredRoles ?? '',
      employmentType: Array.isArray(form.preferences?.employmentType) ? form.preferences.employmentType : [],
      experienceLevel: form.preferences?.experienceLevel ?? '',
      openToRemote: form.preferences?.openToRemote ?? '',
      willingToRelocate: form.preferences?.willingToRelocate ?? '',
      preferredLocations: Array.isArray(form.preferences?.preferredLocations) ? form.preferences.preferredLocations : [],
      expectedSalaryRange: form.preferences?.expectedSalaryRange ?? '',
    },
    links: {
      linkedInUrl: form.links?.linkedInUrl ?? '',
      githubUrl: form.links?.githubUrl ?? '',
      portfolioUrl: form.links?.portfolioUrl ?? '',
      otherLinks: Array.isArray(form.links?.otherLinks) ? form.links.otherLinks : [],
    },
  };
}

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    form: initialForm,
    submitLoading: false,
    submitError: null,
    fetchLoading: false,
  },
  reducers: {
    mergeFromResume(state, { payload: parsedData }) {
      if (!parsedData) return;
      const p = mapParsedProfile(parsedData);
      state.form.firstName = p.firstName;
      state.form.lastName = p.lastName;
      state.form.email = p.email;
      state.form.phone = p.phone;
      state.form.city = p.city;
      state.form.country = p.country;
      state.form.willingToWorkIn = Array.isArray(p.willingToWorkIn) ? p.willingToWorkIn : [];
      state.form.professionalHeadline = p.headline;
      state.form.professionalSummary = p.summary;

      const exp = mapParsedExperience(parsedData);
      state.form.experiences = exp.length > 0 ? exp : [{ ...emptyExperience }];

      const edu = mapParsedEducation(parsedData);
      state.form.educations = edu.length > 0 ? edu : [{ ...emptyEducation }];

      const { techSkills: t, softSkills: s } = mapParsedSkills(parsedData);
      state.form.techSkills = t.length > 0 ? t.map((item, i) => fromLegacyTechSkill(item, i)) : [createEmptyTechSkill()];
      state.form.softSkills = s.length > 0 ? s.map((item, i) => fromLegacySoftSkill(item, i)) : [createEmptySoftSkill()];

      const proj = mapParsedProjects(parsedData);
      state.form.projects = proj.length > 0 ? proj : [{ ...emptyProject }];

      const prefs = mapParsedPreferences(parsedData);
      state.form.preferences = {
        desiredRoles: prefs.desiredRoles ?? '',
        employmentType: Array.isArray(prefs.employmentType) ? prefs.employmentType : [],
        experienceLevel: prefs.experienceLevel ?? '',
        openToRemote: prefs.openToRemote ?? '',
        willingToRelocate: prefs.willingToRelocate ?? '',
        preferredLocations: Array.isArray(prefs.preferredLocations) ? prefs.preferredLocations : [],
        expectedSalaryRange: prefs.expectedSalary ?? prefs.expectedSalaryRange ?? '',
      };

      const links = mapParsedLinks(parsedData);
      state.form.links = {
        linkedInUrl: links.linkedin ?? '',
        githubUrl: links.github ?? '',
        portfolioUrl: links.portfolio ?? '',
        otherLinks: Array.isArray(links.otherLinks) && links.otherLinks.length > 0 ? links.otherLinks : [{ ...emptyLink }],
      };
    },
    setBasicInfo(state, { payload }) {
      if (payload.firstName !== undefined) state.form.firstName = payload.firstName;
      if (payload.lastName !== undefined) state.form.lastName = payload.lastName;
      if (payload.email !== undefined) state.form.email = payload.email;
      if (payload.phone !== undefined) state.form.phone = payload.phone;
      if (payload.city !== undefined) state.form.city = payload.city;
      if (payload.country !== undefined) state.form.country = payload.country;
      if (payload.professionalHeadline !== undefined) state.form.professionalHeadline = payload.professionalHeadline;
      if (payload.professionalSummary !== undefined) state.form.professionalSummary = payload.professionalSummary;
      if (payload.willingToWorkIn !== undefined) state.form.willingToWorkIn = payload.willingToWorkIn;
    },
    setExperiences(state, { payload }) {
      state.form.experiences = payload;
    },
    setEducations(state, { payload }) {
      state.form.educations = payload;
    },
    setTechSkills(state, { payload }) {
      state.form.techSkills = payload;
    },
    setSoftSkills(state, { payload }) {
      state.form.softSkills = payload;
    },
    setProjects(state, { payload }) {
      state.form.projects = payload;
    },
    setPreferences(state, { payload }) {
      if (!state.form.preferences) state.form.preferences = { ...initialForm.preferences };
      Object.assign(state.form.preferences, payload);
    },
    setLinks(state, { payload }) {
      if (!state.form.links) state.form.links = { ...initialForm.links };
      Object.assign(state.form.links, payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.submitError = null;
        const payload = action.payload;
        if (payload) {
          state.form.firstName = payload.firstName ?? '';
          state.form.lastName = payload.lastName ?? '';
          state.form.email = payload.email ?? '';
          state.form.phone = payload.phone ?? '';
          state.form.city = payload.city ?? '';
          state.form.country = payload.country ?? '';
          state.form.willingToWorkIn = Array.isArray(payload.willingToWorkIn) ? payload.willingToWorkIn : [];
          state.form.professionalHeadline = payload.professionalHeadline ?? '';
          state.form.professionalSummary = payload.professionalSummary ?? '';
          state.form.experiences = Array.isArray(payload.experiences) && payload.experiences.length > 0
            ? payload.experiences.map((e) => ({ ...emptyExperience, ...e }))
            : [{ ...emptyExperience }];
          state.form.educations = Array.isArray(payload.educations) && payload.educations.length > 0
            ? payload.educations.map((e) => ({ ...emptyEducation, ...e }))
            : [{ ...emptyEducation }];
          state.form.techSkills = Array.isArray(payload.techSkills) && payload.techSkills.length > 0
            ? payload.techSkills.map((s, i) => fromLegacyTechSkill(s, i))
            : [createEmptyTechSkill()];
          state.form.softSkills = Array.isArray(payload.softSkills) && payload.softSkills.length > 0
            ? payload.softSkills.map((s, i) => fromLegacySoftSkill(s, i))
            : [createEmptySoftSkill()];
          state.form.projects = Array.isArray(payload.projects) && payload.projects.length > 0
            ? payload.projects.map((p) => ({ ...emptyProject, ...p }))
            : [{ ...emptyProject }];
          state.form.preferences = payload.preferences && typeof payload.preferences === 'object'
            ? {
                desiredRoles: payload.preferences.desiredRoles ?? '',
                employmentType: Array.isArray(payload.preferences.employmentType) ? payload.preferences.employmentType : [],
                experienceLevel: payload.preferences.experienceLevel ?? '',
                openToRemote: payload.preferences.openToRemote ?? '',
                willingToRelocate: payload.preferences.willingToRelocate ?? '',
                preferredLocations: Array.isArray(payload.preferences.preferredLocations) ? payload.preferences.preferredLocations : [],
                expectedSalaryRange: payload.preferences.expectedSalaryRange ?? '',
              }
            : { ...initialForm.preferences };
          const lnks = payload.links && typeof payload.links === 'object' ? payload.links : {};
          const rawOther = lnks.otherLinks || [];
          state.form.links = {
            linkedInUrl: lnks.linkedInUrl ?? '',
            githubUrl: lnks.githubUrl ?? '',
            portfolioUrl: lnks.portfolioUrl ?? '',
            otherLinks: Array.isArray(rawOther) && rawOther.length > 0 ? rawOther.map((o) => ({ ...emptyLink, ...o })) : [{ ...emptyLink }],
          };
        }
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.fetchLoading = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.submitLoading = false;
        state.submitError = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const {
  mergeFromResume,
  setBasicInfo,
  setExperiences,
  setEducations,
  setTechSkills,
  setSoftSkills,
  setProjects,
  setPreferences,
  setLinks,
} = profileSlice.actions;

export default profileSlice.reducer;
