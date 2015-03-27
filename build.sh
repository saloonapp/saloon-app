#!/bin/bash

# This script should be launched from cordova project folder
# It assumes that you have a file named 'my-release-key.keystore' to sign your apk
# You will have to enter your keystore password to sign your apk

appName='SalooN'
appPackage='com.saloon.app'

configApk='config.xml'
configApp='www/js/config/_config.js'
currentVersion=$(grep \"\ version=\" $configApk | sed -e 's/.*\"\ version="\([^"]*\)".*/\1/g')

echo ''
echo 'Hello '$USER'.'
echo 'You will generate apk with this script.'
echo 'Choose target app version (current: '$currentVersion') :'
read version
prodFile=$appName'-release-v'$version'.apk'
debugFile=$appName'-debug-v'$version'.apk'
echo ''
echo 'Enter passphrase to sign prod apk (my-release-key.keystore) :'
read -s password
echo ''
echo 'Will generate app with version <'$version'> ('$prodFile' and '$debugFile')'
echo ''


# change version in config.xml and _config.js
sed -i 's/\(\"\ version="\)[^"]*\("\)/\1'$version'\2/' $configApk
sed -i "s/\(appVersion: '\)[^']*\('\)/\1"$version"\2/" $configApp


# build production apk
sed -i 's/\(id="'$appPackage'\).dev\("\)/\1\2/' $configApk
sed -i 's/\(<name>\)dev-\('$appName'<\/name>\)/\1\2/' $configApk
sed -i 's/\(var env = \)[^;]*\(;\)/\1prod\2/' $configApp
sed -i 's/\(verbose: \)[^,]*\(,\)/\1false\2/' $configApp
sed -i 's/\(debug: \)[^,]*\(,\)/\1false\2/' $configApp
cordova platform remove android
cordova platform add android
cordova build --release android
cp platforms/android/ant-build/CordovaApp-release-unsigned.apk .
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore -storepass $password CordovaApp-release-unsigned.apk alias_name
zipalign -v 4 CordovaApp-release-unsigned.apk $prodFile
rm CordovaApp-release-unsigned.apk


# build debug apk
sed -i 's/\(id="'$appPackage'\)\("\)/\1.dev\2/' $configApk
sed -i 's/\(<name>\)\('$appName'<\/name>\)/\1dev-\2/' $configApk
sed -i 's/\(var env = \)[^;]*\(;\)/\1debug\2/' $configApp
sed -i 's/\(verbose: \)[^,]*\(,\)/\1true\2/' $configApp
sed -i 's/\(debug: \)[^,]*\(,\)/\1true\2/' $configApp
cordova platform remove android
cordova platform add android
cordova build
cp platforms/android/ant-build/CordovaApp-debug.apk .
mv CordovaApp-debug.apk $debugFile


# Finish...
sed -i "s/\(appVersion: '\)[^']*\('\)/\1"$version"~\2/" $configApp

echo ""
echo "  +--------------------------------+"
echo "  |                                |"
echo "  | Your apps are ready :          |"
echo "  |   - $prodFile  |"
echo "  |   - $debugFile    |"
echo "  |                                |"
echo "  +--------------------------------+"
echo ""
