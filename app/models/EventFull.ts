import {Address} from "./Address";
import {AttendeeFull} from "./AttendeeFull";
import {SessionFull} from "./SessionFull";
import {ExponentFull} from "./ExponentFull";

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
                public attendees: AttendeeFull[],
                public sessions: SessionFull[],
                public exponents: ExponentFull[]) {}
}
