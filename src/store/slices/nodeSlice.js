import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/nodes';

const initialState = {
  nodeTemplates: [],
  categories: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Get all node templates
export const getNodeTemplates = createAsyncThunk('node/getAll', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get node categories
export const getNodeCategories = createAsyncThunk('node/categories', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const nodeSlice = createSlice({
  name: 'node',
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
      .addCase(getNodeTemplates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNodeTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nodeTemplates = action.payload;
      })
      .addCase(getNodeTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getNodeCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { reset } = nodeSlice.actions;
export default nodeSlice.reducer;