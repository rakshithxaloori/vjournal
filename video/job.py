job_settings = {
    "Inputs": [
        {
            "TimecodeSource": "ZEROBASED",
            "VideoSelector": {"Rotate": "AUTO"},
            "AudioSelectors": {"Audio Selector 1": {"DefaultSelection": "DEFAULT"}},
        }
    ],
    "OutputGroups": [
        {
            "Name": "HLS Group",  # Update the output group name
            "OutputGroupSettings": {
                "Type": "HLS_GROUP_SETTINGS",  # Use HLS_GROUP_SETTINGS
                "HlsGroupSettings": {
                    "ManifestDurationFormat": "INTEGER",
                    "SegmentLength": 10,
                    "TimedMetadataId3Period": 10,
                    "CaptionLanguageSetting": "OMIT",
                    "Destination": {
                        "DestinationRefId": "destination",
                        "S3Settings": {
                            "OutputS3BucketName": "",  # TODO
                            "OutputS3KeyPrefix": "",  # TODO
                            "Region": "",  # TODO
                        },
                    },
                },
            },
            "Outputs": [
                {
                    "VideoDescription": {
                        "Width": 1280,
                        "Height": 720,
                        "ScalingBehavior": "DEFAULT",
                        "CodecSettings": {
                            "Codec": "H_264",
                            "H264Settings": {
                                "RateControlMode": "QVBR",
                                "SceneChangeDetect": "TRANSITION_DETECTION",
                                "MaxBitrate": 10 * 1000 * 1000,  # 10Mbps
                                "QvbrSettings": {"QvbrQualityLevel": 8},
                            },
                        },
                    },
                    "AudioDescriptions": [
                        {
                            "CodecSettings": {
                                "Codec": "AAC",
                                "AacSettings": {
                                    "Bitrate": 128 * 1000,  # 128kbps
                                    "CodingMode": "CODING_MODE_2_0",
                                    "SampleRate": 48 * 1000,  # 48kHz
                                },
                            }
                        }
                    ],
                    "ContainerSettings": {
                        "Container": "HLS",
                        "HlsSettings": {},
                    },  # Update to HLS format
                }
            ],
        }
    ],
    "TimecodeConfig": {"Source": "ZEROBASED"},
}
