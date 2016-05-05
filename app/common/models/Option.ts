export abstract class Option<T> {
    public static of<U>(value: U): Option<U> { return value === null || value === undefined ? new None<U>() : new Some<U>(value); }
    abstract isDefined(): boolean;
    abstract isEmpty(): boolean;
    abstract getOrElse(defaultValue: T): T;
    abstract orElse(other: Option<T>): Option<T>;
    abstract filter(p: (T) => boolean): Option<T>;
    abstract filterNot(p: (T) => boolean): Option<T>;
    abstract map<U>(f: (T) => U): Option<U>;
    abstract flatMap<U>(f: (T) => Option<U>): Option<U>;
}
export class Some<T> extends Option<T> {
    constructor(private value: T) {}
    isDefined()                    : boolean   { return true; }
    isEmpty()                      : boolean   { return false; }
    getOrElse(defaultValue: T)     : T         { return this.value; }
    orElse(other: Option<T>)       : Option<T> { return new Some<T>(this.value); }
    filter(p: (T) => boolean)      : Option<T> { return p(this.value) ? new Some<T>(this.value) : new None<T>(); }
    filterNot(p: (T) => boolean)   : Option<T> { return !p(this.value) ? new Some<T>(this.value) : new None<T>(); }
    map<U>(f: (T) => U)            : Option<U> { return new Some<U>(f(this.value)); }
    flatMap<U>(f: (T) => Option<U>): Option<U> { return f(this.value); }
}
export class None<T> extends Option<T> {
    constructor() {}
    isDefined()                    : boolean   { return false; }
    isEmpty()                      : boolean   { return true; }
    getOrElse(defaultValue: T)     : T         { return defaultValue; }
    orElse(other: Option<T>)       : Option<T> { return other; }
    filter(p: (T) => boolean)      : Option<T> { return new None<T>(); }
    filterNot(p: (T) => boolean)   : Option<T> { return new None<T>(); }
    map<U>(f: (T) => U)            : Option<U> { return new None<U>(); }
    flatMap<U>(f: (T) => Option<U>): Option<U> { return new None<U>(); }
}
