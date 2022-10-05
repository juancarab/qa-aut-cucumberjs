#!/bin/bash
if [ -n "$TAGS" ]; then
    echo "./node_modules/@cucumber/cucumber/bin/cucumber-js -p default $TAGS --no-strict"
    ./node_modules/@cucumber/cucumber/bin/cucumber-js -p default "$TAGS" --no-strict
    statusTests=$?
    echo "building Test Result reports..."
    ./node_modules/.bin/ts-node packages/cucumber/plugins/report.ts 
    ./node_modules/.bin/ts-node packages/cucumber/plugins/report4xray.ts 
    [ $statusTests -eq 0 ] || exit 1
else
    echo "No tags arg given"
fi
