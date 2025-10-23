// src/config/loader.ts
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { LLMConfig } from '../types';

const DEFAULT_CONFIG_PATH = path.join(__dirname, 'llm_config.yaml');

export async function loadConfig(configPath?: string): Promise<LLMConfig> {
  const finalPath = configPath || DEFAULT_CONFIG_PATH;
  
  if (!fs.existsSync(finalPath)) {
    throw new Error(`Config file not found: ${finalPath}`);
  }

  const content = fs.readFileSync(finalPath, 'utf-8');
  const config = yaml.load(content) as LLMConfig;

  // 验证配置
  if (!config.models || Object.keys(config.models).length === 0) {
    throw new Error('No models configured in config file');
  }

  return config;
}

