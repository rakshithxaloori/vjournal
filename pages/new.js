import { useState } from "react";
import dynamic from "next/dynamic";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const WebcamRecorder = dynamic(() => import("@/components/recorder"), {
  ssr: false,
});

const New = () => {
  const [error, setError] = useState("");
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
      <WebcamRecorder setError={setError} />
    </Box>
  );
};

export default New;
