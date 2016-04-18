import {AttendeeItem} from "./AttendeeItem";
import {ExponentItem} from "./ExponentItem";

export class ExponentFull {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public logo: string,
                public landing: string,
                public website: string,
                public place: string,
                public team: AttendeeItem[],
                public updated: number) {}
    public static toItem(exponent: ExponentFull): ExponentItem {
        return new ExponentItem(
            exponent.uuid,
            exponent.name,
            exponent.description,
            exponent.descriptionHTML,
            exponent.logo,
            exponent.landing,
            exponent.website,
            exponent.place,
            exponent.updated);
    }
}
