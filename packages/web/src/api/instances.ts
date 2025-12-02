import client from './client';
import { ConfigInstance } from '../types';

export interface InstanceCreatePayload {
  templateId: string;
  name?: string;
  config?: Record<string, any>;
  secrets?: Record<string, string>;
  selectedModelId?: string;
}

export interface InstanceUpdatePayload {
  name?: string;
  config?: Record<string, any>;
  secrets?: Record<string, string>;
  selectedModelId?: string;
}

export const instancesApi = {
  list: async (): Promise<ConfigInstance[]> => {
    const { data } = await client.get('/instances');
    return data.data.instances;
  },

  getCurrent: async (): Promise<ConfigInstance | null> => {
    try {
      const { data } = await client.get('/instances/current');
      return data.data;
    } catch (error) {
      return null;
    }
  },

  get: async (instanceId: string): Promise<ConfigInstance> => {
    const { data } = await client.get(`/instances/${instanceId}`);
    return data.data;
  },

  create: async (payload: InstanceCreatePayload): Promise<ConfigInstance> => {
    const { data } = await client.post('/instances', payload);
    return data.data;
  },

  update: async (instanceId: string, payload: InstanceUpdatePayload): Promise<ConfigInstance> => {
    const { data } = await client.put(`/instances/${instanceId}`, payload);
    return data.data;
  },

  delete: async (instanceId: string): Promise<void> => {
    await client.delete(`/instances/${instanceId}`);
  },

  select: async (instanceId: string): Promise<ConfigInstance> => {
    const { data } = await client.put(`/instances/${instanceId}/select`);
    return data.data;
  },
};
