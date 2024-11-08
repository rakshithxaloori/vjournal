import { ThemeProvider } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

import Layout from "@/components/layout";
import theme from "@/utils/theme";

import { isMobile } from "react-device-detect";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import Empty from "@/components/homeEmpty";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShowMobile(true);
    }
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }} color="primary">
        VJournal is shut down. I&apos;m working on other projects.
      </Typography>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <SessionProvider session={session}>
        <Layout>
          {showMobile ? <Mobile /> : <Component {...pageProps} />}
        </Layout>
      </SessionProvider>
    </ThemeProvider>
  );
}

const Mobile = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* TODO show screenshots of how the tool works */}
      <Typography variant="h5" sx={{ mb: 1 }} color="primary">
        Sorry, we don&apos;t support mobile yet.
      </Typography>
      <Typography variant="body1" color="primary">
        Please use a desktop or a laptop browser to access VJournal.
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Empty />
    </Box>
  );
};
