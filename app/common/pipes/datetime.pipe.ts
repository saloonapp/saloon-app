import {Pipe, PipeTransform} from "angular2/core";
import * as moment from "moment";

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
            let separator = ' - ', mStart = moment(start), mEnd = moment(end), prefix = '';
            if(mStart.format('YYYY') !== mEnd.format('YYYY')){
                return DateTimePipeBuilder.toDate(start, 'll') + separator + DateTimePipeBuilder.toDate(end, 'll');
            } else if(mStart.format('MM') !== mEnd.format('MM')){
                let res = DateTimePipeBuilder.toDate(end, 'll');
                let dmStart = DateTimePipeBuilder.toDate(start, 'll').replace(mStart.format('YYYY'), '').trim();
                let dmEnd = DateTimePipeBuilder.toDate(end, 'll').replace(mStart.format('YYYY'), '').trim();
                return res.replace(dmEnd, dmStart + separator + dmEnd);
            } else if(mStart.format('DD') !== mEnd.format('DD')){
                let res = DateTimePipeBuilder.toDate(end, 'll');
                return res.replace(mEnd.format('DD'), mStart.format('DD') + separator + mEnd.format('DD'));
            }
        }
        return DateTimePipeBuilder.toDate(start, 'll');
    }
}

@Pipe({name: 'timePeriod'})
export class TimePeriodPipe implements PipeTransform {
    transform(start:string, [end]: string[]): string {
        let separator = ' - ', startStr = DateTimePipeBuilder.toDate(start, 'LT'), endStr = DateTimePipeBuilder.toDate(end, 'LT');
        if(startStr === endStr){
            return endStr;
        } else {
            return startStr + separator + endStr;
        }
    }
}

class DateTimePipeBuilder {
    public static toDate(date: string, format: string): string {
        let mDate = moment(date);
        if(date && format && mDate.isValid()){
            return mDate.format(format);
        } else {
            return date;
        }
    }
    public static build(formatCfg: string|{ [key: string]: string; }): (string) => string {
        let that = this;
        return function(date: string): string {
            let format: string = typeof formatCfg === 'string' ? formatCfg : formatCfg[moment.locale()];
            return that.toDate(date, format);
        };
    }
}
