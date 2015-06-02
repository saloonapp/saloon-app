#!/bin/bash

# This script should be launched from cordova project folder
# It will upload the app to Ionic server's in dev & prod versions
# The first time you will need to login with Ionic credentials

appName='SalooN'
appPackage='co.saloonapp.eventexplorer'
devId='2b7767d0'
prodId='e57ea86a'

configApk='config.xml'
configApp='www/js/config/_config.js'
configIonic='ionic.project'
currentVersion=$(grep \"\ version=\" $configApk | sed -e 's/.*\"\ version="\([^"]*\)".*/\1/g')

echo ''
echo 'Hello '$USER'.'
echo 'This scrip will upload your app to Ionic servers.'
echo 'Choose target app version (current: '$currentVersion') :'
read version
echo ''

# change version in config.xml and _config.js
sed -i 's/\(\"\ version="\)[^"]*\("\)/\1'$version'\2/' $configApk
sed -i "s/\(appVersion: '\)[^']*\('\)/\1"$version"\2/" $configApp


# configure production app
sed -i 's/\(id="'$appPackage'\).dev\("\)/\1\2/' $configApk
sed -i 's/\(<name>\)dev-\('$appName'<\/name>\)/\1\2/' $configApk
sed -i 's/\(var env = \)[^;]*\(;\)/\1prod\2/' $configApp
sed -i 's/\("name": "\)dev-\('$appName'",\)/\1\2/' $configIonic
sed -i 's/\("app_id": "\)[^"]*\(",\)/\1'$prodId'\2/' $configIonic
ionic upload


# configure development app
sed -i 's/\(id="'$appPackage'\)\("\)/\1.dev\2/' $configApk
sed -i 's/\(<name>\)\('$appName'<\/name>\)/\1dev-\2/' $configApk
sed -i 's/\(var env = \)[^;]*\(;\)/\1dev\2/' $configApp
sed -i 's/\("name": "\)\('$appName'",\)/\1dev-\2/' $configIonic
sed -i 's/\("app_id": "\)[^"]*\(",\)/\1'$devId'\2/' $configIonic
ionic upload


# Finish...
sed -i "s/\(appVersion: '\)[^']*\('\)/\1"$version"~\2/" $configApp

echo '  +--------------------------------------------------------------------+'
echo '  |                                                                    |'
echo '  |  Well done! Your version '$version' is now uploaded to Ionic servers !  |'
echo '  |                                                                    |'
echo '  +--------------------------------------------------------------------+'
echo ''
