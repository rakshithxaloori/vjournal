import { useState, useEffect, useRef } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const MIME_TYPE = "video/webm;codecs=vp9,opus";
const TIME_SLICE = 10 * 1000; // 10 seconds
const MAX_RECORD_TIME = 15 * 60 * 1000; // 15 minutes
const STREAM_STATUS = {
  IDLE: "idle",
  RECORDING: "recording",
  INACTIVE: "inactive",
};

const VideoRecorder = () => {
  const mediaRecorderRef = useRef(null);
  const previewRef = useRef(null);

  const [permission, setPermission] = useState(false);
  const [streamStatus, setStreamStatus] = useState(STREAM_STATUS.IDLE);
  const [stream, setStream] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    // Stop the recording if max recording time is reached
    if (videoChunks.length > MAX_RECORD_TIME / TIME_SLICE) {
      stopRecording();
    }
  }, [videoChunks]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stream]);

  const handleVisibilityChange = () => {
    console.log("handleVisibilityChange", document.visibilityState);
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
        setStreamStatus(STREAM_STATUS.INACTIVE);

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
    console.log("stopStream", stream);
    if (stream === null) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
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
    setPermission(false);
    setStreamStatus(STREAM_STATUS.INACTIVE);

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: MIME_TYPE });
      const videoUrl = URL.createObjectURL(videoBlob);

      setRecordedVideoUrl(videoUrl);
      setVideoChunks([]);
      mediaRecorderRef.current.removeEventListener(
        "dataavailable",
        handleDataAvailable
      );
    };
  };

  let localVideoChunks = [];
  const handleDataAvailable = (event) => {
    if (typeof event.data === "undefined") return;
    if (event.data.size === 0) return;
    localVideoChunks.push(event.data);
    setVideoChunks(localVideoChunks);
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
        {!recordedVideoUrl ? (
          <video ref={previewRef} autoPlay style={videoStyle}></video>
        ) : null}
        {recordedVideoUrl ? (
          <Box>
            <video
              src={recordedVideoUrl}
              autoPlay
              loop
              style={videoStyle}
            ></video>
            <a download href={recordedVideoUrl}>
              Download Recording
            </a>
          </Box>
        ) : null}
      </Box>
      <Box>
        {permission ? (
          streamStatus === STREAM_STATUS.INACTIVE ? (
            <Button onClick={startRecording} variant="contained">
              Start Recording
            </Button>
          ) : streamStatus === STREAM_STATUS.RECORDING ? (
            <Button onClick={stopRecording} variant="contained">
              Stop Recording
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
