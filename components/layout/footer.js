import Link from "next/link";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { linkStyle } from "@/utils/styles";
import { RAKSHITH_TWITTER_LINK } from "@/utils/links";

const Footer = () => {
  return (
    <Box
      sx={{
        padding: 3,
        // width: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        columnGap: 2,
      }}
    >
      <Link
        href="/privacy-policy"
        style={linkStyle}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Typography component="span" color="primary">
          Privacy Policy
        </Typography>
      </Link>
      <Link
        href="/terms"
        style={linkStyle}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Typography component="span" color="primary">
          Terms
        </Typography>
      </Link>
      <Link
        href="/support"
        style={linkStyle}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Typography component="span" color="primary">
          Support
        </Typography>
      </Link>
      <Box sx={{ flexGrow: 1 }} />
      <Typography component="span" sx={{ fontSize: 12, color: "white" }}>
        Made by
        <Link
          href={RAKSHITH_TWITTER_LINK}
          style={{ textDecoration: "none" }}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Typography component="span" color="primary" sx={{ fontSize: 12 }}>
            {" "}
            Rakshith
          </Typography>
        </Link>
      </Typography>
      <Typography component="span" color="primary" sx={{ fontSize: 12 }}>
        © {new Date().getFullYear()} JuntoX
      </Typography>
    </Box>
  );
};

export default Footer;
