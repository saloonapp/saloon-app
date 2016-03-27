import {Address} from "./Address";

export class EventItem {
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
    tags: Array<string>;
    published: boolean;
    created: number;
    updated: number;
    className: string;
    attendeeCount: number;
    sessionCount: number;
    exponentCount: number;
    actionCount: number;
}
