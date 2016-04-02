import {Address} from "./Address";
import {EventItem} from "./EventItem";
import {AttendeeFull} from "./AttendeeFull";
import {SessionFull} from "./SessionFull";
import {ExponentFull} from "./ExponentFull";

export class EventElt {
    constructor(public name: string) {}
}
export class EventFull {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public logo: string,
                public landing: string,
                public website: string,
                public start: number,
                public end: number,
                public address: Address,
                public price: string,
                public priceUrl: string,
                public twitterHashtag: string,
                public twitterAccount: string,
                public tags: string[],
                public formats: EventElt[],
                public themes: EventElt[],
                public places: EventElt[],
                public attendees: AttendeeFull[],
                public sessions: SessionFull[],
                public exponents: ExponentFull[]) {}
    public static toItem(event: EventFull): EventItem {
        return new EventItem(
            event.uuid,
            event.name,
            event.description,
            event.descriptionHTML,
            event.logo,
            event.landing,
            event.website,
            event.start,
            event.end,
            event.address,
            event.price,
            event.priceUrl,
            event.twitterHashtag,
            event.twitterAccount,
            event.tags,
            event.attendees.length,
            event.sessions.length,
            event.exponents.length);
    }
}
