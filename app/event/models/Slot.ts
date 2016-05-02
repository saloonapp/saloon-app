import {SessionFull} from "./Session";
import {Sort} from "../../common/utils/array";
import {Serializable} from "../../common/models/Serializable";

export interface ISlot {
    uuid: string;
    start: number;
    end: number;
}

export class Slot extends Serializable {
    constructor(public uuid: string,
                public start: number,
                public end: number) { super(); }
}

export class SlotWithSessions extends Serializable {
    constructor(public uuid: string,
                public start: number,
                public end: number,
                public sessions: SessionFull[]) { super(); }
    toSlot(): Slot {
        return new Slot(this.uuid, this.start, this.end);
    }
}

export class SlotHelper {
    public static extract(sessions: SessionFull[]): SlotWithSessions[] {
        const results = [];
        let cpt = 1;
        sessions.map(session => {
            if(results.find(s => s.start === session.start && s.end === session.end) === undefined){
                results.push(new SlotWithSessions(
                    'slot-'+(cpt++),
                    session.start,
                    session.end,
                    sessions.filter(s => s.start === session.start && s.end === session.end)
                ));
            }
        });
        return results.sort((s1, s2) => Sort.num(s1.start, s2.start));
    }
}
