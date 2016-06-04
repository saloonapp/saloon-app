import {App, Platform} from "ionic-angular";
import {StatusBar} from "ionic-native";
import * as moment from "moment";
import * as fr from "moment/locale/fr";
import {PluginUtils} from "./common/plugins/utils";
import {SQLitePlugin} from "./common/plugins/sqlite.plugin";
import {SQLiteStorage} from "./common/services/storage-sqlite.service";
import {StorageUtils} from "./common/services/storage-utils.service";
import {Storage} from "./common/storage.service";
import {Backend} from "./common/backend.service";
import {EventService} from "./event/services/event.service";
import {UserService} from "./user/services/user.service";
import {EventData} from "./event/services/event.data";
import {TfidfService} from "./common/tfidf.service";
import {UiHelper} from "./common/ui/utils";
import {SearchPipe, FilterPipe, SortByPipe, MapPipe, GroupByPipe, NotEmptyPipe, JoinPipe} from "./common/pipes/array.pipe";
import {DatePipe, TimePipe, DateTimePipe, WeekDayPipe, DatePeriodPipe, TimePeriodPipe, TimeDurationPipe} from "./common/pipes/datetime.pipe";
import {CapitalizePipe} from "./common/pipes/text.pipe";
import {TwitterNamePipe, TwitterHandlePipe, TwitterUrlPipe} from "./common/pipes/social.pipe";
import {AddressPipe} from "./common/pipes/model.pipe";
import {EventListPage} from "./event/event-list.page";

@App({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    providers: [
        PluginUtils, SQLitePlugin, SQLiteStorage, StorageUtils,
        Storage, Backend,
        UserService, EventService, EventData, TfidfService, UiHelper,
        SearchPipe, FilterPipe, SortByPipe, MapPipe, GroupByPipe, NotEmptyPipe, JoinPipe,
        DatePipe, TimePipe, DateTimePipe, WeekDayPipe, DatePeriodPipe, TimePeriodPipe, TimeDurationPipe,
        CapitalizePipe,
        TwitterNamePipe, TwitterHandlePipe, TwitterUrlPipe,
        AddressPipe
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
