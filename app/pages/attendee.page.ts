import {OnInit} from "angular2/core";
import {Page} from 'ionic-angular';
import {NavController, NavParams} from "ionic-angular/index";
import {Attendee} from "../models/Attendee";

@Page({
    template: `
<ion-navbar *navbar>
    <ion-title>Participant</ion-title>
</ion-navbar>
<ion-content class="attendee-page">
    <div padding>
        <h1>{{attendee.name}}</h1>
        <h4>{{attendee.company}}</h4>
        <p>{{attendee.description}}</p>
    </div>
</ion-content>
`
})
export class AttendeePage implements OnInit {
    attendee: Attendee;
    constructor(private _nav: NavController, private _navParams: NavParams) {}

    ngOnInit() {
        this.attendee = <Attendee> this._navParams.get('attendee');
    }
}
