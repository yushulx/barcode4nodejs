{
    "targets": [
        {
            'target_name': "dbr",
            'sources': ["src/dbr.cc"],
            "cflags" : [
                "-std=c++11"
            ],
            'ldflags': [
                        "-Wl,-rpath,'$$ORIGIN'"
            ],
            'include_dirs': [
                        "./"
            ],
            'conditions': [
                ['OS=="linux"', {
                    'defines': [
                        'LINUX_DBR',
                    ],
                    
                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L../platforms/linux"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                './platforms/linux/libDynamsoftBarcodeReader.so',
                                './platforms/linux/libDynamicPdf.so',
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
                                './platforms/windows/DynamicPdfx64.dll',
                                './platforms/windows/vcomp110.dll'
                            ]
                        }
                    ]
                }],
                ['OS=="mac"', {
                    'defines': [
                        'MAC_DBR',
                    ],
                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L../platforms/macos"
                    ],
                    'copies': [
                        {
                            'destination': '/usr/local/lib/',
                            'files': [
                                './platforms/macos/libDynamsoftBarcodeReader.dylib'
                            ]
                        }
                    ]
                }]
            ]
        }
    ]
}
