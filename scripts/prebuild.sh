#!/bin/bash

pushd src
mkdir -p ../dist/
babel -d ../dist/ *.js
popd
