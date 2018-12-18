@ECHO OFF
ECHO Clean the cache first
call npm cache clean --force
ECHO Prune the project for production
call npm prune --production
ECHO Install all dependencies
call npm install
ECHO Make a distribution
call npm run dist