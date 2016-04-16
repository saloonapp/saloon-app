import * as moment from "moment";
import {StringUtils} from "./string";
import {ObjectUtils} from "./object";

export class Sort {
    public static str(str1: string, str2: string): number {
        const s1 = StringUtils.removeDiacritics(str1 || "").toLowerCase();
        const s2 = StringUtils.removeDiacritics(str2 || "").toLowerCase();
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
            .map(q => this.matchObj(obj, q, deepValue, opts))
            .reduce((total, elt) => total && elt, true);
    }

    private static matchObj(obj: any, query: string, deep: number, opts: any): boolean {
        let hasMatch = false;
        for(let key in obj){
            const value = obj[key];
            const type = ObjectUtils.getType(value);
            switch (type) {
                case 'string':
                    hasMatch = hasMatch || opts.matchStr(value, query, opts.removeDiacritics);
                    break;
                case 'number':
                    hasMatch = hasMatch || opts.matchNum(value, query);
                    break;
                case 'date':
                    hasMatch = hasMatch || opts.matchDate(value, query);
                    break;
                case 'timestamp':
                    hasMatch = hasMatch || opts.matchNum(value, query) || opts.matchDate(new Date(value), query);
                    break;
                case 'object':
                case 'array':
                    hasMatch = hasMatch || (deep > 0 ? this.matchObj(value, query, deep-1, opts) : false);
                    break;
                case 'boolean':
                case 'null':
                case 'undefined':
                case 'function':
                default:
                    break;
            }
            if(hasMatch){ return hasMatch; } // early exit
        }
        return hasMatch;
    }
    private static matchStr(value: string, query: string, removeDiacritics: boolean): boolean {
        const str1 = (removeDiacritics ? StringUtils.removeDiacritics(value) : value).toLowerCase();
        const str2 = (removeDiacritics ? StringUtils.removeDiacritics(query) : query).toLowerCase();
        return str1.indexOf(str2) !== -1;
    }
    private static matchNum(value: number, query: string): boolean {
        return value.toString() === query;
    }
    private static matchDate(value: Date, query: string): boolean {
        const mDate = moment(value);
        const valueStr = ['LLLL', 'L', 'llll', 'l', 'HH[h]mm'].map(f => mDate.format(f)).join(' ');
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
