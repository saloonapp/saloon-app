import * as moment from "moment";
import {ObjectHelper} from "./object";

export class DateHelper {
    public static format(date: string|number|Date, format: string): string {
        const mDate = ObjectHelper.isTimestamp(date) ? moment(parseInt(date.toString())) : moment(date);
        if(date && format && mDate.isValid()){
            return mDate.format(format);
        } else {
            return date.toString();
        }
    }
    public static dayTimestamp(timestamp: number): number {
        return moment(moment(timestamp).format('L'), 'L').valueOf();
    }
    public static createPipe(formatCfg: string|{ [key: string]: string; }): (string) => string {
        const that = this;
        return function(date: string): string {
            const format: string = typeof formatCfg === 'string' ? formatCfg : formatCfg[moment.locale()];
            return that.format(date, format);
        };
    }
}
