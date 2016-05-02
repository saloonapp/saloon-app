import {Serializable} from "../../common/models/Serializable";
import {Slot} from "./Slot";
import {AttendeeItem} from "./Attendee";

export class SessionItem extends Serializable {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public landing: string,
                public format: string,
                public theme: string,
                public place: string,
                public start: number,
                public end: number,
                public updated: number) {}
}

export class SessionFull extends Serializable {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public landing: string,
                public format: string,
                public theme: string,
                public place: string,
                public start: number,
                public end: number,
                public speakers: AttendeeItem[],
                public updated: number) {}
    toItem(): SessionItem {
        return new SessionItem(
            this.uuid,
            this.name,
            this.description,
            this.descriptionHTML,
            this.landing,
            this.format,
            this.theme,
            this.place,
            this.start,
            this.end,
            this.updated);
    }
    toSlot(): Slot {
        return new Slot(this.uuid, this.start, this.end);
    }

    // override Serializable.fromJS to correctly parse nested class
    public static fromJS(jsonObj: any): SessionFull {
        const instance: SessionFull = super.fromJS(jsonObj);
        instance.speakers = instance.speakers.map(item => AttendeeItem.fromJS(item));
        return instance;
    }
}
