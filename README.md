# Saloon

Meet interesting people around you !

## Getting started

- install nodejs, gulp, cordova & ionic (if not already done)
- go to project folder
- rename `www/js/config/_config-sample.js` to `www/js/config/_config.js` and setup your keys
- `bower install` : install app dependencies
- `npm install gulp` : install build dependencies
- `ionic setup sass` : use sass
- `ionic serve` : start the app on your browser

To run the app on your android device :

- `ionic platform add android` : add android platform to the project
- `ionic resources` : generate icon & splash-screen for project platforms
- `ionic run android` : run your app !

## Main features

- Connecti with your linkedin profile
- see connected people around you (ordered by relevance)
- chat publicly with others (rooms ordered by last message sent by you)
- send polls (by instant (1h) popularity & filter by answered or not)
- post/answer offers (ordered chronologically)

- slack integration ?

## Resources

- Sample image upload : https://github.com/aaronksaunders/dcww
- Sample chat : https://github.com/gregavola/instachat
- integrate https://www.fullcontact.com/ API
- integrate gravatar API
