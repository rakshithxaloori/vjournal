import { useState, useEffect, useRef } from "react";

import { STREAM_STATUS } from "@/utils/stream";

const MIME_TYPE = "video/webm;codecs=vp9,opus";
const TIME_SLICE = 10 * 1000; // 10 seconds
const MAX_RECORD_TIME = 60 * 60 * 1000; // 60 minutes

const useRecorder = () => {
  const mediaRecorderRef = useRef(null);
  const previewRef = useRef(null);

  let localVideoChunks = useRef([]);

  const [permission, setPermission] = useState(false);
  const [streamStatus, setStreamStatus] = useState(STREAM_STATUS.INACTIVE);
  const [stream, setStream] = useState(null);

  const [recordedBlob, setRecordedBlob] = useState(null); // recorded video blob

  useEffect(() => {
    startStream();
  }, []);

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [stream]);

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
  }, [stream, streamStatus]);

  const handleVisibilityChange = () => {
    if (streamStatus === STREAM_STATUS.RECORDING) return;
    if (document.visibilityState === "hidden") stopStream();
    else if (document.visibilityState === "visible") startStream();
  };

  const startStream = async () => {
    if (stream !== null) return;
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

      setRecordedBlob(videoBlob);
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

  const cancelVideo = () => {
    setRecordedBlob(null);
    localVideoChunks.current = [];
    setStreamStatus(STREAM_STATUS.IDLE);
    stopStream();
    startStream();
  };

  return {
    permission,
    stream,
    streamStatus,
    previewRef,
    startRecording,
    stopRecording,
    recordedBlob,
    cancelVideo,
  };
};

export default useRecorder;
