import {Sort} from "../../common/utils/array";

export interface Slot {
    uuid: string;
    start: number;
    end: number;
}

export class SlotHelper {
    public static extract(slots: Slot[]): Slot[] {
        const results: Slot[] = [];
        let cpt = 1;
        slots.map(slot => {
            if(results.find(s => s.start === slot.start && s.end === slot.end) === undefined){
                results.push({
                    uuid: 'slot-'+(cpt++),
                    start: slot.start,
                    end: slot.end
                });
            }
        });
        return results.sort((s1, s2) => Sort.num(s1.start, s2.start));
    }
}
