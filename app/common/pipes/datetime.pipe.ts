import {Pipe, PipeTransform} from "angular2/core";
import * as moment from "moment";
import {ObjectUtils} from "../utils/object";

@Pipe({name: 'date'})
export class DatePipe implements PipeTransform {
    transform = DateTimePipeBuilder.build('ll');
}

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
    transform = DateTimePipeBuilder.build('LT');
}

@Pipe({name: 'datetime'})
export class DateTimePipe implements PipeTransform {
    transform = DateTimePipeBuilder.build('lll');
}

@Pipe({name: 'weekDay'})
export class WeekDayPipe implements PipeTransform {
    transform = DateTimePipeBuilder.build('dddd');
}

@Pipe({name: 'datePeriod'})
export class DatePeriodPipe implements PipeTransform {
    transform(start: string, [end]: string[]): string {
        if(end){
            const separator = ' - ', mStart = moment(start), mEnd = moment(end);
            if(mStart.format('YYYY') !== mEnd.format('YYYY')){
                return DateTimePipeBuilder.toDate(start, 'll') + separator + DateTimePipeBuilder.toDate(end, 'll');
            } else if(mStart.format('MM') !== mEnd.format('MM')){
                const res = DateTimePipeBuilder.toDate(end, 'll');
                const dmStart = DateTimePipeBuilder.toDate(start, 'll').replace(mStart.format('YYYY'), '').trim();
                const dmEnd = DateTimePipeBuilder.toDate(end, 'll').replace(mStart.format('YYYY'), '').trim();
                return res.replace(dmEnd, dmStart + separator + dmEnd);
            } else if(mStart.format('DD') !== mEnd.format('DD')){
                const res = DateTimePipeBuilder.toDate(end, 'll');
                return res.replace(mEnd.format('DD'), mStart.format('DD') + separator + mEnd.format('DD'));
            }
        }
        return DateTimePipeBuilder.toDate(start, 'll');
    }
}

@Pipe({name: 'timePeriod'})
export class TimePeriodPipe implements PipeTransform {
    transform(start:string, [end]: string[]): string {
        const separator = ' - ', startStr = DateTimePipeBuilder.toDate(start, 'LT'), endStr = DateTimePipeBuilder.toDate(end, 'LT');
        if(startStr === endStr){
            return endStr;
        } else {
            return startStr + separator + endStr;
        }
    }
}

@Pipe({name: 'timeDuration'}) // TODO : need some additionnal work...
export class TimeDurationPipe implements PipeTransform {
    // use https://github.com/jsmreese/moment-duration-format ?
    private milliDiff = 0;
    private secDiff = 1000;
    private minDiff = 60*this.secDiff;
    private hourDiff = 60*this.minDiff;
    private dayDiff = 24*this.hourDiff;
    transform(start:string, [end]: string[]): string {
        const diff = moment(end).diff(moment(start));
        return this.display(diff);
    }

    private display(diff: number, levels?: number): string {
        const lvl = levels ? levels : 2;
        if(diff > this.dayDiff){
            const q = Math.floor(diff / this.dayDiff);
            const r = diff - q*this.dayDiff;
            return q+' days' + (r > 0 && lvl > 0 ? ' '+this.display(r, lvl-1) : '');
        } else if(diff > this.hourDiff){
            const q = Math.floor(diff / this.hourDiff);
            const r = diff - q*this.hourDiff;
            return q+' hours' + (r > 0 && lvl > 0 ? ' '+this.display(r, lvl-1) : '');
        } else if(diff > this.minDiff){
            const q = Math.floor(diff / this.minDiff);
            const r = diff - q*this.minDiff;
            return q+' minutes' + (r > 0 && lvl > 0 ? ' '+this.display(r, lvl-1) : '');
        } else if(diff > this.secDiff){
            const q = Math.floor(diff / this.secDiff);
            const r = diff - q*this.secDiff;
            return q+' seconds' + (r > 0 && lvl > 0 ? ' '+this.display(r, lvl-1) : '');
        } else if(diff > this.milliDiff){
            const q = Math.floor(diff / this.milliDiff);
            const r = diff - q*this.milliDiff;
            return q+' millis' + (r > 0 && lvl > 0 ? ' '+this.display(r, lvl-1) : '');
        } else {
            return '';
        }
    }
}

class DateTimePipeBuilder {
    public static toDate(date: string, format: string): string {
        const mDate = ObjectUtils.isTimestamp(date) ? moment(parseInt(date)) : moment(date);
        if(date && format && mDate.isValid()){
            return mDate.format(format);
        } else {
            return date;
        }
    }
    public static build(formatCfg: string|{ [key: string]: string; }): (string) => string {
        const that = this;
        return function(date: string): string {
            const format: string = typeof formatCfg === 'string' ? formatCfg : formatCfg[moment.locale()];
            return that.toDate(date, format);
        };
    }
}
