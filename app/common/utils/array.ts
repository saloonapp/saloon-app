import * as _ from "lodash";
import {StringHelper} from "./string";
import {ObjectHelper} from "./object";
import {DateHelper} from "./date";

export interface ItemGroup<T> {
    key: string;
    values: T[];
}

export class ArrayHelper {
    public static groupBy<T>(items: T[], iteratee: any): ItemGroup<T>[] {
        const grouped = _.groupBy(items, iteratee);
        const ret = [];
        for(let key in grouped){
            ret.push({
                key: key,
                values: grouped[key]
            });
        }
        return ret;
    }
}

export class Sort {
    public static str(str1: string, str2: string): number {
        const s1 = StringHelper.removeDiacritics(str1 || "").toLowerCase();
        const s2 = StringHelper.removeDiacritics(str2 || "").toLowerCase();
        if(s1 > s2) return 1;
        else if(s1 < s2) return -1;
        else return 0
    }
    public static strictStr(str1: string, str2: string): number {
        if(str1 > str2) return 1;
        else if(str1 < str2) return -1;
        else return 0
    }
    public static num(n1: number, n2: number): number {
        return n1 - n2;
    }
    public static multi(...args: number[]): number {
        for(let i in args){
            if(args[i] !== 0){
                return args[i];
            }
        }
        return 0;
    }
}

export class Matcher {
    public static shallow(obj: any, query: string): boolean {
        return Matcher.custom(obj, query, {deep: 0});
    }
    public static deep(obj: any, query: string): boolean {
        return Matcher.custom(obj, query, {deep: 50});
    }
    public static custom(obj: any, query: string, options?: any): boolean {
        const deepValue = options && options.deep ? options.deep : 50;
        const opts = Object.assign({
            multi: true,
            removeDiacritics: true,
            minLength: 1,
            matchStr: this.matchStr,
            matchNum: this.matchNum,
            matchDate: this.matchDate
        }, options);
        const queries = typeof query === 'string' && opts.multi ? query.split(' ') : [query];
        return queries
            .filter(q => q && q.trim().length >= opts.minLength)
            .find(q => !this.match(obj, q, deepValue, opts)) === undefined; // no query should not match <=> all queries should match
    }

    private static match(item: any, query: string, deep: number, opts: any): boolean {
        const itemType = ObjectHelper.getType(item);
        switch (itemType) {
            case 'string':
                return opts.matchStr(item, query, opts.removeDiacritics);
            case 'number':
                return opts.matchNum(item, query);
            case 'date':
                return opts.matchDate(item, query);
            case 'timestamp':
                return opts.matchNum(item, query) || opts.matchDate(new Date(item), query);
            case 'array':
            case 'object':
                return deep > 0 ? _.find(item, e => this.match(e, query, deep - 1, opts)) !== undefined : false;
            case 'boolean':
            case 'image':
            case 'null':
            case 'undefined':
            case 'function':
            default:
                return false;
        }
    }
    private static matchStr(value: string, query: string, removeDiacritics: boolean): boolean {
        const str1 = (removeDiacritics ? StringHelper.removeDiacritics(value) : value).toLowerCase();
        const str2 = (removeDiacritics ? StringHelper.removeDiacritics(query) : query).toLowerCase();
        return str1.indexOf(str2) !== -1;
    }
    private static matchNum(value: number, query: string): boolean {
        return value.toString() === query;
    }
    private static matchDate(value: Date, query: string): boolean {
        const valueStr = ['LLLL', 'L', 'llll', 'l', 'HH[h]mm'].map(f => DateHelper.format(value, f)).join(' ');
        return this.matchStr(valueStr, query, false);
    }
}

export class Filter {
    public static shallow(items: any[], query: string): any[] {
        return this.filter(items, query, Matcher.shallow);
    }
    public static deep(items: any[], query: string): any[] {
        return this.filter(items, query, Matcher.deep);
    }
    public static custom(items: any[], query: string, options?: any): any[] {
        return this.filter(items, query, (obj: any, query: string) => Matcher.custom(obj, query, options));
    }

    private static filter(items: any[], query: string, matcher: (any, string) => boolean): any[] {
        return typeof query === 'string' && query.trim() !== '' ? items.filter(item => matcher(item, query.trim())) : items;
    }
}
