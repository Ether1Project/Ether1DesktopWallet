#!/usr/bin/env sh
[ $SUDO_USER ] && _user=$SUDO_USER || _user=`whoami`

rm -r node_moudles

rm package-lock.json

rm -r dist

npm install

npm run dist-linux

echo 'Done!'
