#!/bin/bash

#ASSETS

rm -rf img
rm -rf text
rm -rf fonts

ln -s ../mascote-producao/img
ln -s ../rio2016-atletadofuturo/af/fonts
ln -s ../rio2016-atletadofuturo/af/text

#SOURCES

cd src

cd js
rm -rf af
rm -rf selfie
ln -s ../../../rio2016-atletadofuturo/src/js/app af
ln -s  ../../../rio2016-selfie/src/js/app selfie

cd ../sass
rm -rf af
rm -rf selfie
ln -s ../../../rio2016-atletadofuturo/src/sass af
ln -s ../../../rio2016-selfie/src/sass selfie

cd ../..