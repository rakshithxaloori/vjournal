import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { linkStyle } from "@/utils/styles";

const PICTURE_SIZE = 25;

const Header = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSignin = (e) => {
    e.preventDefault();
    signIn("google", {
      callbackUrl: `${window.location.origin}/`,
    });
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
              <Button
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon sx={{ color: "white" }} />}
              >
                {session?.user?.picture && (
                  <Image
                    height={PICTURE_SIZE}
                    width={PICTURE_SIZE}
                    src={session?.user?.picture}
                    alt={session?.user?.username}
                    style={{ borderRadius: "50%" }}
                  />
                )}
              </Button>
              <Menu
                elevation={0}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                sx={{
                  "& .MuiPaper-root": {
                    minWidth: 180,
                    backgroundColor: "#424242",
                    boxShadow:
                      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
                    "& .MuiMenu-list": {
                      padding: "4px 0",
                    },
                  },
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    router.push("/account");
                    handleClose();
                  }}
                >
                  <AccountCircleRoundedIcon sx={{ mr: 1 }} />
                  Account
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    signOut();
                    handleClose();
                  }}
                >
                  <LogoutRoundedIcon sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </Menu>
              {/* <Link
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
              </Link> */}
            </>
          )}
        </Box>
      </Toolbar>
    </Box>
  );
};

export default Header;
