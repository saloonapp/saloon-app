import * as moment from "moment";
import {StringUtils} from "./string";
import {ObjectUtils} from "./object";

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
        return this.custom(obj, query, 0, {multi: true, removeDiacritics: true});
    }
    public static deep(obj: any, query: string, deep?: number): boolean {
        return this.custom(obj, query, deep ? deep : 50, {multi: true, removeDiacritics: true});
    }
    public static custom(obj: any, query: string, deep?: number, options?: any): boolean {
        let deepValue = deep ? deep : 0;
        let opts = Object.assign({
            multi: false,
            removeDiacritics: false,
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
            let value = obj[key];
            let type = ObjectUtils.getType(value);
            switch (type) {
                case 'string':
                    hasMatch = hasMatch || opts.matchStr(value, query, opts.removeDiacritics);
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
            if(hasMatch){ return hasMatch; } // early exit
        }
        return hasMatch;
    }
    private static matchStr(value: string, query: string, removeDiacritics: boolean): boolean {
        let str1 = (removeDiacritics ? StringUtils.removeDiacritics(value) : value).toLowerCase();
        let str2 = (removeDiacritics ? StringUtils.removeDiacritics(query) : query).toLowerCase();
        return str1.indexOf(str2) !== -1;
    }
    private static matchDate(value: any, query: string): boolean {
        let mDate = moment(value);
        let valueStr = ['LLLL', 'L', 'llll', 'l'].map(f => mDate.format(f)).join(' ');
        return this.matchStr(valueStr, query, false);
    }
}
