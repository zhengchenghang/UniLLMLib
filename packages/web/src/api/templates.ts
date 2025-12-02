import client from './client';
import { ConfigTemplate } from '../types';

export const templatesApi = {
  list: async (): Promise<ConfigTemplate[]> => {
    const { data } = await client.get('/templates');
    return data.data.templates;
  },

  get: async (templateId: string): Promise<ConfigTemplate> => {
    const { data } = await client.get(`/templates/${templateId}`);
    return data.data;
  },
};
