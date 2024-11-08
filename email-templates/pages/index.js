import Head from "next/head";
import Link from "next/link";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Home() {
  return (
    <>
      <Head>
        <title>VJournal Email Templates</title>
        <meta
          name="description"
          content="Email templates used to send emails to users."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h3" component="h3" color="primary">
          VJournal Email Templates
        </Typography>
        <Link href="/new_entry">
          <Button variant="contained" color="primary">
            New Entry
          </Button>
        </Link>
      </Box>
    </>
  );
}
