import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints'; // ✅ Import endpoints

// ✅ 1. READ FROM STORAGE IMMEDIATELY
const storedToken = localStorage.getItem('token') || localStorage.getItem('authToken');
const storedUser = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;
const storedClinic = localStorage.getItem('clinic')
  ? JSON.parse(localStorage.getItem('clinic'))
  : null;

// SUPER ADMIN LOGIN
export const loginSuperAdmin = createAsyncThunk(
  'auth/loginSuperAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // ✅ Use ENDPOINTS.SUPER_ADMIN.LOGIN
      const res = await api.post(ENDPOINTS.SUPER_ADMIN.LOGIN, { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);

// CLINIC ADMIN LOGIN
export const loginClinicAdmin = createAsyncThunk(
  'auth/loginClinicAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // ✅ Use ENDPOINTS.ADMIN.LOGIN (Assuming standard admin login)
      // Check your endpoints file to match exactly. Often it's ENDPOINTS.ADMIN.LOGIN
      const res = await api.post(ENDPOINTS.ADMIN.LOGIN, { email, password });
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
      // ✅ Use ENDPOINTS.DOCTOR.LOGIN
      const res = await api.post(ENDPOINTS.DOCTOR.LOGIN, { email, password });
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
      // ✅ Use ENDPOINTS.USER.LOGIN
      const res = await api.post(ENDPOINTS.USER.LOGIN, { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    clinic: storedClinic,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.clinic = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('clinic');
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setClinic(state, action) {
      state.clinic = action.payload;
      localStorage.setItem('clinic', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    const handleLoginSuccess = (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;

      if (action.payload.clinic) {
        state.clinic = action.payload.clinic;
        localStorage.setItem('clinic', JSON.stringify(action.payload.clinic));
      }

      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    };

    builder
      // SUPER ADMIN
      .addCase(loginSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSuperAdmin.fulfilled, handleLoginSuccess)
      .addCase(loginSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // CLINIC ADMIN
      .addCase(loginClinicAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginClinicAdmin.fulfilled, handleLoginSuccess)
      .addCase(loginClinicAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // DOCTOR
      .addCase(loginDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginDoctor.fulfilled, handleLoginSuccess)
      .addCase(loginDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      })

      // USER
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, handleLoginSuccess)
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Login failed';
      });
  },
});

export const { logout, clearError, setUser, setClinic } = authSlice.actions;
export default authSlice.reducer;
