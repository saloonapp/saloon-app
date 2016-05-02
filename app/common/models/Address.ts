import {Serializable} from "./Serializable";

export class Address extends Serializable {
    constructor(public name: string,
                public street: string,
                public zipCode: string,
                public city: string) {}
}
