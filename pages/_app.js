import { ThemeProvider } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";

import Layout from "@/components/layout";
import theme from "@/utils/theme";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <ThemeProvider theme={theme}>
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </ThemeProvider>
  );
}
