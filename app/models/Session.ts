import {Attendee} from "./Attendee";

export class Session {
    uuid: string;
    eventId: string;
    name: string;
    description: string;
    format: string;
    category: string;
    place: string;
    start: number;
    end: number;
    speakers: Attendee[];
    tags: string[];
    created: number;
    updated: number;
    className: string;
}
