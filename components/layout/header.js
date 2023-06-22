import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { linkStyle } from "@/utils/styles";

const PICTURE_SIZE = 25;

const Header = () => {
  const { data: session, status } = useSession();

  const onSignin = (e) => {
    e.preventDefault();
    signIn("google", {
      callbackUrl: `${window.location.origin}/`,
    });
  };

  const onSignout = (e) => {
    e.preventDefault();
    signOut();
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Toolbar>
        <Link href="/" style={linkStyle}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
            VJournal
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          {status === "authenticated" && session && (
            <>
              <Link
                href="/auth/signout"
                onClick={onSignout}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" color="primary" sx={{ mr: 2 }}>
                  Sign Out
                </Typography>
                {session?.user?.picture && (
                  <Image
                    height={PICTURE_SIZE}
                    width={PICTURE_SIZE}
                    src={session?.user?.picture}
                    alt={session?.user?.username}
                    style={{ borderRadius: "50%" }}
                  />
                )}
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </Box>
  );
};

export default Header;
