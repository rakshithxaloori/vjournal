import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { createServerAPIKit, networkError } from "@/utils/APIKit";

export default function Home({ videos }) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>VJournal</title>
        <meta name="description" content="Personal video journaling app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Typography variant="h4" component="h4" color="primary">
          VJournal
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Typography variant="h6" component="h6" color="primary">
            Videos {videos?.length}
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
        {videos?.map((video) => (
          <Link key={video.id} href={`/entry/${video.id}`}>
            <Typography variant="body1" component="p" color="primary">
              {video.title}
            </Typography>
          </Link>
        ))}
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
          videos,
        },
      };
    } catch (e) {
      return { props: { error: networkError(e) } };
    }
  }
  return {
    props: {},
  };
};
