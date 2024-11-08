import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { authOptions } from "pages/api/auth/[...nextauth]";
import Link from "next/link";

const SignIn = ({ next }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        mt: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <Typography variant="h4" component="h4" color="primary">
          Welcome to VJournal!
        </Typography>
        <Typography variant="h6" component="h6" color="textSecondary">
          Sign in to start creating daily video journal entries
        </Typography>
        <Typography variant="body2" component="p" color="textSecondary">
          By signing in you agree to our{" "}
          <Link href="/terms" style={linkStyle}>
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" style={linkStyle}>
            privacy policy
          </Link>
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            signIn("google", {
              callbackUrl: `${window.location.origin}/${next || ""}`,
            })
          }
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.token_key) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  } else {
    const { next } = context.query;
    return {
      props: {
        next,
      },
    };
  }
};
export default SignIn;

const linkStyle = {
  color: "inherit",
};
