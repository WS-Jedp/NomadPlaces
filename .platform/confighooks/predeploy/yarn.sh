#!/bin/bash
if ! command -v yarn &> /dev/null
then
    npm install -g yarn
fi

yarn install --frozen-lockfile
