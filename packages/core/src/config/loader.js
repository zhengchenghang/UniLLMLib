"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSupportedModels = loadSupportedModels;
exports.loadTemplates = loadTemplates;
exports.ensureDataDirectory = ensureDataDirectory;
exports.loadInstances = loadInstances;
exports.saveInstances = saveInstances;
exports.loadState = loadState;
exports.saveState = saveState;
exports.getDataDirectory = getDataDirectory;
// src/config/loader.ts
const fs = __importStar(require("fs"));
const fs_1 = require("fs");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const CONFIG_DIR = __dirname;
const MODELS_FILENAME = 'models.json';
const TEMPLATES_FILENAME = 'templates.json';
const DATA_DIR = path.join(os.homedir(), '.unillm');
const INSTANCES_PATH = path.join(DATA_DIR, 'instances.json');
const STATE_PATH = path.join(DATA_DIR, 'state.json');
const DEFAULT_STATE = {
    currentInstanceId: null,
    currentModelId: null,
};
function resolveConfigFilePath(fileName, customConfigPath) {
    const candidates = [];
    const addCandidate = (candidate) => {
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
        }
        else {
            if (path.basename(resolvedCustomPath) === fileName) {
                addCandidate(resolvedCustomPath);
            }
            addCandidate(path.join(path.dirname(resolvedCustomPath), fileName));
        }
    }
    const defaultDirectories = [CONFIG_DIR];
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
        throw new Error(`Config file ${fileName} not found. Checked locations derived from provided path ${customConfigPath}: ${inspected}`);
    }
    throw new Error(`Config file ${fileName} not found. Checked locations: ${inspected}`);
}
async function readJsonFile(filePath) {
    try {
        const content = await fs_1.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
    }
}
async function writeJsonFile(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const json = JSON.stringify(data, null, 2);
    await fs_1.promises.writeFile(filePath, `${json}\n`, 'utf-8');
}
async function loadSupportedModels(configPath) {
    const modelsPath = resolveConfigFilePath(MODELS_FILENAME, configPath);
    return readJsonFile(modelsPath);
}
async function loadTemplates(configPath) {
    const templatesPath = resolveConfigFilePath(TEMPLATES_FILENAME, configPath);
    return readJsonFile(templatesPath);
}
function ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}
async function loadInstances() {
    ensureDataDirectory();
    if (!fs.existsSync(INSTANCES_PATH)) {
        return [];
    }
    return readJsonFile(INSTANCES_PATH);
}
async function saveInstances(instances) {
    ensureDataDirectory();
    await writeJsonFile(INSTANCES_PATH, instances);
}
async function loadState() {
    ensureDataDirectory();
    if (!fs.existsSync(STATE_PATH)) {
        return { ...DEFAULT_STATE };
    }
    try {
        const state = await readJsonFile(STATE_PATH);
        return {
            currentInstanceId: state.currentInstanceId ?? null,
            currentModelId: state.currentModelId ?? null,
        };
    }
    catch (error) {
        throw new Error(`Unable to load manager state: ${error.message}`);
    }
}
async function saveState(state) {
    ensureDataDirectory();
    await writeJsonFile(STATE_PATH, state);
}
function getDataDirectory() {
    ensureDataDirectory();
    return DATA_DIR;
}
//# sourceMappingURL=loader.js.map