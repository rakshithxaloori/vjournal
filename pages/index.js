import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { createServerAPIKit, networkError } from "@/utils/APIKit";
import { ENTRY_STATUS } from "@/utils/codes";
import FlashMessage from "@/components/flashMessage";

const THUMBNAIL_WIDTH = 300;
const ASPECT_RATIO = 16 / 9;
const VIDEOS_FETCH_COUNT = 10;

export default function Home({ session, videos }) {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");

  const openEntry = (id) => {
    router.push(`/entry/${id}`);
  };

  return (
    <>
      <Head>
        <title>VJournal</title>
        <meta name="description" content="Personal video journaling app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {videos && videos?.length > 0 ? (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h6" color="primary">
                Journal Entries: {index * VIDEOS_FETCH_COUNT + 1} -{" "}
                {Math.min(
                  index * VIDEOS_FETCH_COUNT + VIDEOS_FETCH_COUNT,
                  videos?.length
                )}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push("/new")}
              >
                New Entry
              </Button>
            </Box>
            <Grid container spacing={2}>
              {videos?.map((video) => (
                <Grid key={video.id} item xs={12} sm={6} md={4} lg={3}>
                  <Entry
                    video={video}
                    openEntry={openEntry}
                    setMessage={setMessage}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 1.5,
              mt: 10,
            }}
          >
            <Box
              sx={{
                bgcolor: "grey.400",
                borderRadius: "10px",
                width: THUMBNAIL_WIDTH,
                height: THUMBNAIL_WIDTH / ASPECT_RATIO,
              }}
            ></Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <Typography variant="h6" component="h6" color="primary">
                Create your first journal entry!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push("/new")}
              >
                New Entry
              </Button>
            </Box>
          </Box>
        )}
        <FlashMessage message={message} setMessage={setMessage} />
      </main>
    </>
  );
}

export const getServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.token_key) {
    try {
      const APIKit = await createServerAPIKit(session.token_key);
      // APIKit.get("/authentication/open/"); // Don't have to wait for this
      const response = await APIKit.post("/video/list/", { index: 0 });
      const { videos } = response.data.payload;
      return {
        props: {
          session,
          videos,
        },
      };
    } catch (e) {
      return { props: { error: networkError(e) } };
    }
  }
  return {
    props: {
      session,
    },
  };
};

const Entry = ({ video, openEntry, setMessage }) => {
  return (
    <Box
      onClick={() => {
        if (video.status === ENTRY_STATUS.READY) openEntry(video.id);
        else setMessage("Video is still processing...");
      }}
      sx={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: `${THUMBNAIL_WIDTH}px`,
      }}
    >
      {video?.thumbnail_url && video?.status === ENTRY_STATUS.READY ? (
        <Image
          src={video?.thumbnail_url}
          alt={video.title}
          priority={true}
          width={THUMBNAIL_WIDTH}
          height={THUMBNAIL_WIDTH / ASPECT_RATIO}
          style={{ borderRadius: "10px", width: "auto", height: "auto" }}
        />
      ) : (
        <Box
          sx={{
            bgcolor: "grey.300",
            borderRadius: "10px",
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_WIDTH / ASPECT_RATIO,
          }}
        ></Box>
      )}
      <Typography
        variant="body1"
        component="p"
        color="primary"
        sx={{
          // Make it two lines and hide the rest
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {video.title}
      </Typography>
      <Typography variant="body2" component="p" color="textSecondary">
        {getTimeAgo(video.created_at)}
      </Typography>
    </Box>
  );
};

const getTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 24) {
    return `${Math.floor(hours / 24)} days ago`;
  }
  if (hours > 0) {
    return `${hours} hours ago`;
  }
  if (minutes > 0) {
    return `${minutes} minutes ago`;
  }
  return `${seconds} seconds ago`;
};
