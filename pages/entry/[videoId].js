import { useRef, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import dynamic from "next/dynamic";

import { authOptions } from "pages/api/auth/[...nextauth]";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { createServerAPIKit, networkError } from "@/utils/APIKit";

const Entry = ({ video }) => {
  console.log(video);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const loadDash = async () => {
      if (typeof window !== "undefined") {
        const manifestUrl = await getManifestUrl(video);

        const dashjs = await import("dashjs");
        playerRef.current = dashjs.MediaPlayer().create();

        // Initialize the player with new manifest
        playerRef.current.initialize(videoRef.current, manifestUrl, true);
      }
    };

    loadDash();
    return () => {
      if (playerRef.current) playerRef.current.reset();
    };
  }, []);

  return (
    // TODO head - {username}'s entry on {date}
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <Typography variant="h4" component="h4" color="primary">
        Journal
      </Typography>
      <Typography variant="body1" color="primary">
        {video.title}
      </Typography>
      <video ref={videoRef} autoPlay controls style={videoStyle} />
    </Box>
  );
};

export default dynamic(() => Promise.resolve(Entry), {
  ssr: false,
});

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  } else {
    const { videoId } = context.query;
    if (videoId) {
      try {
        const APIKit = await createServerAPIKit(session.token_key);
        const response = await APIKit.post("/video/detail/", {
          video_id: videoId,
        });
        if (response.status === 200) {
          const { video } = response.data.payload;
          return { props: { video } };
        }
      } catch (e) {
        return { props: { error: networkError(e) } };
      }
    } else
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
  }
}

const videoStyle = {
  // height: "70vh",
  // width: "auto",
  width: "100%",
  height: "auto",
  aspectRatio: "16/9",
  borderRadius: "20px",
};

const getManifestUrl = async (video) => {
  let manifestUrl = video.urls.mpd;
  let videoUrl = video.urls.video;
  let audioUrl = video.urls.audio;

  const response = await fetch(manifestUrl);
  const manifest = await response.text();

  // Replace & with &amp;
  videoUrl = videoUrl.replace(/&/g, "&amp;");
  audioUrl = audioUrl.replace(/&/g, "&amp;");

  // Replace the video and audio URLs with the ones we got from the server
  const newManifest = manifest
    .replace(
      /<BaseURL>.*_video.mp4<\/BaseURL>/,
      `<BaseURL>${videoUrl}</BaseURL>`
    )
    .replace(
      /<BaseURL>.*_audio.mp4<\/BaseURL>/,
      `<BaseURL>${audioUrl}</BaseURL>`
    );

  // Load new manifest into a new URL
  const blob = new Blob([newManifest], { type: "application/dash+xml" });
  manifestUrl = URL.createObjectURL(blob);
  return manifestUrl;
};
