export class ObjectUtils {
    public static getType(obj: any): string {
        if(obj === null) return 'null';
        if(Array.isArray(obj)) return 'array';
        if(this.isDate(obj)) return 'date';
        if(this.isTimestamp(obj)) return 'timestamp';
        return typeof obj;
    }
    public static isDate(obj: any): boolean {
        return obj instanceof Date && !isNaN(obj.valueOf())
    }
    public static isTimestamp(obj: any): boolean {
        // if a number is > 31532400000 (timestamp for 01/01/1971), it's probably a timestamp...
        return typeof obj === 'number' && obj > 31532400000;
    }
    public static deepCopy(obj: any): any {
        return obj !== undefined ? JSON.parse(JSON.stringify(obj)) : undefined;
    }
    public static deepEquals(obj1: any, obj2: any): boolean {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
    public static deepMerge(dest: any, ...srcs: any[]): any { // TODO
        return dest;
    }
    public static getSafe(obj: any, path: string|string[], defaultValue?: any): any {
        if(obj === undefined || obj === null){
            return defaultValue;
        }
        const props: string[] = Array.isArray(path) ? path : path.split('.');
        if(props.length === 0){
            return obj;
        }
        const child = obj[props[0]];
        const remainingProps = props.slice(1);
        return this.getSafe(child, remainingProps, defaultValue);
    }
}
