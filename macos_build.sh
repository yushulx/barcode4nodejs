#!/bin/bash
node-gyp configure
node-gyp build
install_name_tool -change @rpath/libDynamsoftCore.dylib @loader_path/libDynamsoftCore.dylib build/Release/dbr.node
install_name_tool -change @rpath/libDynamsoftLicense.dylib @loader_path/libDynamsoftLicense.dylib build/Release/dbr.node
install_name_tool -change @rpath/libDynamsoftCaptureVisionRouter.dylib @loader_path/libDynamsoftCaptureVisionRouter.dylib build/Release/dbr.node
install_name_tool -change @rpath/libDynamsoftUtility.dylib @loader_path/libDynamsoftUtility.dylib build/Release/dbr.node
install_name_tool -change @rpath/libDynamsoftImageProcessing.dylib @loader_path/libDynamsoftImageProcessing.dylib build/Release/libDynamsoftUtility.dylib