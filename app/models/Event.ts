import {Address} from "./Address";
import {Attendee} from "./Attendee";
import {Session} from "./Session";
import {Exponent} from "./Exponent";

export class Event {
    uuid: string;
    refreshUrl: string;
    name: string;
    description: string;
    logoUrl: string;
    landingUrl: string;
    siteUrl: string;
    start: number;
    end: number;
    address: Address;
    price: string;
    priceUrl: string;
    twitterHashtag: string;
    twitterAccount: string;
    tags: string[];
    published: boolean;
    created: number;
    updated: number;
    className: string;
    attendees: Attendee[];
    sessions: Session[];
    exponents: Exponent[];
}
