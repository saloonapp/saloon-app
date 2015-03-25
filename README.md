# SalooN

Meet interesting people around you !

## Getting started

- install nodejs, gulp, cordova & ionic (if not already done)
- go to project folder
- rename `www/js/config/_config-sample.js` to `www/js/config/_config.js` and setup your keys
- rename `ParseCloudCode/config/global-sample.json` to `ParseCloudCode/config/global.json` and setup your keys
- rename `ParseCloudCode/cloud/credentials-sample.js` to `ParseCloudCode/cloud/credentials.js` and setup your keys
- install parse CLI `curl -s https://www.parse.com/downloads/cloud_code/installer.sh | sudo /bin/bash` (if not done yet)
- upload cloud code to parse `cd ParseCloudCode/ && parse deploy && cd ../`
- `bower install` : install app dependencies
- `npm install gulp` : install build dependencies
- `ionic setup sass` : use sass
- `ionic serve` : start the app on your browser

To run the app on your android device :

- `ionic platform add android` : add android platform to the project
- `ionic resources` : generate icon & splash-screen for project platforms
- `ionic run android` : run your app !

## Main features

- Connection with your linkedin profile
- see connected people around you (ordered by relevance)
- chat publicly with others (rooms ordered by last message sent by you)
- send polls (by instant (1h) popularity & filter by answered or not)
- post/answer offers (ordered chronologically)

- slack integration ?

## TODO

- demo mode
- user profile (updates)
- migrate getUsersAround(), getMessagesAround() & getPollsAround() to cloud code (centralize 'around' distance + update user location)
- improve people search (showing matching elements)
- save linkedin profile in separate collection
- add more API : fullcontact, gravatar, twitter, github, google, facebook...
- get full-profile & contacts from linkedin
- add background geolocation (https://github.com/christocracy/cordova-background-geolocation)
- include geolocalized twitts in SalooN (default) chat
- send photos in chats
- add events (like devoxx) with speakers, rooms, attendee, sponsors, slots (speakers+room+time+...), map...

## Resources

- Code sample :
    - image upload : https://github.com/aaronksaunders/dcww
    - chat (parse+pusher) : https://github.com/gregavola/instachat
- Data sources :
    - integrate https://www.fullcontact.com/ API
    - integrate gravatar API
- Intesting UI patterns :
    - consumer quotes : http://bootsnipp.com/snippets/featured/fancy-tabs-responsive, http://bootsnipp.com/snippets/featured/carousel-with-face-indicators
    - material menu : http://bootsnipp.com/snippets/featured/inbox-by-gmail
    - timeline : http://bootsnipp.com/snippets/featured/single-column-timeline-collapsed, http://bootsnipp.com/snippets/featured/single-column-timeline-dotted, http://bootsnipp.com/snippets/featured/timeline-single-column, http://bootsnipp.com/snippets/featured/single-column-timeline
    - two column timeline : http://bootsnipp.com/snippets/featured/timeline-dotted, http://bootsnipp.com/snippets/featured/two-column-timeline-not-responsive, http://bootsnipp.com/snippets/featured/timeline-responsive, http://bootsnipp.com/snippets/featured/timeline
    - chat : http://bootsnipp.com/snippets/featured/social-network-style-lightbox, http://bootsnipp.com/snippets/featured/like-hangout-chat, http://bootsnipp.com/snippets/featured/collapsible-chat-widget
- UI resouce inspiration :
    - http://www.mobile-patterns.com/
    - http://www.pttrns.com/
    - http://mycolorscreen.com/
- Offline communication :
    - https://opengarden.com/developers
    - Apple’s Multipeer Connectivity framework (https://developer.apple.com/library/ios/documentation/MultipeerConnectivity/Reference/MultipeerConnectivityFramework/)
    - Android direct wifi (http://developer.android.com/guide/topics/connectivity/wifip2p.html)
    - WebRTC or Boost Asio (http://stackoverflow.com/questions/17965176/is-there-any-framework-to-allow-p2p-communication-via-phone)
    - NFC (https://github.com/don/phonegap-p2p)
- Offline cache :
    - http://pouchdb.com/ ?
