job_settings = {
    "OutputGroups": [
        {
            "Name": "DASH ISO",
            "OutputGroupSettings": {
                "Type": "DASH_ISO_GROUP_SETTINGS",
                "DashIsoGroupSettings": {
                    "SegmentLength": 30,
                    "FragmentLength": 2,
                },
            },
            "Outputs": [
                {
                    "VideoDescription": {
                        "Crop": {},
                        "CodecSettings": {
                            "Codec": "H_264",
                            "H264Settings": {
                                "RateControlMode": "QVBR",
                                "SceneChangeDetect": "TRANSITION_DETECTION",
                                "MaxBitrate": 10000000,
                                "QvbrSettings": {"QvbrQualityLevel": 8},
                                "FramerateControl": "SPECIFIED",
                                "FramerateNumerator": 30,
                                "FramerateDenominator": 1,
                            },
                        },
                    },
                    "ContainerSettings": {"Container": "MPD"},
                    "NameModifier": "_video",
                },
                {
                    "AudioDescriptions": [
                        {
                            "CodecSettings": {
                                "Codec": "AAC",
                                "AacSettings": {
                                    "Bitrate": 96000,
                                    "CodingMode": "CODING_MODE_2_0",
                                    "SampleRate": 48000,
                                },
                            },
                            "AudioSourceName": "Audio Selector 1",
                        }
                    ],
                    "ContainerSettings": {"Container": "MPD"},
                    "NameModifier": "_audio",
                },
            ],
            "CustomName": "DASH Group",
        },
        {
            "Name": "File Group",
            "OutputGroupSettings": {
                "Type": "FILE_GROUP_SETTINGS",
                "FileGroupSettings": {},
            },
            "Outputs": [
                {
                    "VideoDescription": {
                        "CodecSettings": {
                            "Codec": "FRAME_CAPTURE",
                            "FrameCaptureSettings": {
                                "MaxCaptures": 1,
                                "FramerateNumerator": 1,
                                "FramerateDenominator": 1,
                                "Quality": 95,
                            },
                        },
                        "Crop": {},
                    },
                    "ContainerSettings": {"Container": "RAW"},
                    "NameModifier": "_default",
                }
            ],
        },
    ],
    "TimecodeConfig": {"Source": "ZEROBASED"},
    "Inputs": [
        {
            "TimecodeSource": "ZEROBASED",
            "VideoSelector": {},
            "AudioSelectors": {"Audio Selector 1": {"DefaultSelection": "DEFAULT"}},
        }
    ],
}
