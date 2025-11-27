import { ConfigInstance, ConfigTemplate, ManagerState, SupportedModel } from '../types';
export declare function loadSupportedModels(configPath?: string): Promise<SupportedModel[]>;
export declare function loadTemplates(configPath?: string): Promise<ConfigTemplate[]>;
export declare function ensureDataDirectory(): void;
export declare function loadInstances(): Promise<ConfigInstance[]>;
export declare function saveInstances(instances: ConfigInstance[]): Promise<void>;
export declare function loadState(): Promise<ManagerState>;
export declare function saveState(state: ManagerState): Promise<void>;
export declare function getDataDirectory(): string;
//# sourceMappingURL=loader.d.ts.map