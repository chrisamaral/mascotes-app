#!/bin/bash

#ASSETS

cd www

rm -rf mascote
rm -rf img
rm -rf text
rm -rf fonts

cp -Rf ../../mascote-producao/img .
cp -Rf ../../rio2016-atletadofuturo/af/fonts .
cp -Rf ../../rio2016-atletadofuturo/af/text .

cd ..

#SOURCES

cd src

rm -rf js/af
rm -rf js/selfie
rm -rf sass/af
rm -rf sass/selfie

cp -RfT ../../rio2016-atletadofuturo/src/js/app js/af
cp -RfT ../../rio2016-atletadofuturo/src/sass sass/af

cp -RfT ../../rio2016-selfie/src/js/app js/selfie
cp -RfT ../../rio2016-selfie/src/sass sass/selfie

cd ..