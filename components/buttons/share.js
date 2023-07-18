import { useState, useEffect } from "react";

import Button from "@mui/material/Button";

import ShareModal from "@/components/modals/share";

const ShareButton = ({ entry_id, count, setError = () => {} }) => {
  const [open, setOpen] = useState(false);

  if (count) {
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Share ({count})
        </Button>
        <ShareModal
          open={open}
          setOpen={setOpen}
          entry_id={entry_id}
          setError={setError}
        />
      </>
    );
  } else return null;
};

export default ShareButton;
