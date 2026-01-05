import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BASE_URL}/executions`;

const initialState = {
  executions: [],
  currentExecution: null,
  stats: null,

  isLoading: false,
  isError: false,
  message: '',
};

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/* ============================
   Async Thunks
============================ */

// Get all executions
export const getExecutions = createAsyncThunk(
  'execution/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.get(API_URL, getConfig(token));
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch executions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single execution
export const getExecution = createAsyncThunk(
  'execution/get',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.get(`${API_URL}/${id}`, getConfig(token));
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch execution';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get executions by workflow
export const getWorkflowExecutions = createAsyncThunk(
  'execution/getByWorkflow',
  async (workflowId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.get(
        `${API_URL}/workflow/${workflowId}`,
        getConfig(token)
      );
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch workflow executions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get execution stats
export const getExecutionStats = createAsyncThunk(
  'execution/stats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.get(`${API_URL}/stats`, getConfig(token));
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch stats';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Stop execution
export const stopExecution = createAsyncThunk(
  'execution/stop',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.post(
        `${API_URL}/${id}/stop`,
        {},
        getConfig(token)
      );
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to stop execution';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete execution
export const deleteExecution = createAsyncThunk(
  'execution/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      await axios.delete(`${API_URL}/${id}`, getConfig(token));
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete execution';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* ============================
   Slice
============================ */

const executionSlice = createSlice({
  name: 'execution',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentExecution: (state) => {
      state.currentExecution = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- Get All ---------- */
      .addCase(getExecutions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getExecutions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.executions = action.payload;
      })
      .addCase(getExecutions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ---------- Get One ---------- */
      .addCase(getExecution.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getExecution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExecution = action.payload;
      })
      .addCase(getExecution.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ---------- Get Workflow Executions ---------- */
      .addCase(getWorkflowExecutions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getWorkflowExecutions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.executions = action.payload;
      })
      .addCase(getWorkflowExecutions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ---------- Stats ---------- */
      .addCase(getExecutionStats.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getExecutionStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getExecutionStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ---------- Stop Execution ---------- */
      .addCase(stopExecution.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(stopExecution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExecution = action.payload;
      })
      .addCase(stopExecution.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ---------- Delete ---------- */
      .addCase(deleteExecution.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteExecution.fulfilled, (state, action) => {
        state.isLoading = false;
        state.executions = state.executions.filter(
          (e) => e._id !== action.payload
        );
      })
      .addCase(deleteExecution.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentExecution } = executionSlice.actions;
export default executionSlice.reducer;
