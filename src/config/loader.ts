// src/config/loader.ts
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ConfigInstance,
  ConfigTemplate,
  ManagerState,
  SupportedModel,
} from '../types';

const CONFIG_DIR = __dirname;
const MODELS_PATH = path.join(CONFIG_DIR, 'models.json');
const TEMPLATES_PATH = path.join(CONFIG_DIR, 'templates.json');
const DATA_DIR = path.join(os.homedir(), '.unillm');
const INSTANCES_PATH = path.join(DATA_DIR, 'instances.json');
const STATE_PATH = path.join(DATA_DIR, 'state.json');

const DEFAULT_STATE: ManagerState = {
  currentInstanceId: null,
  currentModelId: null,
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const content = await fsp.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to read JSON file ${filePath}: ${(error as Error).message}`);
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(data, null, 2);
  await fsp.writeFile(filePath, `${json}\n`, 'utf-8');
}

export async function loadSupportedModels(): Promise<SupportedModel[]> {
  if (!fs.existsSync(MODELS_PATH)) {
    throw new Error(`Supported models definition not found at ${MODELS_PATH}`);
  }
  return readJsonFile<SupportedModel[]>(MODELS_PATH);
}

export async function loadTemplates(): Promise<ConfigTemplate[]> {
  if (!fs.existsSync(TEMPLATES_PATH)) {
    throw new Error(`Config templates definition not found at ${TEMPLATES_PATH}`);
  }
  return readJsonFile<ConfigTemplate[]>(TEMPLATES_PATH);
}

export function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function loadInstances(): Promise<ConfigInstance[]> {
  ensureDataDirectory();
  if (!fs.existsSync(INSTANCES_PATH)) {
    return [];
  }

  return readJsonFile<ConfigInstance[]>(INSTANCES_PATH);
}

export async function saveInstances(instances: ConfigInstance[]): Promise<void> {
  ensureDataDirectory();
  await writeJsonFile(INSTANCES_PATH, instances);
}

export async function loadState(): Promise<ManagerState> {
  ensureDataDirectory();
  if (!fs.existsSync(STATE_PATH)) {
    return { ...DEFAULT_STATE };
  }

  try {
    const state = await readJsonFile<ManagerState>(STATE_PATH);
    return {
      currentInstanceId: state.currentInstanceId ?? null,
      currentModelId: state.currentModelId ?? null,
    };
  } catch (error) {
    throw new Error(`Unable to load manager state: ${(error as Error).message}`);
  }
}

export async function saveState(state: ManagerState): Promise<void> {
  ensureDataDirectory();
  await writeJsonFile(STATE_PATH, state);
}

export function getDataDirectory(): string {
  ensureDataDirectory();
  return DATA_DIR;
}
