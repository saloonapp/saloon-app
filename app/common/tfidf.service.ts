import {Injectable} from "angular2/core";

export class TfidfDocument {
    id: string;
    text: string;
    constructor(id: string, text: string) {
        this.id = id;
        this.text = text;
    }
}
export class TfidefWord {
    word: string;
    documentCount: number; // count word occurences in document
    documentTotal: number; // count total words in document
    collectionCount: number; // count word occurences in document collection
    collectionTotal: number; // count total words in document collection
    value: number;
    constructor(word: string, documentCount: number, documentTotal: number, collectionCount: number, collectionTotal: number) {
        this.word = word;
        this.documentCount = documentCount;
        this.documentTotal = documentTotal;
        this.collectionCount = collectionCount;
        this.collectionTotal = collectionTotal;
        let termFrequency = documentCount / documentTotal;
        let documentFrequency = collectionCount / collectionTotal;
        this.value = termFrequency / documentFrequency;
    }
}
export class TfidfResult {
    id: string;
    text: string;
    words: TfidefWord[];
    constructor(id: string, text: string, words: TfidefWord[]) {
        this.id = id;
        this.text = text;
        this.words = words;
    }
}

@Injectable()
export class TfidfService {
    compute(documents: TfidfDocument[]): TfidfResult[] {
        let collectionCount = {};
        let parsedDocs = documents.map(doc => {
            let words = this.toWords(doc.text);
            let count = this.countWords(words);
            collectionCount = this.addCounts(collectionCount, count);
            return {doc: doc, count: count, words: []};
        });
        return parsedDocs.map(doc => {
            let tfidf = this.computeTfIdf(doc.count, collectionCount);
            return new TfidfResult(doc.doc.id, doc.doc.text, tfidf);
        });
    }

    private toWords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[,.:;!?+~–_'‘’`"“”«»*#/&()\[\]{}<>=…\n\r\t†‡]/g, ' ')
            .split(' ')
            .filter(e => e.length > 0);
    }
    private countWords(words: string[]) {
        let count = {};
        words.map(word => {
            if(count[word]){ count[word]++; }
            else { count[word] = 1; }
        });
        return count;
    }
    private addCounts(count1, count2) {
        let res = {};
        for(let key in count1){
            res[key] = count1[key] + (count2[key] || 0);
        }
        for(let key in count2){
            if(!res[key]){
                res[key] = count2[key];
            }
        }
        return res;
    }
    private computeTfIdf(documentCount, collectionCount): TfidefWord[] {
        let res = [];
        let documentTotal = this.total(documentCount);
        let collectionTotal = this.total(collectionCount);
        for(let key in documentCount){
            res.push(new TfidefWord(key, documentCount[key], documentTotal, collectionCount[key], collectionTotal));
        }
        return res.sort((e1, e2) => e2.value - e1.value);
    }
    private total(count) {
        let res = 0;
        for(let key in count){
            res += count[key];
        }
        return res;
    }
}