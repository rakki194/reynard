import { ConnectionConfig } from "./types";
export declare class ConnectionConfigManager {
    private configs;
    private defaultConfig;
    constructor();
    private createDefault;
    private loadFromEnv;
    private createFromEnv;
    get(name: string): ConnectionConfig;
    set(name: string, config: ConnectionConfig): void;
    listNames(): string[];
}
