import Head from "next/head";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Terms = () => {
  return (
    <>
      <Head>
        <title>Terms</title>
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
        <Box>
          <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
            Terms
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default Terms;
