import {Address} from "../../common/models/Address";
import {SessionItem} from "./SessionItem";
import {ExponentItem} from "./ExponentItem";
import {AttendeeItem} from "./AttendeeItem";

export class AttendeeFull {
    constructor(public uuid: string,
                public role: string,
                public name: string,
                public firstName: string,
                public lastName: string,
                public description: string,
                public descriptionHTML: string,
                public avatar: string,
                public email: string,
                public phone: string,
                public address: Address,
                public job: string,
                public company: string,
                public website: string,
                public twitterUrl: string,
                public sessions: SessionItem[],
                public exponents: ExponentItem[],
                public updated: number) {}
    public static toItem(attendee: AttendeeFull): AttendeeItem {
        return new AttendeeItem(
            attendee.uuid,
            attendee.role,
            attendee.name,
            attendee.description,
            attendee.descriptionHTML,
            attendee.avatar,
            attendee.job,
            attendee.company,
            attendee.website,
            attendee.twitterUrl,
            attendee.updated);
    }
}
