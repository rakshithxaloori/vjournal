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
import { getTimeAgo } from "@/utils/time";

const THUMBNAIL_WIDTH = 300;
const ASPECT_RATIO = 16 / 9;
const VIDEOS_FETCH_COUNT = 10; // TODO

export default function Home({ session, videos, error }) {
  const router = useRouter();

  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState(error || "");

  const openEntry = (id) => {
    router.push(`/entry/${id}`);
  };

  return (
    <>
      <Head>
        <title>VJournal | Your personal video diary & journal</title>
        <meta
          name="description"
          content="Your personal video diary & journal"
        />
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
              <Typography
                variant="h5"
                component="h5"
                color="textSecondary"
                sx={{ mb: 1 }}
              >
                Your perosonal video diary & journal
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
          <Empty />
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

const Empty = () => {
  const router = useRouter();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Box>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Typography variant="h3" color="primary">
              How it works
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Hit record and talk about your day.
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Your entries are private and only you have the access.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/new")}
              sx={{ mt: 1 }}
            >
              Get Started
            </Button>
          </Grid>
          <Grid item xs={8}>
            <Box style={screenShotParentStyle}>
              <Image
                src="/newScreenshot.png"
                alt="Create Entry"
                fill
                style={{
                  borderRadius: "10px",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Box style={screenShotParentStyle}>
              <Image
                src="/entryScreenshot.png"
                alt="Watch My Entry"
                fill
                style={{
                  borderRadius: "10px",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography variant="h3" color="primary">
                What you get
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Watch your entry. Read the summary to get a quick recap of the
                day
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push("/new")}
                sx={{ mt: 1 }}
              >
                Create your first entry
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const screenShotParentStyle = {
  borderRadius: "10px",
  border: "1px solid #eaeaea",
  boxShadow: "0px 0px 10px 5px #fff",
  position: "relative",
  paddingTop: "56.25%", // Maintain aspect ratio
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
          style={{ borderRadius: "10px" }}
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
