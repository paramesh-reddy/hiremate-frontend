import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, registerAPI, getProfileAPI } from '../../services';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const removeUserFromStorage = () => localStorage.removeItem(USER_KEY);

// API may return access_token or token
const getTokenFromPayload = (data) => data?.access_token ?? data?.token;

const saveTokenIfPresent = (data) => {
  const token = getTokenFromPayload(data);
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await loginAPI(credentials);
      saveTokenIfPresent(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await registerAPI(userData);
      saveTokenIfPresent(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getProfileAPI();
      saveTokenIfPresent(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load profile');
    }
  }
);

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      removeUserFromStorage();
    },
    clearError(state) {
      state.error = null;
    },
    loginWithGoogle(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem(TOKEN_KEY, token);
      saveUserToStorage(user);
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = getTokenFromPayload(action.payload) ?? state.token;
        const user = action.payload?.user ?? action.payload;
        state.user = user;
        saveUserToStorage(user);
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = getTokenFromPayload(action.payload) ?? state.token;
        const user = action.payload?.user ?? action.payload;
        state.user = user;
        saveUserToStorage(user);
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // getProfile
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const token = getTokenFromPayload(action.payload);
        if (token) state.token = token;
        const user = action.payload?.user ?? action.payload;
        state.user = user;
        saveUserToStorage(user);
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, loginWithGoogle } = authSlice.actions;
export default authSlice.reducer;
