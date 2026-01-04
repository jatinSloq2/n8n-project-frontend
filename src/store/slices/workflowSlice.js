import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BASE_URL}/workflows`;
const API_URL_EXECUTE = `${import.meta.env.VITE_BASE_URL}/executions`;

const initialState = {
  workflows: [],
  currentWorkflow: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Create workflow
export const createWorkflow = createAsyncThunk(
  'workflow/create',
  async (workflowData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(API_URL, workflowData, getConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all workflows
export const getWorkflows = createAsyncThunk('workflow/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.get(API_URL, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get single workflow
export const getWorkflow = createAsyncThunk('workflow/get', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.get(`${API_URL}/${id}`, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Update workflow
export const updateWorkflow = createAsyncThunk(
  'workflow/update',
  async ({ id, workflowData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(`${API_URL}/${id}`, workflowData, getConfig(token));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete workflow
export const deleteWorkflow = createAsyncThunk('workflow/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    await axios.delete(`${API_URL}/${id}`, getConfig(token));
    return id;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Execute workflow
export const executeWorkflow = createAsyncThunk(
  'workflow/execute',
  async ({ id, executionData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        `${API_URL_EXECUTE}/${id}/execute`,
        executionData,
        getConfig(token)
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Activate workflow
export const activateWorkflow = createAsyncThunk('workflow/activate', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.patch(`${API_URL}/${id}/activate`, {}, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Deactivate workflow
export const deactivateWorkflow = createAsyncThunk('workflow/deactivate', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.patch(`${API_URL}/${id}/deactivate`, {}, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Duplicate workflow
export const duplicateWorkflow = createAsyncThunk('workflow/duplicate', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.post(`${API_URL}/${id}/duplicate`, {}, getConfig(token));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setCurrentWorkflow: (state, action) => {
      state.currentWorkflow = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createWorkflow.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.workflows.push(action.payload);
        state.currentWorkflow = action.payload;
      })
      .addCase(createWorkflow.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getWorkflows.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWorkflows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.workflows = action.payload;
      })
      .addCase(getWorkflows.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getWorkflow.fulfilled, (state, action) => {
        state.currentWorkflow = action.payload;
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        const index = state.workflows.findIndex((w) => w._id === action.payload._id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
        state.currentWorkflow = action.payload;
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.workflows = state.workflows.filter((w) => w._id !== action.payload);
      })
      .addCase(activateWorkflow.fulfilled, (state, action) => {
        const index = state.workflows.findIndex((w) => w._id === action.payload._id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
      })
      .addCase(deactivateWorkflow.fulfilled, (state, action) => {
        const index = state.workflows.findIndex((w) => w._id === action.payload._id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
      })
      .addCase(duplicateWorkflow.fulfilled, (state, action) => {
        state.workflows.push(action.payload);
      });
  },
});

export const { reset, setCurrentWorkflow } = workflowSlice.actions;
export default workflowSlice.reducer;