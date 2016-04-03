import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import * as moment from "moment";
import * as fr from "moment/locale/fr"
import {PluginUtils} from "./common/plugins/utils";
import {SQLitePlugin} from "./common/plugins/sqlite.plugin";
import {SQLiteStorage} from "./common/storage-sqlite.service";
import {StorageUtils} from "./common/storage-utils.service";
import {Storage} from "./common/storage.service";
import {Backend} from "./common/backend.service";
import {EventService} from "./common/event.service";
import {TfidfService} from "./common/tfidf.service";
import {UiUtils} from "./common/ui/utils";
import {DatePipe, TimePipe, DateTimePipe, WeekDayPipe} from "./common/pipes/datetime.pipe";
import {CapitalizePipe} from "./common/pipes/text.pipe";
import {EventListPage} from "./pages/event-list.page";

@App({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    providers: [
        PluginUtils, SQLitePlugin, SQLiteStorage, StorageUtils,
        Storage, Backend,
        EventService, TfidfService, UiUtils,
        DatePipe, TimePipe, DateTimePipe, WeekDayPipe, CapitalizePipe
    ],
    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
    rootPage: any = EventListPage;

    constructor(platform: Platform) {
        moment.locale('fr', fr);
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
        });
    }
}
