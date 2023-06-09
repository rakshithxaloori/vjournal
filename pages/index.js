import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";

import Typography from "@mui/material/Typography";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { createServerAPIKit, networkError } from "@/utils/APIKit";

export default function Home({ videos }) {
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
        <Typography variant="h6" component="h6" color="primary">
          Videos {videos?.length}
        </Typography>
        {videos?.map((video) => (
          <Link key={video.id} href={`/journal/${video.id}`}>
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
