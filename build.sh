#!/usr/bin/env sh
[ $SUDO_USER ] && _user=$SUDO_USER || _user=`whoami`

rm -r node_moudles

rm package-lock.json

rm dist

npm install

npm run dist

echo 'Done!'
