#!/bin/bash

# This script should be launched from cordova project folder
# It assumes that you have a file named 'my-release-key.keystore' to sign your apk
# You will have to enter your keystore password to sign your apk

appName='SalooN'
appPackage='co.saloonapp.eventexplorer'

configApk='config.xml'
configApp='www/js/config/_config.js'
currentVersion=$(grep \"\ version=\" $configApk | sed -e 's/.*\"\ version="\([^"]*\)".*/\1/g')

echo ''
echo 'Hello '$USER'.'
echo 'You will generate apk with this script.'
echo 'Choose target app version (current: '$currentVersion') :'
read version
echo ''
echo 'Will generate app with version <'$version'>'
echo ''


# change version in config.xml and _config.js
sed -i '' 's/\(\"\ version="\)[^"]*\("\)/\1'$version'\2/' $configApk
sed -i '' "s/\(appVersion: '\)[^']*\('\)/\1"$version"\2/" $configApp


# build production app
sed -i '' 's/\(id="'$appPackage'\).dev\("\)/\1\2/' $configApk
sed -i '' 's/\(<name>\)dev-\('$appName'<\/name>\)/\1\2/' $configApk
sed -i '' 's/\(var env = \)[^;]*\(;\)/\1prod\2/' $configApp
cordova platform remove ios
cordova platform add ios
cordova build ios --release


# Finish...
sed -i '' "s/\(appVersion: '\)[^']*\('\)/\1"$version"~\2/" $configApp

echo ""
echo "  +--------------------------------+"
echo "  |                                |"
echo "  | Your apps are ready            |"
echo "  |                                |"
echo "  +--------------------------------+"
echo ""
