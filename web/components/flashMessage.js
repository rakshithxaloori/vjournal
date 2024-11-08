import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";

const FlashMessage = ({ message, setMessage }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (message !== "") setOpen(true);
  }, [message]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    setMessage("");
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      message={message}
    />
  );
};

export default FlashMessage;
