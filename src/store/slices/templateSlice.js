import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BASE_URL}/templates`;

export const getTemplates = createAsyncThunk(
    'template/getTemplates',
    async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.search) params.append('search', filters.search);

        const response = await axios.get(`${API_URL}/?${params.toString()}`);
        return response.data;
    }
);

export const getTemplateById = createAsyncThunk(
    'template/getTemplateById',
    async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    }
);

export const createWorkflowFromTemplate = createAsyncThunk(
    'template/createFromTemplate',
    async ({ templateId, customData }) => {
        const response = await axios.post(`${API_URL}/${templateId}/use`, customData);
        return response.data;
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
                state.error = action.error.message;
            })
            .addCase(getTemplateById.fulfilled, (state, action) => {
                state.currentTemplate = action.payload;
            })
            .addCase(createWorkflowFromTemplate.fulfilled, (state) => {
                state.isLoading = false;
            });
    },
});

export const { clearCurrentTemplate } = templateSlice.actions;
export default templateSlice.reducer;