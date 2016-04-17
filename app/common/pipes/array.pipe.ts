import {Pipe, PipeTransform} from "angular2/core";
import * as _ from "lodash";
import {ObjectHelper} from "../utils/object";
import {ItemGroup, Filter} from "../utils/array";

@Pipe({name: 'search'})
export class SearchPipe implements PipeTransform {
    transform<T>(items: T[], [query]: string[]): T[] {
        return Filter.deep(items, query);
    }
}

@Pipe({name: 'filter'})
export class FilterPipe implements PipeTransform {
    transform<T>(items: T[], [predicate]: any[]): T[] {
        return _.filter(items, predicate);
    }
}

@Pipe({name: 'sortBy'})
export class SortByPipe implements PipeTransform {
    transform<T>(items: T[], [comparator]: any[]): T[] {
        return _.sortBy(items, comparator);
    }
}

@Pipe({name: 'map'})
export class MapPipe implements PipeTransform {
    transform<T>(items: T[], [iteratee]: any[]): any[] {
        return _.map(items, iteratee);
    }
}

@Pipe({name: 'groupBy'})
export class GroupByPipe implements PipeTransform {
    transform<T>(items: T[], [iteratee]: any[]): ItemGroup<T>[] {
        return _.map(_.groupBy(items, iteratee), (values, key) =>  {
            return {key: key, values: values};
        });
    }
}

@Pipe({name: 'notEmpty'})
export class NotEmptyPipe implements PipeTransform {
    transform<T>(items: T[]): T[] {
        if(Array.isArray(items) && items.length > 0){
            const type = ObjectHelper.getType(items[0]);
            switch (type) {
                case 'string':
                    return items.filter(e => e && e.length > 0);
                case 'array':
                    return items.filter(e => e && e.length > 0);
                case 'object':
                    return items.filter(e => e && Object.keys(e).length > 0);
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
        return items;
    }
}

@Pipe({name: 'join'})
export class JoinPipe implements PipeTransform {
    transform(items: string[], [separator]: string[]): string {
        return items ? items.join(separator) : '';
    }
}
