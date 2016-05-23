import {Component, Input, Output, EventEmitter, OnChanges, SimpleChange} from "@angular/core";
import {Feedback} from "../models/Feedback";

interface IStar {
    name: string;
    color: string;
}

@Component({
    selector: 'feedback',
    template: `
<span [title]="value" style="white-space: nowrap;">
    <ion-icon *ngFor="let star of stars; let i=index" [name]="star.name" [style.color]="star.color" (click)="clicked(i)"></ion-icon>
</span>
`
})
export class FeedbackComponent {
    @Input() value: Feedback;
    @Output() change: EventEmitter<Feedback> = new EventEmitter<Feedback>();
    stars: IStar[] = [];

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if(changes && changes['value']) { this.compute(changes['value'].currentValue); }
    }

    clicked(index: number) {
        this.change.emit(new Feedback(index+1, ''));
    }

    private compute(value: number) {
        const stars = [];
        for(let i=0; i<5; i++){
            stars.push(this.buildStar(i, value));
        }
        this.stars = stars;
    }
    private buildStar(index: number, value: number): IStar {
        if(index < Math.round(value)) return {name: 'star', color: '#FFD800'};
        return {name: 'star-outline', color: '#E0E0E0'};
    }
    private buildStar2(index: number, value: number): IStar {
        if(2*index < Math.round(2*value)-1) return {name: 'star', color: '#FFD800'};
        if(2*index < Math.round(2*value)) return {name: 'star-half', color: '#FFD800'};
        return {name: 'star-outline', color: '#E0E0E0'};
    }
}