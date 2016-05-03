import {Serializable} from "../../common/models/Serializable";

export class UserAction<T> extends Serializable {
    constructor(public action: string,
                public eventId: string,
                public itemType: string,
                public itemId: string,
                public value: T,
                public created: number) { super(); }
}
