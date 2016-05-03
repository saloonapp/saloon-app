import * as moment from "moment";
import {ObjectHelper} from "./object";

export class DateHelper {
    public static milli: number = 1;
    public static sec: number = DateHelper.milli*1000;
    public static min: number = DateHelper.sec*60;
    public static hour: number = DateHelper.min*60;
    public static day: number = DateHelper.hour*24;

    public static now(): number {
        //return new Date("Wed Apr 20 2016 10:00:39 GMT+0200 (CEST)").getTime();
        return Date.now();
    }
    public static format(date: string|number|Date, format: string): string {
        const mDate = ObjectHelper.isTimestamp(date) ? moment(parseInt(date.toString())) : moment(date);
        if(date && format && mDate.isValid()){
            return mDate.format(format);
        } else {
            return <string> date;
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
