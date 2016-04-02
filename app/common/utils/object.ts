export class ObjectUtils {
    public static getType(value: any): string {
        if(value === null) return 'null';
        if(Array.isArray(value)) return 'array';
        if(this.isDate(value)) return 'date';
        if(this.isTimestamp(value)) return 'timestamp';
        return typeof value;
    }
    public static isDate(value: any): boolean {
        return value instanceof Date && !isNaN(value.valueOf())
    }
    public static isTimestamp(value: any): boolean {
        // if a number is > 31532400000 (timestamp for 01/01/1971), it's probably a timestamp...
        return typeof value === 'number' && value > 31532400000;
    }
}
