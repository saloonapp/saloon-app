import {Slot} from "./Slot";
import {AttendeeItem} from "./AttendeeItem";
import {SessionItem} from "./SessionItem";

export class SessionFull implements Slot {
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
    public static toItem(session: SessionFull): SessionItem {
        return new SessionItem(
            session.uuid,
            session.name,
            session.description,
            session.descriptionHTML,
            session.landing,
            session.format,
            session.theme,
            session.place,
            session.start,
            session.end,
            session.updated);
    }
}
