import {Injectable} from "angular2/core";
import {SQLitePlugin} from "./plugins/sqlite.plugin";
import {SQLiteStorage} from "./storage-sqlite.service";
import {IStorage} from "./IStorage";

@Injectable()
export class StorageUtils {
    private useStorage = true; // if false, only the cache will be used, data won't be persistent
    private storagePrefix: string = '';
    private storageCache = {};
    private promiseStorageCache = {};
    private storage: IStorage = null;
    private deepCopy(obj: any): any {
        return obj !== undefined ? JSON.parse(JSON.stringify(obj)) : undefined;
    }
    private deepEquals(obj1: any, obj2: any): boolean {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
    constructor(private _SQLiteStorage: SQLiteStorage) {
        this.storage = <IStorage> _SQLiteStorage;
    }

    get(key: string, defaultValue?: any): any {
        if(this.storageCache[key]){
            return Promise.resolve(this.deepCopy(this.storageCache[key]));
        } else if(this.promiseStorageCache[key]){
            return this.promiseStorageCache[key];
        } else {
            if(this.useStorage){
                this.promiseStorageCache[key] = this.storage.getItem(this.storagePrefix+key).then(value => {
                    try {
                        this.storageCache[key] = JSON.parse(value) || this.deepCopy(defaultValue);
                    } catch(e) {
                        this.storageCache[key] = this.deepCopy(defaultValue);
                    }
                    delete this.promiseStorageCache[key];
                    return this.deepCopy(this.storageCache[key]);
                }, error => {
                    console.error('Unable to StorageUtils.get('+key+') !!!', error);
                    delete this.promiseStorageCache[key];
                });
                return this.promiseStorageCache[key];
            } else {
                this.storageCache[key] = this.deepCopy(defaultValue);
                return Promise.resolve(this.deepCopy(this.storageCache[key]));
            }
        }
    }

    set(key: string, value: any): Promise<void> {
        if(!this.deepEquals(this.storageCache[key], value)){
            this.storageCache[key] = this.deepCopy(value);
            if(this.useStorage){
                return this.storage.setItem(this.storagePrefix+key, JSON.stringify(this.storageCache[key])).then(
                    value => {},
                    error => { console.error('error in StorageUtils.set('+key+')', error); }
                );
            } else {
                return Promise.resolve();
            }
        } else {
            //console.debug('Don\'t save <'+key+'> because values are equals !', value);
            return Promise.resolve();
        }
    }

    remove(key: string): Promise<void> {
        delete this.storageCache[key];
        if(this.useStorage){
            return this.storage.removeItem(this.storagePrefix+key);
        } else {
            return Promise.resolve();
        }
    }

    clear(): Promise<void> {
        this.storageCache = {};
        if(this.useStorage){
            return this.storage.clear();
        } else {
            return Promise.resolve();
        }
    }
}
