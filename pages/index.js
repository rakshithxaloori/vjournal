import Head from "next/head";

import Typography from "@mui/material/Typography";

export default function Home() {
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
      </main>
    </>
  );
}
