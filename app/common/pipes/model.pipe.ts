import {Pipe, PipeTransform} from "angular2/core";
import {Address} from "../models/Address";

@Pipe({name: 'address'})
export class AddressPipe implements PipeTransform {
    transform(address: Address): string {
        if(address){
            return (address.name ? address.name+', ' : '') +
                (address.street ? address.street : '') +
                (address.zipCode ? ' '+address.zipCode : '') +
                (address.city ? ' '+address.city : '');
        }
        return address.toString();
    }
}
