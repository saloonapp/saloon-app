import {Serializable} from "../../common/models/Serializable";
import {AttendeeItem} from "./Attendee";

export class ExponentItem extends Serializable {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public logo: string,
                public landing: string,
                public website: string,
                public place: string,
                public updated: number) { super(); }
}

export class ExponentFull extends Serializable {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public logo: string,
                public landing: string,
                public website: string,
                public place: string,
                public team: AttendeeItem[],
                public updated: number) { super(); }
    toItem(): ExponentItem {
        return new ExponentItem(
            this.uuid,
            this.name,
            this.description,
            this.descriptionHTML,
            this.logo,
            this.landing,
            this.website,
            this.place,
            this.updated);
    }

    // override Serializable.fromJS to correctly parse nested class
    public static fromJS(jsonObj: any): ExponentFull {
        const instance = <ExponentFull> super.fromJS(jsonObj);
        instance.team  = <AttendeeItem[]> instance.team.map(item => AttendeeItem.fromJS(item));
        return instance;
    }
}
