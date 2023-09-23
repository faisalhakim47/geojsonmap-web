#!/bin/sh

SCRIPT_DIR=$(cd $(dirname $0); pwd)

rm -r $SCRIPT_DIR/../dist

npx rollup --format=module --sourcemap --generatedCode es5 --file=$SCRIPT_DIR/../dist/geojsonmap.js $SCRIPT_DIR/../src/index.js
node $SCRIPT_DIR/post-cleanup-jsdoc.mjs

npx -p typescript tsc $SCRIPT_DIR/../dist/geojsonmap.js --target ESNext --declaration --allowJs --emitDeclarationOnly --outFile $SCRIPT_DIR/../dist/geojsonmap.d.ts
