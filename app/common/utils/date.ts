import * as moment from "moment";

export class DateUtils {
    public static format(date: string|number|Date, template: string): string {
        return moment(date).format(template);
    }
    public static dayTimestamp(timestamp: number): number {
        return moment(moment(timestamp).format('L'), 'L').valueOf();
    }
}