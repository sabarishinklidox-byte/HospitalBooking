// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

// SUPER ADMIN LOGIN
export const loginSuperAdmin = createAsyncThunk(
  'auth/loginSuperAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/super-admin/login', { email, password });
      return res.data; // { token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);

// DOCTOR LOGIN
export const loginDoctor = createAsyncThunk(
  'auth/loginDoctor',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/doctor/login', { email, password });
      return res.data; // { token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);

// PATIENT / USER LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/user/login', { email, password });
      return res.data; // { token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
    restoreAuth(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    // ✅ ADDED setUser REDUCER
    setUser(state, action) {
      state.user = action.payload;
      // Keep localStorage in sync so refresh doesn't revert changes
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // SUPER ADMIN
      .addCase(loginSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // DOCTOR
      .addCase(loginDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // PATIENT / USER
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      });
  },
});

// ✅ EXPORT setUser HERE
export const { logout, clearError, restoreAuth, setUser } = authSlice.actions;
export default authSlice.reducer;
