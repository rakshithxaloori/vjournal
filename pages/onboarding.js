import { useState } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { createServerAPIKit, networkError } from "@/utils/APIKit";

const Onboarding = ({ email, is_active, current_period_end, error }) => {
  // const [stage, setStage] = useState(0);
  const [isUsd, setIsUsd] = useState(true);
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          minWidth: "50vw",
          height: "fit-content",
          p: 6,
          display: "flex",
          flexDirection: "column",
          borderWidth: 1,
          borderColor: "primary.main",
          borderStyle: "solid",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" color="primary" sx={{ mb: 1 }}>
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
            {isUsd ? "$3" : "₹240"}
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
        {is_active ? (
          <CustomerPortalButton />
        ) : (
          <SubscriptionButton email={email} is_usd={isUsd} />
        )}
      </Box>
    </Box>
  );
};

export default Onboarding;

const features = [
  "No ads. Never ever ever.",
  "No brand watermarks. Your videos are yours.",
  "Upto 3 entries, each upto 1 hour, per day",
];

export const getServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }
  if (session?.token_key) {
    // TODO - check if the user has a subscription
    try {
      const APIKit = await createServerAPIKit(session.token_key);
      const response = await APIKit.get("/api/subscription/check");
      const { is_active, current_period_end } = response.data.payload;
      return {
        props: { email: session.user.email, is_active, current_period_end },
      };
    } catch (e) {
      return {
        props: { email: session.user.email, error: networkError(e) },
      };
    }
  }
};

const NEXT_PUBLIC_STRIPE_USD_BUY_LINK =
  process.env.NEXT_PUBLIC_STRIPE_USD_BUY_LINK;
const NEXT_PUBLIC_STRIPE_INR_BUY_LINK =
  process.env.NEXT_PUBLIC_STRIPE_INR_BUY_LINK;

const SubscriptionButton = ({ email, is_usd = true }) => {
  const stripeBuyLink = is_usd
    ? NEXT_PUBLIC_STRIPE_USD_BUY_LINK
    : NEXT_PUBLIC_STRIPE_INR_BUY_LINK;
  return (
    <Button href={stripeBuyLink} variant="contained" sx={{ width: "100%" }}>
      Subscribe
    </Button>
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
