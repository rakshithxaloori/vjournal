import Image from "next/image";
import { useRouter } from "next/router";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Empty = () => {
  const router = useRouter();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={4} lg={4}>
            <Typography variant="h3" color="primary">
              How it works
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Hit record and talk about your day.
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Your entries are private and only you have the access.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/new")}
              sx={{ mt: 1 }}
            >
              Get Started
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={8}>
            <Box style={screenShotParentStyle}>
              <Image
                src="/newScreenshot.png"
                alt="Create Entry"
                fill
                style={{
                  borderRadius: "10px",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={8} lg={8}>
            <Box style={screenShotParentStyle}>
              <Image
                src="/entryScreenshot.png"
                alt="Watch My Entry"
                fill
                style={{
                  borderRadius: "10px",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={4} lg={4}>
            <Box>
              <Typography variant="h3" color="primary">
                What you get
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Watch your entry. Read the summary to get a quick recap of the
                day
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push("/new")}
                sx={{ mt: 1 }}
              >
                Create your first entry
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Empty;

const screenShotParentStyle = {
  borderRadius: "10px",
  border: "1px solid #eaeaea",
  boxShadow: "0px 0px 10px 5px #fff",
  position: "relative",
  paddingTop: "56.25%", // Maintain aspect ratio
};
