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
const MODELS_FILENAME = 'models.json';
const TEMPLATES_FILENAME = 'templates.json';
const DATA_DIR = path.join(os.homedir(), '.unillm');
const INSTANCES_PATH = path.join(DATA_DIR, 'instances.json');
const STATE_PATH = path.join(DATA_DIR, 'state.json');

const DEFAULT_STATE: ManagerState = {
  currentInstanceId: null,
  currentModelId: null,
};

function resolveConfigFilePath(fileName: string, customConfigPath?: string): string {
  const candidates: string[] = [];

  const addCandidate = (candidate: string) => {
    if (!candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  };

  if (customConfigPath) {
    const resolvedCustomPath = path.resolve(customConfigPath);
    if (!fs.existsSync(resolvedCustomPath)) {
      throw new Error(`Provided configuration path does not exist: ${resolvedCustomPath}`);
    }
    const stat = fs.statSync(resolvedCustomPath);
    if (stat.isDirectory()) {
      addCandidate(path.join(resolvedCustomPath, fileName));
    } else {
      if (path.basename(resolvedCustomPath) === fileName) {
        addCandidate(resolvedCustomPath);
      }
      addCandidate(path.join(path.dirname(resolvedCustomPath), fileName));
    }
  }

  const defaultDirectories: string[] = [CONFIG_DIR];

  const parentCandidates = [
    path.resolve(CONFIG_DIR, '..'),
    path.resolve(CONFIG_DIR, '../..'),
    path.resolve(CONFIG_DIR, '../../..'),
    path.resolve(CONFIG_DIR, '../../../..'),
  ];

  for (const parent of parentCandidates) {
    defaultDirectories.push(path.join(parent, 'src', 'config'));
    defaultDirectories.push(path.join(parent, 'config'));
  }

  for (const dir of defaultDirectories) {
    addCandidate(path.join(dir, fileName));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const inspected = candidates.join(', ');
  if (customConfigPath) {
    throw new Error(
      `Config file ${fileName} not found. Checked locations derived from provided path ${customConfigPath}: ${inspected}`
    );
  }
  throw new Error(`Config file ${fileName} not found. Checked locations: ${inspected}`);
}

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

export async function loadSupportedModels(configPath?: string): Promise<SupportedModel[]> {
  const modelsPath = resolveConfigFilePath(MODELS_FILENAME, configPath);
  return readJsonFile<SupportedModel[]>(modelsPath);
}

export async function loadTemplates(configPath?: string): Promise<ConfigTemplate[]> {
  const templatesPath = resolveConfigFilePath(TEMPLATES_FILENAME, configPath);
  return readJsonFile<ConfigTemplate[]>(templatesPath);
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

async function getFileMTime(filePath: string): Promise<number | null> {
  try {
    const stats = await fsp.stat(filePath);
    return stats.mtimeMs;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function getInstancesFileMTime(): Promise<number | null> {
  ensureDataDirectory();
  return getFileMTime(INSTANCES_PATH);
}

export async function getStateFileMTime(): Promise<number | null> {
  ensureDataDirectory();
  return getFileMTime(STATE_PATH);
}

export function getDataDirectory(): string {
  ensureDataDirectory();
  return DATA_DIR;
}
