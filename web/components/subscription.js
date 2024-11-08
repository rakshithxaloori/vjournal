import Link from "next/link";
import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { RAKSHITH_TWITTER_LINK } from "@/utils/links";

const Subscription = ({
  email,
  is_beta,
  cancel_at_period_end,
  current_period_end,
  showCreateEntry = false,
}) => {
  const showManageSubscription = current_period_end !== 0;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          minWidth: "50vw",
          height: "fit-content",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {is_beta && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              mb: 2,
            }}
          >
            <Box
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "row",
                gap: 1,
              }}
            >
              <CheckCircleIcon sx={{ color: "green" }} />
              <Typography
                variant="body1"
                color="green"
                sx={{ maxWidth: "50vw" }}
              >
                You have premium access and can use all the features for free.
                Paying the subscription is optional. (Thank{" "}
                <Link
                  href={RAKSHITH_TWITTER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography
                    sx={{ color: "green", textDecoration: "underline" }}
                    display="inline"
                  >
                    Rakshith
                  </Typography>
                </Link>
                !)
              </Typography>
            </Box>
            {showCreateEntry && (
              <Button variant="contained" color="primary" href="/new">
                Create new entry
              </Button>
            )}
          </Box>
        )}
        <Box
          sx={{
            p: 6,
            display: "flex",
            flexDirection: "column",
            borderWidth: 1,
            borderColor: "primary.main",
            borderStyle: "solid",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            sx={{ mb: 1 }}
          >
            Basic
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h3" color="primary">
              $3
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
              <Typography variant="body2" color="primary">
                per
              </Typography>
              <Typography variant="body2" color="primary">
                month
              </Typography>
            </Box>
          </Box>
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 1,
                mb: 1,
              }}
            >
              <CheckCircleIcon sx={{ color: "primary.main" }} />
              <Typography variant="body1" color="primary">
                {feature}
              </Typography>
            </Box>
          ))}
          {/* Subscription Status */}
          {cancel_at_period_end !== null && (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ mb: 1, textDecoration: "underline" }}
            >
              Subscription Status:{" "}
              {cancel_at_period_end ? "Cancelled" : "Active"}
            </Typography>
          )}
          {current_period_end !== 0 && (
            <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
              Your current billing will end on{" "}
              {new Date(current_period_end).toDateString()}
            </Typography>
          )}
          {showManageSubscription ? (
            <CustomerPortalButton />
          ) : (
            <SubscriptionButton email={email} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Subscription;

const features = [
  "No ads. Never ever ever.",
  "Only you have access to your videos.",
  "No brand watermarks.",
  "Upto 3 entries, each upto 1 hour, per day.",
];

const NEXT_PUBLIC_STRIPE_USD_BUY_LINK =
  process.env.NEXT_PUBLIC_STRIPE_USD_BUY_LINK;
const NEXT_PUBLIC_STRIPE_INR_BUY_LINK =
  process.env.NEXT_PUBLIC_STRIPE_INR_BUY_LINK;

const SubscriptionButton = ({ email }) => {
  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "row", gap: 2 }}
      >
        <Button
          href={`${NEXT_PUBLIC_STRIPE_USD_BUY_LINK}?prefilled_email=${encodeURIComponent(
            email
          )}`}
          variant="contained"
          sx={{ width: "100%" }}
        >
          Subscribe ($USD)
        </Button>
        <Button
          href={`${NEXT_PUBLIC_STRIPE_INR_BUY_LINK}?prefilled_email=${encodeURIComponent(
            email
          )}`}
          variant="contained"
          sx={{ width: "100%" }}
        >
          Subscribe (₹INR)
        </Button>
      </Box>
      <Typography variant="body2" color="primary">
        Choose ₹INR if you are from India and $USD otherwise.
      </Typography>
    </Box>
  );
};

const NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK =
  process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK;

const CustomerPortalButton = () => {
  return (
    <Button
      href={NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK}
      variant="contained"
      sx={{ width: "100%" }}
    >
      Manage Subscription
    </Button>
  );
};
