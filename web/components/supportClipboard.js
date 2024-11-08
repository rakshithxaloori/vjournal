import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import FlashMessage from "@/components/flashMessage";

const EMAIL_ADDRESS = "rakshith@vjournal.me";

const SupportClipboard = ({ children }) => {
  const [message, setMessage] = useState("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(EMAIL_ADDRESS);
    setMessage("Copied to clipboard!");
  };

  return (
    <Box sx={{ gap: 1 }}>
      {children}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
          borderRadius: 1,
          cursor: "pointer",
          backgroundColor: "background.paper",
          width: "fit-content",
          px: 1,
        }}
        onClick={copyToClipboard}
      >
        <Typography variant="body1" color="primary">
          {EMAIL_ADDRESS}
        </Typography>
        <ContentCopyIcon color="primary" sx={{ fontSize: 18 }} />
        <FlashMessage message={message} setMessage={setMessage} />
      </Box>
    </Box>
  );
};

export default SupportClipboard;
