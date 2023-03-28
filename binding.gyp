{
    "targets": [
        {
            'target_name': "dbr",
            'sources': ["src/dbr.cc"],
            'include_dirs': [
                "./"
            ],
            'conditions': [
                ['OS=="linux" and ARCH=="x64"', {
                    'defines': [
                        'LINUX_DBR',
                    ],

                    "cflags": [
                        "-std=c++11"
                    ],
                    'ldflags': [
                        "-Wl,-rpath,'$$ORIGIN'"
                    ],

                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L../platforms/linux"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                './platforms/linux/libDynamsoftBarcodeReader.so',
                                './platforms/linux/libDynamsoftLicenseClient.so',
                                './platforms/linux/libDynamicPdf.so',
                            ]
                        }
                    ]
                }],
                ['OS=="linux" and ARCH=="arm"', {
                    'defines': [
                        'LINUX_DBR',
                    ],

                    "cflags": [
                        "-std=c++11"
                    ],
                    'ldflags': [
                        "-Wl,-rpath,'$$ORIGIN'"
                    ],

                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L../platforms/arm32"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                './platforms/arm32/libDynamsoftBarcodeReader.so',
                                './platforms/arm32/libDynamsoftLicenseClient.so',
                                './platforms/arm32/libDynamicPdf.so',
                            ]
                        }
                    ]
                }],
                ['OS=="linux" and ARCH=="arm64"', {
                    'defines': [
                        'LINUX_DBR',
                    ],

                    "cflags": [
                        "-std=c++11"
                    ],
                    'ldflags': [
                        "-Wl,-rpath,'$$ORIGIN'"
                    ],

                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L../platforms/aarch64"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                './platforms/aarch64/libDynamsoftBarcodeReader.so',
                                './platforms/aarch64/libDynamsoftLicenseClient.so',
                                './platforms/aarch64/libDynamicPdf.so',
                            ]
                        }
                    ]
                }],
                ['OS=="win"', {
                    'defines': [
                        'WINDOWS_DBR',
                    ],
                    'libraries': [
                        "-l../platforms/windows/DBRx64.lib"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                './platforms/windows/DynamsoftBarcodeReaderx64.dll',
                                './platforms/windows/DynamsoftLicenseClientx64.dll',
                                './platforms/windows/vcomp110.dll',
                                './platforms/windows/DynamicPdfx64.dll',
                            ]
                        }
                    ]
                }],
                ['OS=="mac"', {
                    'defines': [
                        'MAC_DBR',
                    ],
                    "cflags": [
                        "-std=c++11"
                    ],
                    'ldflags': [
                        "-Wl,-rpath,@loader_path"
                    ],
                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L../platforms/macos"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                './platforms/macos/libDynamsoftBarcodeReader.dylib',
                                './platforms/macos/libDynamsoftLicenseClient.dylib',
                                './platforms/macos/libDynamicPdf.dylib',
                            ]
                        }
                    ]
                }]
            ]
        }
    ]
}
