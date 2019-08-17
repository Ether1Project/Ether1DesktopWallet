#!/usr/bin/env sh
[ $SUDO_USER ] && _user=$SUDO_USER || _user=`whoami`

rm dist

git pull

npm run dist

echo 'Done!'
