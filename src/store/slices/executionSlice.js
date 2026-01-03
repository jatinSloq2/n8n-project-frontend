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
  headers: { Authorization: `Bearer ${token}` },
});

// Get all executions
export const getExecutions = createAsyncThunk('execution/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.get(API_URL, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get single execution
export const getExecution = createAsyncThunk('execution/get', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.get(`${API_URL}/${id}`, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get workflow executions
export const getWorkflowExecutions = createAsyncThunk(
  'execution/getByWorkflow',
  async (workflowId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(`${API_URL}/workflow/${workflowId}`, getConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get execution stats
export const getExecutionStats = createAsyncThunk('execution/stats', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.get(`${API_URL}/stats`, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Stop execution
export const stopExecution = createAsyncThunk('execution/stop', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.post(`${API_URL}/${id}/stop`, {}, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete execution
export const deleteExecution = createAsyncThunk('execution/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    await axios.delete(`${API_URL}/${id}`, getConfig(token));
    return id;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const executionSlice = createSlice({
  name: 'execution',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExecutions.pending, (state) => {
        state.isLoading = true;
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
      .addCase(getExecution.fulfilled, (state, action) => {
        state.currentExecution = action.payload;
      })
      .addCase(getWorkflowExecutions.fulfilled, (state, action) => {
        state.executions = action.payload;
      })
      .addCase(getExecutionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(deleteExecution.fulfilled, (state, action) => {
        state.executions = state.executions.filter((e) => e._id !== action.payload);
      });
  },
});

export const { reset } = executionSlice.actions;
export default executionSlice.reducer;