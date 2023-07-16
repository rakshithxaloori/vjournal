import { useState, useEffect } from "react";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { createClientAPIKit, networkError } from "@/utils/APIKit";

const ShareModal = ({ open, setOpen, entry_id, setError }) => {
  const [loading, setLoading] = useState(false);
  const [shareList, setShareList] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const onChangeName = (e) => {
    setName(e.target.value);
  };

  const onChangeEmail = (e) => {
    // Validate email
    const re = /\S+@\S+\.\S+/;
    setEmail(e.target.value);
  };

  const handleAdd = async () => {
    if (!name) {
      setError("Please enter a name");
      return;
    }
    if (!email) {
      setError("Please enter an email");
      return;
    }
    // Only alphabets and spaces allowed in name
    if (!name.match(/^[a-zA-Z ]+$/)) {
      setError("Only alphabets and spaces allowed in name.");
      return;
    }
    // Validate email
    const re_email = /\S+@\S+\.\S+/;
    if (!re_email.test(email)) {
      setError("Invalid email.");
      return;
    }
  };

  useEffect(() => {
    const fetchShareList = async () => {
      if (open) {
        // Fetch the entry share list
        setLoading(true);
        try {
          const APIKit = await createClientAPIKit();
          const response = await APIKit.post("/api/share/list/", {
            video_id: entry_id,
          });
          const { shares } = response.data?.payload;
          setShareList(shares);
          console.log("Share list", shares);
        } catch (e) {
          setError(networkError);
        } finally {
          setLoading(false);
        }
      } else {
        // Reset the entry share list
        setLoading(false);
        setShareList([]);
      }
    };
    fetchShareList();
  }, [open]);
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box sx={style}>
        <Typography variant="h4" color="primary">
          Share entry
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Only you and the people you share it with can see this entry.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            my: 2,
          }}
        >
          <TextField
            id="name"
            label="Name"
            variant="outlined"
            value={name}
            onChange={onChangeName}
            sx={{ width: "20%" }}
          />
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            value={email}
            onChange={onChangeEmail}
            sx={{ width: "60%" }}
          />
          <Button
            variant="contained"
            sx={{ ml: 2, flexGrow: 1 }}
            onClick={handleAdd}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ShareModal;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  bgcolor: "#000",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};
