#!/bin/bash

# Use this script to quickly push generated files to the branch gh-pages
# Folder names are hard-coded so you should have a folder 'saloon-app' containing the current app and a folder 'saloon-app-deploy' with a git repo setup to the same origin github repo

echo ''
echo 'Hello '$USER'.'
echo 'You will deploy SalooN to gh-pages with this script.'

echo 'Continuer ? (y/N)'
read confirm
if [ $confirm = 'y' ]
then
    echo ''
    cp -r www/* ../saloon-app-deploy/
    cd ../saloon-app-deploy/
    git add .
    git commit -m "deploy by $USER at $(date +'%Y-%m-%d %H:%M')"
    git push origin gh-pages
    cd ../saloon-app
    echo ''
    echo 'Deployment done \o/'
    echo ''
else
    echo 'Deployment aborted...'
    echo ''
fi
