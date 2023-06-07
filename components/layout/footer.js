import Link from "next/link";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const RAKSHITH_TWITTER_LINK = "https://twitter.com/rakshithXaloori";

const linkStyle = {
  color: "#fff",
  fontSize: 14,
  marginRight: 30,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  textDecoration: "none",
};

const Footer = () => {
  return (
    <Box
      sx={{
        padding: 3,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Link
        href="/privacy-policy"
        style={linkStyle}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Typography component="span">Privacy Policy</Typography>
      </Link>
      <Link
        href="/terms"
        style={linkStyle}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Typography component="span">Terms</Typography>
      </Link>
      <Link
        href="/support"
        style={linkStyle}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Typography component="span">Support</Typography>
      </Link>
      <Box sx={{ flexGrow: 1 }} />
      <Typography component="span" sx={{ fontSize: 12, color: "white", mr: 3 }}>
        Made by
        <Link
          href={RAKSHITH_TWITTER_LINK}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Typography
            component="span"
            sx={{
              fontSize: 12,
              color: "white",
            }}
          >
            {" "}
            Rakshith
          </Typography>
        </Link>
      </Typography>
      <Typography component="span" sx={{ fontSize: 12, color: "white" }}>
        © 2023 JuntoX
      </Typography>
    </Box>
  );
};

export default Footer;
