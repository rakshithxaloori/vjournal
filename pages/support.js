import Head from "next/head";
import Link from "next/link";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const Support = () => {
  return (
    <>
      <Head>
        <title>Support</title>
        <meta
          name="description"
          content="Your personal video diary & journal"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
            Support
          </Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
            If you have any questions or need help with VJournal, please contact
            us at:
          </Typography>
          <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
            <Link
              href="mailto:support@vjournal.me"
              rel="noopener noreferrer"
              target="_blank"
              style={{ color: "white" }}
            >
              support@vjournal.me
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default Support;
