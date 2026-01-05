import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BASE_URL}`

export const filesService = {
  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return response.data;
  },

  async getFiles(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return response.data;
  },

  async getFileContent(fileId: string): Promise<any> {
    const response = await axios.get(`${API_URL}/files/${fileId}/content`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return response.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },
};