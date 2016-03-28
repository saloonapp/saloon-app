import {Attendee} from "./Attendee";

export class Exponent {
    uuid: string;
    eventId: string;
    name: string;
    description: string;
    logoUrl: string;
    landingUrl: string;
    siteUrl: string;
    team: Attendee[];
    level: string;
    sponsor: boolean;
    tags: string[];
    images: string[];
    created: number;
    updated: number;
    className: string;
}
