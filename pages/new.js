import dynamic from "next/dynamic";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const WebcamRecorder = dynamic(() => import("@/components/recorder"), {
  ssr: false,
});

const New = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Typography variant="h4" component="h4" color="primary">
        Webcam Recorder
      </Typography>
      <WebcamRecorder />
    </Box>
  );
};

export default New;
