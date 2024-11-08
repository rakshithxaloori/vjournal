import Head from "next/head";
import { useRef, useEffect, useState } from "react";
import { getServerSession } from "next-auth/next";
import dynamic from "next/dynamic";

import { authOptions } from "pages/api/auth/[...nextauth]";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

import {
  createServerAPIKit,
  createClientAPIKit,
  networkError,
} from "@/utils/APIKit";
import FlashMessage from "@/components/flashMessage";
import ShareButton from "@/components/buttons/share";

const Entry = ({ video }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [title, setTitle] = useState(video?.title || "");
  const [summary, setSummary] = useState(video?.summary || "");

  const [isEditTitle, setIsEditTitle] = useState(false);
  const [isEditSummary, setIsEditSummary] = useState(false);

  const [message, setMessage] = useState("");

  const handleChangeTitle = (e) => {
    setTitle(e.target.value);
  };

  const handleChangeSummary = (e) => {
    // Replace multiple newlines with one
    e.target.value = e.target.value.replace(/(\r\n|\n|\r){2,}/g, "$1\n");
    setSummary(e.target.value);
  };

  const onKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      e.target.blur();

      // Save the title and summary
      try {
        const APIKit = await createClientAPIKit();
        const res = await APIKit.post(`/api/video/update/`, {
          video_id: video.id,
          title,
          summary,
        });
      } catch (e) {
        setMessage(networkError(e));
      }
    }
  };

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

    if (video) loadDash();
    return () => {
      if (playerRef.current) playerRef.current.reset();
    };
  }, []);

  if (!video) return null;

  return (
    <>
      <Head>
        <title>
          {title} | {getPrettyDate(video.created_at)}
        </title>
        <meta
          name="description"
          content="Your personal video diary & journal"
        />
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {isEditTitle ? (
                <TextField
                  id="title"
                  label="Title"
                  variant="filled"
                  value={title}
                  onChange={handleChangeTitle}
                  onBlur={() => setIsEditTitle(false)}
                  onKeyDown={onKeyDown}
                  sx={{ width: "100%" }}
                  helperText="Press Enter to save"
                />
              ) : (
                <Typography
                  variant="h6"
                  color="textSecondary"
                  onClick={() => setIsEditTitle(true)}
                >
                  {title}
                </Typography>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <ShareButton
                entry_id={video.id}
                count={video.share_count}
                setError={setMessage}
              />
            </Box>
          </Box>
          <video ref={videoRef} autoPlay controls style={videoStyle} />
          {summary && (
            <Box
              sx={{
                width: "100%",
                mt: 2,
              }}
            >
              {isEditSummary ? (
                <TextField
                  id="summary"
                  label="Summary"
                  variant="filled"
                  value={summary}
                  onChange={handleChangeSummary}
                  onBlur={() => setIsEditSummary(false)}
                  onKeyDown={onKeyDown}
                  multiline
                  sx={{ width: "100%" }}
                  helperText="Press Enter to save"
                />
              ) : (
                <>
                  <Typography variant="body1" color="primary">
                    Summary
                  </Typography>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    onClick={() => setIsEditSummary(true)}
                  >
                    {summary}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>
        <FlashMessage message={message} setMessage={setMessage} />
      </Box>
    </>
  );
};

export default dynamic(() => Promise.resolve(Entry), {
  ssr: false,
});

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const { videoId } = context.query;
  if (!session) {
    if (videoId)
      return {
        redirect: {
          destination: `/auth/signin?next=/entry/${videoId}`,
          permanent: false,
        },
      };
    else {
      return {
        redirect: {
          destination: "/auth/signin",
          permanent: false,
        },
      };
    }
  } else {
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
          destination: "/auth/signin",
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
  let manifestUrl = video.url;
  const mpd_path = ".mpd";

  const query_params = video.access.query_params;
  let query_string = "";
  for (const [key, value] of Object.entries(query_params)) {
    query_string += `${key}=${value}&`;
  }
  // Remove the last ampersand
  query_string = query_string.slice(0, -1);

  manifestUrl += `?${query_string}`;

  const response = await fetch(manifestUrl);
  const manifest = await response.text();

  let videoPath = "_video.mp4";
  let audioPath = "_audio.mp4";

  // Add the query string to the video and audio URLs
  videoPath += `?${query_string}`;
  audioPath += `?${query_string}`;

  // Replace & with &amp;
  videoPath = videoPath.replace(/&/g, "&amp;");
  audioPath = audioPath.replace(/&/g, "&amp;");

  const baseUrl = video.url.slice(0, video.url.indexOf(mpd_path));
  const videoUrl = baseUrl + videoPath;
  const audioUrl = baseUrl + audioPath;

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
