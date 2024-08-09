{
    "variables": {
        "arch": ["<!(node -e \"console.log(process.arch);\")"]
    },
    "targets": [
        {
            "target_name": "dbr",
            "sources": ["src/dbr.cc"],
            "include_dirs": [
                "./",
                "<!(node -e \"try { require.resolve('node-addon-api'); console.log(require('node-addon-api').include); } catch (e) { console.log(require('child_process').execSync('npm root -g').toString().trim() + '/node-addon-api'); }\")",
                "<!(node -e \"require('child_process').execSync('node -p process.execPath').toString().trim() + '/../../include/node'\")"
            ],
            "conditions": [
                ["OS=='linux'", {
                    "defines": ["LINUX_DBR"],
                    "cflags": ["-std=c++11", "-DNAPI_CPP_EXCEPTIONS", "-fexceptions"],
                    "cflags_cc": ["-std=c++11", "-DNAPI_CPP_EXCEPTIONS", "-fexceptions"],
                    "ldflags": ["-Wl,-rpath,'$$ORIGIN'"],
                    "libraries": [
                        "-lDynamsoftBarcodeReader", "-L../platforms/linux/<(arch)"
                    ],
                    "copies": [
                        {
                            "destination": "build/Release/",
                            "files": [
                                "./platforms/linux/<(arch)/libDynamsoftBarcodeReader.so",
                                "./platforms/linux/<(arch)/libDynamsoftLicenseClient.so",
                                "./platforms/linux/<(arch)/libDynamicPdf.so"
                            ]
                        }
                    ]
                }],
                ["OS=='win'", {
                    "defines": ["WINDOWS_DBR", "NAPI_CPP_EXCEPTIONS"],
                    "libraries": [
                        "-l../platforms/windows/DBRx64.lib"
                    ],
                    "copies": [
                        {
                            "destination": "build/Release/",
                            "files": [
                                "./platforms/windows/DynamsoftBarcodeReaderx64.dll",
                                "./platforms/windows/DynamsoftLicenseClientx64.dll",
                                "./platforms/windows/vcomp110.dll",
                                "./platforms/windows/DynamicPdfx64.dll"
                            ]
                        }
                    ]
                }],
                ["OS=='mac'", {
                    "defines": ["MAC_DBR"],
                    "cflags": ["-std=c++11", "-DNAPI_CPP_EXCEPTIONS"],
                    "cflags_cc": ["-std=c++11", "-DNAPI_CPP_EXCEPTIONS"],
                    "ldflags": ["-Wl,-rpath,@loader_path"],
                    "libraries": [
                        "-lDynamsoftBarcodeReader", "-L../platforms/macos"
                    ],
                    "copies": [
                        {
                            "destination": "build/Release/",
                            "files": [
                                "./platforms/macos/libDynamsoftBarcodeReader.dylib",
                                "./platforms/macos/libDynamsoftLicenseClient.dylib",
                                "./platforms/macos/libDynamicPdf.dylib"
                            ]
                        }
                    ]
                }]
            ]
        }
    ]
}
