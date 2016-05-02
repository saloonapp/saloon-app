import {Serializable} from "../../common/models/Serializable";
import {Address} from "../../common/models/Address";
import {AttendeeFull} from "./Attendee";
import {SessionFull} from "./Session";
import {ExponentFull} from "./Exponent";
import {Slot} from "./Slot";
import {AttendeeItem} from "./Attendee";

export class EventItem extends Serializable {
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
                public attendeeCount: number,
                public sessionCount: number,
                public exponentCount: number,
                public updated: number) { super(); }

    // override Serializable.fromJS to correctly parse nested class
    public static fromJS(jsonObj: any): EventItem {
        const instance   = <EventItem> super.fromJS(jsonObj);
        instance.address = <Address> Address.fromJS(jsonObj.address);
        return instance;
    }
}

export class EventFull extends Serializable {
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
                public exponents: ExponentFull[],
                public slots: Slot[],
                public updated: number) { super(); }
    toItem(): EventItem {
        return new EventItem(
            this.uuid,
            this.name,
            this.description,
            this.descriptionHTML,
            this.logo,
            this.landing,
            this.website,
            this.start,
            this.end,
            this.address,
            this.price,
            this.priceUrl,
            this.twitterHashtag,
            this.twitterAccount,
            this.tags,
            this.attendees.length,
            this.sessions.length,
            this.exponents.length,
            this.updated);
    }

    // override Serializable.fromJS to correctly parse nested class
    public static fromJS(jsonObj: any): EventFull {
        const instance     = <EventFull> super.fromJS(jsonObj);
        instance.address   = <Address> Address.fromJS(jsonObj.address);
        instance.formats   = <EventElt[]> instance.formats.map(item => EventElt.fromJS(item));
        instance.themes    = <EventElt[]> instance.themes.map(item => EventElt.fromJS(item));
        instance.places    = <EventElt[]> instance.places.map(item => EventElt.fromJS(item));
        instance.attendees = <AttendeeFull[]> instance.attendees.map(item => AttendeeFull.fromJS(item));
        instance.sessions  = <SessionFull[]> instance.sessions.map(item => SessionFull.fromJS(item));
        instance.exponents = <ExponentFull[]> instance.exponents.map(item => ExponentFull.fromJS(item));
        instance.slots     = <Slot[]> instance.slots.map(item => Slot.fromJS(item));
        return instance;
    }
}

export class EventElt extends Serializable {
    constructor(public name: string) { super(); }
}
