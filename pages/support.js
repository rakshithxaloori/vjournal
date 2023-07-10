import Head from "next/head";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import SupportClipboard from "@/components/supportClipboard";

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
          <SupportClipboard>
            <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
              If you have any questions or need help with VJournal, please
              contact us at:
            </Typography>
          </SupportClipboard>
        </Grid>
      </Grid>
    </>
  );
};

export default Support;
