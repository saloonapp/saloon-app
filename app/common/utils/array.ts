import * as moment from "moment";
import {StringUtils} from "./string";

export class Sort {
    public static str(str1: string, str2: string): number {
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

export class Filter {
    public static shallow(obj: any, query: string): boolean {
        return this.custom(obj, query, 0, {multi: true, removeDiatrics: true});
    }
    public static deep(obj: any, query: string, deep?: number): boolean {
        return this.custom(obj, query, deep ? deep : 50, {multi: true, removeDiatrics: true});
    }
    public static custom(obj: any, query: string, deep?: number, options?: any): boolean {
        let deepValue = deep ? deep : 0;
        let opts = Object.assign({
            multi: false,
            removeDiatrics: false,
            matchStr: this.matchStr,
            matchDate: this.matchDate
        }, options);
        let queries = opts.multi ? query.split(' ') : [query];
        return queries
            .map(q => this.matchObj(obj, q, deepValue, opts))
            .reduce((total, elt) => total && elt, true);
    }

    private static matchObj(obj: any, query: string, deep: number, opts: any): boolean {
        let hasMatch = false;
        for(let key in obj){
            if(hasMatch){ return hasMatch; } // exit early
            let value = obj[key];
            let type = this.getType(value);
            switch (type) {
                case 'string':
                    hasMatch = hasMatch || opts.matchStr(value, query, opts.removeDiatrics);
                    break;
                case 'number':
                    hasMatch = hasMatch || opts.matchStr(value.toString(), query, false);
                    break;
                case 'date':
                    hasMatch = hasMatch || opts.matchDate(value, query);
                    break;
                case 'timestamp':
                    hasMatch = hasMatch || opts.matchStr(value.toString(), query, false) || opts.matchDate(new Date(value), query);
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
        }
        return hasMatch;
    }
    private static matchStr(value: string, query: string, removeDiatrics: boolean): boolean {
        let str1 = (removeDiatrics ? StringUtils.removeDiacritics(value) : value).toLowerCase();
        let str2 = (removeDiatrics ? StringUtils.removeDiacritics(query) : query).toLowerCase();
        return str1.indexOf(str2) !== -1;
    }
    private static matchDate(value: any, query: string): boolean {
        let mDate = moment(value);
        let valueStr = ['LLLL', 'L', 'llll', 'l'].map(f => mDate.format(f)).join(' ');
        return this.matchStr(valueStr, query, false);
    }
    private static getType(value: any): string {
        if(value === null) return 'null';
        if(Array.isArray(value)) return 'array';
        if(this.isDate(value)) return 'date';
        if(this.isTimestamp(value)) return 'timestamp';
        return typeof value;
    }
    private static isDate(value: any): boolean {
        return value instanceof Date && !isNaN(value.valueOf())
    }
    private static isTimestamp(value: any): boolean {
        // if a number is > 31532400000 (timestamp for 01/01/1971), it's probably a timestamp...
        return typeof value === 'number' && value > 31532400000;
    }
}
