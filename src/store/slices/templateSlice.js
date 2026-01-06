import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BASE_URL}/templates`;

const getConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

// Get templates
export const getTemplates = createAsyncThunk(
    'template/getTemplates',
    async (filters = {}, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;

            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(
                `${API_URL}?${params.toString()}`,
                getConfig(token)
            );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Get template by ID
export const getTemplateById = createAsyncThunk(
    'template/getTemplateById',
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;

            const response = await axios.get(
                `${API_URL}/${id}`,
                getConfig(token)
            );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

// Create workflow from template
export const createWorkflowFromTemplate = createAsyncThunk(
    'template/createFromTemplate',
    async ({ templateId, customData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;

            const response = await axios.post(
                `${API_URL}/${templateId}/use`,
                customData,
                getConfig(token)
            );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || error.message
            );
        }
    }
);

const templateSlice = createSlice({
    name: 'template',
    initialState: {
        templates: [],
        categories: [],
        currentTemplate: null,
        isLoading: false,
        error: null,
        total: 0,
    },
    reducers: {
        clearCurrentTemplate: (state) => {
            state.currentTemplate = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTemplates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTemplates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.templates = action.payload.templates;
                state.total = action.payload.total;
                state.categories = action.payload.categories;
            })
            .addCase(getTemplates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getTemplateById.fulfilled, (state, action) => {
                state.currentTemplate = action.payload;
            })
            .addCase(createWorkflowFromTemplate.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createWorkflowFromTemplate.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createWorkflowFromTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentTemplate } = templateSlice.actions;
export default templateSlice.reducer;
