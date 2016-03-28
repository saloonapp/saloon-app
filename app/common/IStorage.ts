export interface IStorage{
    getItem(key: string): Promise<any>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
}
