import {AttendeeItem} from "./AttendeeItem";
import {SessionItem} from "./SessionItem";

export class SessionFull {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public landing: string,
                public format: string,
                public theme: string,
                public place: string,
                public start: string,
                public end: string,
                public speakers: AttendeeItem[]) {}
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
            session.end)
    }
}
