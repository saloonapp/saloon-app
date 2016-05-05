# This script should be launched from cordova project folder
# You will have to enter your keystore password to sign your apk

signKey="co.saloonapp.mobile-android.keystore"
appName="SalooN 2"
appPackage="co.saloonapp.mobile"

configApk="config.xml"
configApp="www/build/js/app.bundle.js"
configAppSrc="app/config.ts"

echo ""

if [ -z "$(git status --porcelain)" ]
then
    currentVersion=$(grep \"\ version=\" $configApk | sed -e 's/.*" version="\([^"]*\)".*/\1/g')
    gitBranch=$(git rev-parse --abbrev-ref HEAD)
    gitCommit=$(git rev-parse --short HEAD)
    buildDate=$(date +'%Y-%m-%d %H:%M')

    echo "Hello $USER."
    echo "You will generate apk with this script."
    echo "Choose target app version (current: $currentVersion) :"
    read version
    prodFile="$appName-release-v$version.apk"
    debugFile="$appName-debug-v$version.apk"
    echo ""
    echo "Enter passphrase to sign prod apk ($signKey) :"
    read -s password
    echo ""
    echo "Will generate app with version <$version> ($prodFile and $debugFile)"
    echo ""


    # change version in config.xml and app config file
    sed -i 's/\(\"\ version="\)[^"]*\("\)/\1'$version'\2/' $configApk
    sed -i "s/\(Config.appVersion = '\)[^']*\(';\)/\1$version\2/" $configApp
    sed -i "s/\(Config.gitBranch = '\)[^']*\(';\)/\1$gitBranch\2/" $configApp
    sed -i "s/\(Config.gitCommit = '\)[^']*\(';\)/\1$gitCommit\2/" $configApp
    sed -i "s/\(Config.buildDate = '\)[^']*\(';\)/\1$buildDate\2/" $configApp


    # build production apk
    echo ""
    echo "Building production apk..."
    echo ""
    sed -i 's/\(widget id="\)[^"]*\("\)/\1'$appPackage'\2/' $configApk
    sed -i "s/\(<name>\)[^<]*\(<\/name>\)/\1$appName\2/" $configApk
    sed -i "s/\(Config.env = Config.\)[^;]*\(;\)/\1prod\2/" $configApp
    cordova platform remove android
    cordova platform add android
    cordova build --release android
    cp platforms/android/build/outputs/apk/android-release-unsigned.apk .
    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $signKey -storepass $password android-release-unsigned.apk alias_name
    zipalign -v 4 android-release-unsigned.apk "$prodFile"
    rm android-release-unsigned.apk


    # build debug apk
    echo ""
    echo "Building debug apk..."
    echo ""
    sed -i 's/\(widget id="\)[^"]*\("\)/\1'$appPackage'.dev\2/' $configApk
    sed -i "s/\(<name>\)[^<]*\(<\/name>\)/\1dev-$appName\2/" $configApk
    sed -i "s/\(Config.env = Config.\)[^;]*\(;\)/\1dev\2/" $configApp
    cordova platform remove android
    cordova platform add android
    cordova build android
    cp platforms/android/build/outputs/apk/android-debug.apk .
    mv android-debug.apk "$debugFile"


    # change app config file source and commit changes to git
    sed -i "s/\(Config.appVersion = '\)[^']*\(';\)/\1$version~\2/" $configApp
    sed -i "s/\(public static appVersion = '\)[^']*\(';\)/\1$version~\2/" $configAppSrc
    sed -i "s/\(public static gitBranch = '\)[^']*\(';\)/\1$gitBranch\2/" $configAppSrc
    sed -i "s/\(public static gitCommit = '\)[^']*\(';\)/\1$gitCommit\2/" $configAppSrc
    sed -i "s/\(public static buildDate = '\)[^']*\(';\)/\1$buildDate\2/" $configAppSrc
    git add $configApk $configAppSrc
    git commit -m "build version $version"

    echo ""
    echo "  +----------------------------------+"
    echo "  |                                  |"
    echo "  | Your apps are ready :            |"
    echo "  |   - $prodFile  |"
    echo "  |   - $debugFile    |"
    echo "  |                                  |"
    echo "  +----------------------------------+"
    echo ""
else
    echo "PLEASE COMMIT YOUR CHANGES BEFORE BUILDING YOUR APP :"
    echo ""
    echo $(git status --porcelain)
fi

echo ""
