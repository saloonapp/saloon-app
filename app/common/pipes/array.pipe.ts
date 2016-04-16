import {Pipe, PipeTransform} from "angular2/core";
import * as _ from "lodash";
import {ObjectUtils} from "../utils/object";
import {Filter} from "../utils/array";

@Pipe({name: 'map'})
export class MapPipe implements PipeTransform {
    transform(array: any[], [iteratee]: any[]): any[] {
        return _.map(array, iteratee);
    }
}

@Pipe({name: 'notEmpty'})
export class NotEmptyPipe implements PipeTransform {
    transform(array: any[]): any[] {
        if(Array.isArray(array) && array.length > 0){
            const type = ObjectUtils.getType(array[0]);
            switch (type) {
                case 'string':
                    return array.filter(e => e && e.length > 0);
                case 'array':
                    return array.filter(e => e && e.length > 0);
                case 'object':
                    return array.filter(e => e && Object.keys(e).length > 0);
                case 'number':
                case 'date':
                case 'timestamp':
                case 'boolean':
                case 'null':
                case 'undefined':
                case 'function':
                default:
                    break;
            }
        }
        return array;
    }
}

@Pipe({name: 'join'})
export class JoinPipe implements PipeTransform {
    transform(array: any[], [separator]: string[]): string {
        return array ? array.join(separator) : '';
    }
}

@Pipe({name: 'search'})
export class SearchPipe implements PipeTransform {
    transform(items: any[], [query]: string[]): any[] {
        return Filter.deep(items, query);
    }
}

@Pipe({name: 'filter'})
export class FilterPipe implements PipeTransform {
    transform(items: any[], [predicate]: any[]): any[] {
        return _.filter(items, predicate);
    }
}
