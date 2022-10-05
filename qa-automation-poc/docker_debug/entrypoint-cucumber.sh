#!/bin/bash
if [ -n "$TAGS" ]; then
    mv ../node_modules node_modules
    echo "debug docker image!!!!!!"
    echo "./node_modules/@cucumber/cucumber/bin/cucumber-js -p default $TAGS --no-strict"
    ./node_modules/@cucumber/cucumber/bin/cucumber-js -p default "$TAGS" --no-strict
    statusTests=$?
    echo "building HTML report..."
    ./node_modules/.bin/ts-node packages/cucumber/plugins/report.ts 
    [ $statusTests -eq 0 ] || exit 1
else
    echo "No tags arg given"
fi
