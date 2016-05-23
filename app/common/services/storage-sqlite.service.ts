import {Injectable} from "@angular/core";
import {SQLitePlugin} from "../plugins/sqlite.plugin";
import {IStorage} from "./IStorage";

@Injectable()
export class SQLiteStorage implements IStorage {
    private tableName: string = 'KeyValue';
    private initialized: Promise<any> = this.init();
    constructor(private _SQLitePlugin: SQLitePlugin) {}

    getItem(key: string): Promise<string> {
        return this.query('SELECT value FROM '+this.tableName+' WHERE key = ? LIMIT 1', [key]).then(data => {
            if(data.length > 0){
                return data[0].value;
            }
        });
    }

    setItem(key: string, value: string): Promise<void> {
        return this.query('INSERT OR REPLACE INTO '+this.tableName+'(key, value) VALUES (?, ?)', [key, value]).then(data => {});
    }

    removeItem(key: string): Promise<void> {
        return this.query('DELETE FROM '+this.tableName+' WHERE key = ?', [key]).then(data => {});
    }

    keys(): Promise<string[]> {
        return this.query('SELECT key FROM '+this.tableName).then(data => {
            return data.map(e => e.key);
        });
    }

    clear(): Promise<void> {
        return this.query('DELETE FROM '+this.tableName).then(data => {});
    }

    private query(query: string, args?: string[]): Promise<any[]> {
        return this.initialized.then(db => {
            return this._SQLitePlugin.query(db, query, args);
        });
    }

    private init(): Promise<any> {
        return this._SQLitePlugin.open().then(db => {
            return this._SQLitePlugin.query(db, 'CREATE TABLE IF NOT EXISTS '+this.tableName+' (key text primary key, value text)').then(() => {
                return db;
            });
        });
    }
}
