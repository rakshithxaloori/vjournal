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

const Entry = ({ video }) => {
  console.log(video);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [title, setTitle] = useState(video.title);
  const [summary, setSummary] = useState(video.summary || "");

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
        // const manifestUrl = await getManifestUrl(video);
        let manifestUrl = video.url;
        const query_params = video.query_params;
        let query_string = "";
        for (const [key, value] of Object.entries(query_params)) {
          query_string += `${key}=${value}&`;
        }
        // Remove the last ampersand
        query_string = query_string.slice(0, -1);

        manifestUrl += `?${query_string}`;

        const dashjs = await import("dashjs");
        playerRef.current = dashjs.MediaPlayer().create();

        // Initialize the player with new manifest
        playerRef.current.initialize(videoRef.current, manifestUrl, true);

        playerRef.current.extend("RequestModifier", () => {
          return {
            // modifyRequestHeader: (xhr) => {
            //   const signed_cookie = video.signed_cookie;
            //   let cookie_string = "";
            //   for (const [key, value] of Object.entries(signed_cookie)) {
            //     cookie_string += `${key}=${value}; `;
            //   }
            //   // Remove the last semicolon
            //   cookie_string = cookie_string.slice(0, -2);
            //   xhr.setRequestHeader("Cookie", cookie_string);
            //   return xhr;
            // },
            modifyRequestURL: function (url) {
              // Modify url adding a custom query string parameter
              return url + `?${query_string}`;
            },
          };
        });
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
