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
        const termFrequency = documentCount / documentTotal;
        const documentFrequency = collectionCount / collectionTotal;
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
        let collectionCount: { [key: string]: number; } = {};
        const parsedDocs = documents.map(doc => {
            const words = this.toWords(doc.text);
            const count = this.countWords(words);
            collectionCount = this.addCounts(collectionCount, count);
            return {doc: doc, count: count, words: []};
        });
        return parsedDocs.map(doc => {
            const tfidf = this.computeTfIdf(doc.count, collectionCount);
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

    private countWords(words: string[]): { [key: string]: number; } {
        const count: { [key: string]: number; } = {};
        words.map(word => {
            if(count[word]){ count[word]++; }
            else { count[word] = 1; }
        });
        return count;
    }

    private addCounts(count1: { [key: string]: number; }, count2: { [key: string]: number; }): { [key: string]: number; } {
        const res: { [key: string]: number; } = {};
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

    private computeTfIdf(documentCount: { [key: string]: number; }, collectionCount: { [key: string]: number; }): TfidefWord[] {
        const res = [];
        const documentTotal = this.total(documentCount);
        const collectionTotal = this.total(collectionCount);
        for(let key in documentCount){
            res.push(new TfidefWord(key, documentCount[key], documentTotal, collectionCount[key], collectionTotal));
        }
        return res.sort((e1, e2) => e2.value - e1.value);
    }

    private total(count: { [key: string]: number; }) {
        let res = 0;
        for(let key in count){
            res += count[key];
        }
        return res;
    }
}