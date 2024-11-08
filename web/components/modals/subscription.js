import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

// import { getTimeAgo } from "@/utils/time";

const SubscriptionModal = ({
  is_beta,
  cancel_at_period_end,
  current_period_end,
}) => {
  let showModal = false;
  // Never subscribed
  if (!is_beta && current_period_end === 0) showModal = true;
  // Subscription expired
  if (
    !is_beta &&
    current_period_end !== 0 &&
    new Date(current_period_end * 1000) < new Date()
  )
    showModal = true;

  return (
    <Modal open={showModal}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" color="primary">
          Subscription Expired
        </Typography>
        <Typography sx={{ mt: 2 }} color="primary">
          Please renew your subscription to continue creating new entries.
        </Typography>
        <Button sx={{ mt: 2 }} variant="contained" href="/onboarding">
          Renew Subscription
        </Button>
      </Box>
    </Modal>
  );
};

export default SubscriptionModal;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#000",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};
