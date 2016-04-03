import {Injectable} from "angular2/core";
import {SQLitePlugin} from "../plugins/sqlite.plugin";
import {ObjectUtils} from "../utils/object";
import {IStorage} from "./IStorage";
import {SQLiteStorage} from "./storage-sqlite.service";

@Injectable()
export class StorageUtils {
    private useStorage = true; // if false, only the cache will be used, data won't be persistent
    private storagePrefix: string = '';
    private storageCache = {};
    private promiseStorageCache = {};
    private storage: IStorage = null;
    constructor(private _SQLiteStorage: SQLiteStorage) {
        this.storage = <IStorage> _SQLiteStorage;
    }

    get(key: string, defaultValue?: any): any {
        if(this.storageCache[key]){
            return Promise.resolve(ObjectUtils.deepCopy(this.storageCache[key]));
        } else if(this.promiseStorageCache[key]){
            return this.promiseStorageCache[key];
        } else {
            if(this.useStorage){
                this.promiseStorageCache[key] = this.storage.getItem(this.storagePrefix+key).then(value => {
                    try {
                        this.storageCache[key] = JSON.parse(value) || ObjectUtils.deepCopy(defaultValue);
                    } catch(e) {
                        this.storageCache[key] = ObjectUtils.deepCopy(defaultValue);
                    }
                    delete this.promiseStorageCache[key];
                    return ObjectUtils.deepCopy(this.storageCache[key]);
                }, error => {
                    console.error('error in StorageUtils.get('+key+')', error);
                    delete this.promiseStorageCache[key];
                });
                return this.promiseStorageCache[key];
            } else {
                this.storageCache[key] = ObjectUtils.deepCopy(defaultValue);
                return Promise.resolve(ObjectUtils.deepCopy(this.storageCache[key]));
            }
        }
    }

    set(key: string, value: any): Promise<void> {
        if(!ObjectUtils.deepEquals(this.storageCache[key], value)){
            this.storageCache[key] = ObjectUtils.deepCopy(value);
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
