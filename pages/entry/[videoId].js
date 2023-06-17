import { useRef, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import dynamic from "next/dynamic";

import { authOptions } from "pages/api/auth/[...nextauth]";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { createServerAPIKit, networkError } from "@/utils/APIKit";

const Entry = ({ video }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const loadDash = async () => {
      if (typeof window !== "undefined") {
        const manifestUrl = await getManifestUrl();

        const dashjs = await import("dashjs");
        const player = dashjs.MediaPlayer().create();

        // Initialize the player with new manifest
        player.initialize(videoRef.current, manifestUrl, true);

        player.on(dashjs.MediaPlayer.events.ERROR, (event) => {
          console.error("Error occurred:", event.error);
        });

        // player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, (event) => {
        //   console.log("Manifest loaded:", event);
        // });

        return () => {
          player.reset();
        };
      }
    };

    loadDash();
  }, []);

  const getManifestUrl = async () => {
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

  return (
    // TODO head - {username}'s entry on {date}
    <Box>
      <Typography variant="h4" component="h4" color="primary">
        Journal
      </Typography>
      <Typography variant="body1" color="primary">
        {video.title}
      </Typography>
      <video ref={videoRef} autoPlay controls />;
    </Box>
  );
};

// export default Entry;
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
