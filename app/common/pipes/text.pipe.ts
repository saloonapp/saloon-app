import {Pipe, PipeTransform} from "angular2/core";

@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform {
    transform(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
