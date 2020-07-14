{
    "targets": [
        {
            'target_name': "dbr",
            'sources': ["src/dbr.cc"],
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
                        "-lDynamsoftBarcodeReader", "-L./platforms/linux"
                    ],
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
                                './platforms/windows/**.*'
                            ]
                        }
                    ]
                }],
                ['OS=="mac"', {
                    'defines': [
                        'MAC_DBR',
                    ],
                    'libraries': [
                        "-lDynamsoftBarcodeReader", "-L./platforms/macos"
                    ]
                }]
            ]
        }
    ]
}
