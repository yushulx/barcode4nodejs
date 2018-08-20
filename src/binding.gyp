{
    "targets": [
        {
            'target_name': "dbr",
            'sources': ["dbr.cc"],
            'conditions': [
                ['OS=="linux"', {
                    'defines': [
                        'LINUX_DBR',
                    ],
                    'include_dirs': [
                        "./"
                    ],
                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L/mnt/g/nodejs"
                    ],
                    "ldflags": [
                        "-Wl,-rpath,'$$ORIGIN'"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                '/mnt/g/nodejs/libDynamsoftBarcodeReader.so'
                            ]
                        }
                    ]
                }],
                ['OS=="win"', {
                    'defines': [
                        'WINDOWS_DBR',
                    ],
                    'include_dirs': [
                        "./"
                    ],
                    'libraries': [
                        "-lE:\\Program Files (x86)\\Dynamsoft\\Barcode Reader 6.3\\Components\\C_C++\\Lib\\DBRx64.lib"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                'E:\\Program Files (x86)\\Dynamsoft\\Barcode Reader 6.3\\Components\\C_C++\\Redist\\x64\\'
                            ]
                        }
                    ]
                }],
                ['OS=="mac"', {
                    'defines': [
                        'MAC_DBR',
                    ],
                    'include_dirs': [
                        "./"
                    ],
                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L/mnt/g/nodejs"
                    ],
                    "ldflags": [
                        "-Wl,-rpath,'$$ORIGIN'"
                    ],
                    'copies': [
                        {
                            'destination': 'build/Release/',
                            'files': [
                                '/mnt/g/nodejs/libDynamsoftBarcodeReader.dylib'
                            ]
                        }
                    ]
                }]
            ]
        }
    ]
}
