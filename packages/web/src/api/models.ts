import client from './client';
import { ModelInfo } from '../types';

export const modelsApi = {
  list: async (): Promise<ModelInfo[]> => {
    const { data } = await client.get('/models');
    return data.data.models;
  },
};
