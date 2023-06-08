import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { createClientAPIKit, networkError, uploadToS3 } from "@/utils/APIKit";

const MIME_TYPE = "video/webm;codecs=vp9,opus";
const TIME_SLICE = 10 * 1000; // 10 seconds
const MAX_RECORD_TIME = 15 * 60 * 1000; // 15 minutes
const STREAM_STATUS = {
  IDLE: "idle",
  RECORDING: "recording",
  RECORDED: "recorded",
  INACTIVE: "inactive",
};

const VideoRecorder = ({ setError }) => {
  const { data: session } = useSession();
  const mediaRecorderRef = useRef(null);
  const previewRef = useRef(null);

  let localVideoChunks = useRef([]);

  const [permission, setPermission] = useState(false);
  const [streamStatus, setStreamStatus] = useState(STREAM_STATUS.INACTIVE);
  const [stream, setStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null); // recorded video blob
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    // Stop the recording if max recording time is reached
    if (localVideoChunks.current.length > MAX_RECORD_TIME / TIME_SLICE) {
      stopRecording();
    }
  }, [localVideoChunks.current.length]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stream]);

  const handleVisibilityChange = () => {
    if (streamStatus === STREAM_STATUS.RECORDING) return;

    if (document.visibilityState === "hidden") stopStream();
    else if (document.visibilityState === "visible") startStream();
  };

  const startStream = async () => {
    setRecordedVideoUrl(null);
    // get video and audio permissions and then stream the result media stream to the videoSrc variable
    if ("MediaRecorder" in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: true,
        };
        const audioConstraints = { audio: true };

        // create audio and video streams separately
        const audioStream = await navigator.mediaDevices.getUserMedia(
          audioConstraints
        );
        const videoStream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        );

        setPermission(true);

        //combine both audio and video streams
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);

        setStream(combinedStream);
        setStreamStatus(STREAM_STATUS.IDLE);

        //set videostream to live feed player
        previewRef.current.srcObject = videoStream;
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const stopStream = () => {
    if (stream === null) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    setPermission(false);
    setStreamStatus(STREAM_STATUS.INACTIVE);
    if (previewRef.current) previewRef.current.srcObject = null;
  };

  const startRecording = async () => {
    setStreamStatus(STREAM_STATUS.RECORDING);

    const media = new MediaRecorder(stream, { mimeType: MIME_TYPE });
    mediaRecorderRef.current = media;
    mediaRecorderRef.current.start(TIME_SLICE);

    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
  };

  const stopRecording = () => {
    setStreamStatus(STREAM_STATUS.RECORDED);

    if (localVideoChunks.current.length === 0) {
      mediaRecorderRef.current.requestData();
    }
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = () => {
      const videoBlob = new Blob(localVideoChunks.current, {
        type: MIME_TYPE,
        lastModified: Date.now(),
        name: "video.webm", // TODO
      });
      const videoUrl = URL.createObjectURL(videoBlob);

      setRecordedBlob(videoBlob);
      setRecordedVideoUrl(videoUrl);
      localVideoChunks.current = [];

      mediaRecorderRef.current.removeEventListener(
        "dataavailable",
        handleDataAvailable
      );
    };
  };

  const handleDataAvailable = (event) => {
    if (typeof event.data === "undefined") return;
    if (event.data.size === 0) return;
    localVideoChunks.current.push(event.data);
  };

  const upload = async () => {
    try {
      const APIKit = await createClientAPIKit(session?.token_key);
      const response = await APIKit.post("/api/video/upload/", {
        file_size: recordedBlob.size,
      });
      const { s3_urls, video_id } = response.data.payload;
      const { video, thumbnail } = s3_urls;
      await uploadToS3(
        recordedBlob,
        video,
        (progress) => {
          console.log(progress);
          setUploadProgress(progress.progress * 100);
        },
        () => {
          console.log("done");
          // TODO make API request to update video status to "uploaded"
        },
        (error) => {
          {
            console.log(error);
          }
        }
      );
    } catch (e) {
      setError(networkError(e));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="h4" color="primary">
          Progress {uploadProgress}%
        </Typography>
        {!recordedVideoUrl ? (
          <video ref={previewRef} autoPlay style={videoStyle}></video>
        ) : null}
        {recordedVideoUrl ? (
          <>
            <video
              src={recordedVideoUrl}
              autoPlay
              loop
              style={videoStyle}
            ></video>
            {/* <a download href={recordedVideoUrl}>
              Download Recording
            </a> */}
          </>
        ) : null}
      </Box>
      <Box>
        {permission ? (
          streamStatus === STREAM_STATUS.IDLE ? (
            <Button onClick={startRecording} variant="contained">
              Start Recording
            </Button>
          ) : streamStatus === STREAM_STATUS.RECORDING ? (
            <Button onClick={stopRecording} variant="contained">
              Stop Recording
            </Button>
          ) : streamStatus === STREAM_STATUS.RECORDED ? (
            <Button onClick={upload} variant="contained">
              Upload
            </Button>
          ) : null
        ) : (
          <Button onClick={startStream} variant="contained">
            Get Camera
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default VideoRecorder;

const videoStyle = {
  transform: "scaleX(-1)",
  height: "70vh",
  aspectRatio: "16/9",
  objectFit: "cover",
  borderRadius: "20px",
};
