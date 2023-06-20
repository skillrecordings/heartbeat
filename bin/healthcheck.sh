#!/bin/bash

# $0 is the script name, $1 is the first argument, and so on
if [ -z "$1" ]
then
    echo "ERROR: Filename is missing, specify the filename like so:"
    echo "  npm run healthcheck -- file.ts"
    exit 1
fi

npx ts-node --esm --skipProject $1
