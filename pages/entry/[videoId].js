import Head from "next/head";
import { useRef, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import dynamic from "next/dynamic";

import { authOptions } from "pages/api/auth/[...nextauth]";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { createServerAPIKit, networkError } from "@/utils/APIKit";

const Entry = ({ video }) => {
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
    <>
      <Head>
        <title>
          {video?.title} | {getPrettyDate(video.created_at)}
        </title>
        <meta name="description" content="Personal video journaling app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "70vw",
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
              {getPrettyDate(video.created_at)}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {video.title}
            </Typography>
          </Box>
          <video ref={videoRef} autoPlay controls style={videoStyle} />
          {video.summary && (
            <Box
              sx={{
                width: "100%",
                mt: 2,
              }}
            >
              <Typography variant="body1" color="primary">
                Summary
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {video.summary}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
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
  width: "100%",
  height: "auto",
  aspectRatio: "16/9",
  borderRadius: "20px",
};

const getPrettyDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
