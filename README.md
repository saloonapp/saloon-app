![SalooN](doc/logo.png)

# Your next event app

SalooN est une application open-source qui a pour but d'aider les participants à une conférence à planifier et suivre leur programme.

L'application est [accessible sur le web](http://saloonapp.github.io/saloon-app/) et téléchargeable sur le [Play Store](https://play.google.com/store/apps/details?id=co.saloonapp.eventexplorer) et sur l'[App Store](https://itunes.apple.com/fr/app/saloon-events/id999897097).

Pour toute demande de fonctionnalité ou signalement de bug, les issues et pull-request sont à votre disposition :)

Si une conférence vous intéresse et n'est pas présente, n'hésitez pas à [nous contacter](http://saloonapp.herokuapp.com/#contact). Nous ferons notre possible pour l'ajouter en temps et en heures.

## Technical

### TODO

- add scrollToNow for session-list/session-filter pages (when not filtered by slot)
- tester l'application ([sample](https://github.com/lathonez/clicker) + [tuto](http://lathonez.github.io/2016/ionic-2-unit-testing/))
- ajouter un lien dans la version web pour télécharger l'app mobile
- proposer de télécharger l'app mobile au bout de "quelques" actions (favs/ratings)
- add colors for theme / room / format
- filter by : day, theme, room or format
- add user notes
- add error handler

### Getting started

- install nodejs, cordova & ionic@beta (if not already done)
- clone this repo and go to folder
- `npm install`
- `ionic serve`

To run the app on your android device :

- `ionic platform add android` : add android platform to the project
- `ionic run android` : run your app !

### Notes

#### Ionic2 issues

- when used in navigator
    - urls are importants (deep-linking & setup navigation history)
    - browser back button not handled (navigation.push/pop does not handle browser history)
- créer un composant avec un ion-item (style is broken)
- scrollTo with virtual scroll (not found element if not displayed)
- hold event

#### Ionic1 features not (yet) in Ionic2

- $ionicLoading
- android back button
- infinite-scroll

#### Angular1 features not in Angular2

- angular.copy(), angular.equals()
- filters : filter, orderBy
