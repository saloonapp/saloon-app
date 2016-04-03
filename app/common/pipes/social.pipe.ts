import {Pipe, PipeTransform} from "angular2/core";

@Pipe({name: 'twitterName'})
export class TwitterNamePipe implements PipeTransform {
    transform(value: string): string {
        return value.replace('https://twitter.com/', '').replace('@', '');
    }
}

@Pipe({name: 'twitterHandle'})
export class TwitterHandlePipe implements PipeTransform {
    transform(value: string): string {
        return '@'+value.replace('https://twitter.com/', '').replace('@', '');
    }
}

@Pipe({name: 'twitterUrl'})
export class TwitterUrlPipe implements PipeTransform {
    transform(value: string): string {
        return 'https://twitter.com/'+value.replace('https://twitter.com/', '').replace('@', '');
    }
}
