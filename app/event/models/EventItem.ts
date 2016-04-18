import {Address} from "../../common/models/Address";

export class EventItem {
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
                public updated: number) {}
}
