import {Slot} from "./Slot";

export class SessionItem implements Slot {
    constructor(public uuid: string,
                public name: string,
                public description: string,
                public descriptionHTML: string,
                public landing: string,
                public format: string,
                public theme: string,
                public place: string,
                public start: number,
                public end: number,
                public updated: number) {}
}
