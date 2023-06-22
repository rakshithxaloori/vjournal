import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { authOptions } from "pages/api/auth/[...nextauth]";
import useRecorder from "@/utils/hooks/useRecorder";
import { createClientAPIKit, networkError, uploadToS3 } from "@/utils/APIKit";
import { STREAM_STATUS } from "@/utils/stream";
import FlashMessage from "@/components/flashMessage";

const New = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    permission,
    stream,
    streamStatus,
    previewRef,
    startRecording,
    stopRecording,
    recordedBlob,
    cancelVideo,
  } = useRecorder();

  const [videoHeight, setVideoHeight] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (recordedBlob) {
      const videoUrl = URL.createObjectURL(recordedBlob);
      setRecordedVideoUrl(videoUrl);
    }
  }, [recordedBlob]);

  const afterStartRecording = () => {
    const videoTrack = stream.getVideoTracks()[0];
    const { height, width } = videoTrack.getSettings();
    setVideoHeight(height);
    setVideoWidth(width);
  };

  const upload = async () => {
    if (!recordedBlob) return;
    try {
      setDisabled(true);
      const APIKit = await createClientAPIKit(session?.token_key);
      const response = await APIKit.post("/api/video/upload/", {
        file_size: recordedBlob.size,
        video_height: videoHeight,
        video_width: videoWidth,
      });
      const { s3_urls, video_id } = response.data.payload;
      const { video, thumbnail } = s3_urls;
      await uploadToS3(
        recordedBlob,
        video,
        (progress) => {
          setUploadProgress(progress.progress * 100);
        },
        async () => {
          await APIKit.post("/api/video/process/", {
            video_id,
          });
          router.push("/");
        },
        (error) => setMessage(error)
      );
    } catch (e) {
      setMessage(networkError(e));
      setDisabled(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Box>
        <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
          Talk about your day
        </Typography>
        {!recordedVideoUrl ? (
          <video ref={previewRef} autoPlay style={videoStyle}></video>
        ) : null}
        {recordedVideoUrl ? (
          <video
            src={recordedVideoUrl}
            autoPlay
            loop
            style={videoStyle}
          ></video>
        ) : null}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", mt: 2, gap: 2 }}>
        {permission ? (
          streamStatus === STREAM_STATUS.IDLE ? (
            <Button
              onClick={() => {
                startRecording();
                afterStartRecording();
              }}
              variant="contained"
            >
              Start Recording
            </Button>
          ) : streamStatus === STREAM_STATUS.RECORDING ? (
            <Button onClick={stopRecording} variant="contained">
              Stop Recording
            </Button>
          ) : streamStatus === STREAM_STATUS.RECORDED ? (
            <>
              <Button onClick={upload} variant="contained">
                {disabled
                  ? `Uploading ${uploadProgress.toFixed(0)}%...`
                  : "Upload"}
              </Button>
              <Button
                onClick={() => {
                  cancelVideo();
                  URL.revokeObjectURL(recordedVideoUrl);
                  setRecordedVideoUrl(null);
                }}
                variant="contained"
              >
                Cancel
              </Button>
            </>
          ) : null
        ) : (
          <Button
            onClick={() => {
              // TODO: get camera permission
            }}
            variant="contained"
          >
            Get Camera
          </Button>
        )}
      </Box>
      <FlashMessage message={message} setMessage={setMessage} />
    </Box>
  );
};

export default dynamic(() => Promise.resolve(New), {
  ssr: false,
});

export const getServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }
  if (session?.token_key) {
    return {
      props: {},
    };
  }
};

const videoStyle = {
  transform: "scaleX(-1)",
  height: "70vh",
  aspectRatio: "16/9",
  objectFit: "cover",
  borderRadius: "20px",
};
