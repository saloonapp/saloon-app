#!/bin/bash

# Use this script to quickly push generated files to the branch gh-pages
# Folder names are hard-coded so you should have a folder 'saloon-app' containing the current app and a folder 'saloon-app-deploy' with a git repo setup to the same origin github repo

echo ""

if [ -z "$(git status --porcelain)" ]
then
    echo "Hello $USER."
    echo "You will deploy SalooN to gh-pages with this script."
    echo "Continuer ? (y/N)"
    read confirm
    if [ $confirm = "y" ]
    then
        echo ""
        gitCommit=$(git rev-parse --short HEAD)
        gitBranch=$(git rev-parse --abbrev-ref HEAD)
        cp -r www/* ../saloon-app-deploy/
        cd ../saloon-app-deploy/
        sed -i 's/Config.env = Config.dev;/Config.env = Config.prod;/' 'build/js/app.bundle.js'
        git add .
        git commit -m "$gitBranch-$gitCommit deployed by $USER on $(date +'%Y-%m-%d %H:%M')"
        git push origin gh-pages
        cd ../saloon-app
        echo ""
        echo "Deployment done \o/"
    else
        echo "Deployment aborted..."
    fi
else
    echo "PLEASE COMMIT YOUR CHANGES BEFORE DEPLOYING :"
    echo ""
    echo $(git status --porcelain)
fi

echo ""
