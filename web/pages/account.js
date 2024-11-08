import Head from "next/head";
import { getServerSession } from "next-auth/next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { authOptions } from "pages/api/auth/[...nextauth]";

import { createServerAPIKit, networkError } from "@/utils/APIKit";
import Subscription from "@/components/subscription";

const Account = ({ name, email, subscription }) => {
  return (
    <>
      <Head>
        <title>Account | VJournal</title>
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
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "50vw",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <Typography variant="h4" color="primary" sx={headerStyle}>
              Account
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="body1" color="primary">
                {name}
              </Typography>
              <Typography variant="body1" color="primary">
                {email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <Typography variant="h4" color="primary" sx={headerStyle}>
              Subscription
            </Typography>
            <Subscription {...subscription} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Account;

const headerStyle = {
  mb: 1,
  textDecoration: "underline",
};

export const getServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }
  if (session?.token_key) {
    try {
      const APIKit = await createServerAPIKit(session.token_key);
      const response = await APIKit.get("/account/get/");
      const { name, email, subscription } = response.data.payload;
      return {
        props: {
          name,
          email,
          subscription,
        },
      };
    } catch (e) {
      return {
        props: { error: networkError(e) },
      };
    }
  }
};
