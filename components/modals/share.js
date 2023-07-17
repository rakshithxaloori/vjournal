import { useState, useEffect } from "react";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { createClientAPIKit, networkError } from "@/utils/APIKit";

const ShareModal = ({ open, setOpen, entry_id, setError }) => {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [shareList, setShareList] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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
    // Check if duplicate
    const emails = shareList.map((share) => share.email);
    if (emails.includes(email)) {
      setError("This email is already in the list.");
      return;
    }

    // Add the share
    setDisabled(true);
    try {
      setError("Adding to share list...");
      const APIKit = await createClientAPIKit();
      const response = await APIKit.post("/api/share/create/", {
        video_id: entry_id,
        contact_fullname: name,
        contact_email: email,
      });
      if (response.status === 200) {
        const { share } = response.data.payload;
        setShareList([...shareList, share]);
        setError("Added!");
        setName("");
        setEmail("");
      }
    } catch (e) {
      setError(networkError(e));
    } finally {
      setDisabled(false);
    }
  };

  const handleRemove = async (share_id) => {
    setDisabled(true);
    try {
      setError("Removing from share list...");
      const APIKit = await createClientAPIKit();
      const response = await APIKit.post("/api/share/delete/", {
        share_id,
      });
      if (response.status === 200) {
        setShareList(shareList.filter((s) => s.id !== share_id));
        setError("Removed!");
      }
    } catch (e) {
      setError(networkError(e));
    } finally {
      setDisabled(false);
    }
  };

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
            gap: 2,
            my: 2,
          }}
        >
          <TextField
            id="name"
            label="Name"
            variant="outlined"
            value={name}
            onChange={onChangeName}
            sx={{ flex: 2 }}
          />
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            value={email}
            onChange={onChangeEmail}
            sx={{ flex: 6 }}
          />
          <Button variant="contained" sx={{ flex: 2 }} onClick={handleAdd}>
            Add
          </Button>
        </Box>

        {shareList.length > 0 ? (
          <Box>
            <Typography variant="h6" color="primary">
              Shared with
            </Typography>
            {shareList.map((share) => (
              // TODO use material ui list for scrollable. Also test it
              <Box
                key={share.id}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  my: 1,
                }}
              >
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ flex: 2 }}
                >
                  {share.contact.name}
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ flex: 6 }}
                >
                  {share.contact.email}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ flex: 2 }}
                  onClick={() => handleRemove(share.id)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No one else has access to this entry yet.
          </Typography>
        )}

        <Box
          sx={{ display: "flex", flexDirection: "row", width: "100%", gap: 2 }}
        >
          <Box sx={{ flex: 9 }} />
          <Button
            sx={{ flex: 1 }}
            variant="contained"
            onClick={() => setOpen(false)}
            disabled={disabled}
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
