import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

// ✅ 1. READ FROM STORAGE IMMEDIATELY (Prevents refresh redirect issues)
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

// SUPER ADMIN LOGIN
export const loginSuperAdmin = createAsyncThunk(
  'auth/loginSuperAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/super-admin/login', { email, password });
      return res.data; 
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
      return res.data; 
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
      return res.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,  // ✅ Initialize with data from localStorage
    token: storedToken, // ✅ Initialize with data from localStorage
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
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Helper to handle successful login for ANY role
    const handleLoginSuccess = (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    };

    builder
      // SUPER ADMIN
      .addCase(loginSuperAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginSuperAdmin.fulfilled, handleLoginSuccess)
      .addCase(loginSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // DOCTOR
      .addCase(loginDoctor.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginDoctor.fulfilled, handleLoginSuccess)
      .addCase(loginDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // USER
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, handleLoginSuccess)
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
