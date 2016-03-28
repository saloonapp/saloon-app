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

class DateTimePipeBuilder {
    public static build(formatCfg: string|{ [key: string]: string; }): (string) => string {
        return function(date: string): string {
            let mDate = moment(date);
            let format: string = typeof formatCfg === 'string' ? formatCfg : formatCfg[moment.locale()];
            if(date && format && mDate.isValid()){
                return mDate.format(format);
            } else {
                return date;
            }
        };
    }
}
