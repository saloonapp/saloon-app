import {Pipe, PipeTransform} from "@angular/core";
import * as moment from "moment";
import {ObjectHelper} from "../utils/object";
import {DateHelper} from "../utils/date";

@Pipe({name: 'date'})
export class DatePipe implements PipeTransform {
    transform = DateHelper.createPipe('ll');
}

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
    transform = DateHelper.createPipe('LT');
}

@Pipe({name: 'datetime'})
export class DateTimePipe implements PipeTransform {
    transform = DateHelper.createPipe('lll');
}

@Pipe({name: 'weekDay'})
export class WeekDayPipe implements PipeTransform {
    transform = DateHelper.createPipe('dddd');
}

@Pipe({name: 'datePeriod'})
export class DatePeriodPipe implements PipeTransform {
    transform(start: string, end: string): string {
        if(end){
            const separator = ' - ', mStart = moment(start), mEnd = moment(end);
            if(mStart.format('YYYY') !== mEnd.format('YYYY')){
                return DateHelper.format(start, 'll') + separator + DateHelper.format(end, 'll');
            } else if(mStart.format('MM') !== mEnd.format('MM')){
                const res = DateHelper.format(end, 'll');
                const dmStart = DateHelper.format(start, 'll').replace(mStart.format('YYYY'), '').trim();
                const dmEnd = DateHelper.format(end, 'll').replace(mStart.format('YYYY'), '').trim();
                return res.replace(dmEnd, dmStart + separator + dmEnd);
            } else if(mStart.format('DD') !== mEnd.format('DD')){
                const res = DateHelper.format(end, 'll');
                return res.replace(mEnd.format('DD'), mStart.format('DD') + separator + mEnd.format('DD'));
            }
        }
        return DateHelper.format(start, 'll');
    }
}

@Pipe({name: 'timePeriod'})
export class TimePeriodPipe implements PipeTransform {
    transform(start: string, end: string): string {
        const separator = ' - ', startStr = DateHelper.format(start, 'LT'), endStr = DateHelper.format(end, 'LT');
        if(startStr === endStr) {
            return endStr;
        } else if(endStr) {
            return startStr + separator + endStr;
        } else {
            return startStr;
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
