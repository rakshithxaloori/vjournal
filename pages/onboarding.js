import Head from "next/head";
import { useState } from "react";
import { getServerSession } from "next-auth/next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { createServerAPIKit, networkError } from "@/utils/APIKit";

const Onboarding = ({
  email,
  is_beta,
  cancel_at_period_end,
  current_period_end,
  error,
}) => {
  const [isUsd, setIsUsd] = useState(false);
  const showManageSubscription = current_period_end !== 0;
  return (
    <>
      <Head>
        <title>Onboarding | VJournal</title>
        <meta
          name="description"
          content="Your personal video diary & journal"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
            display: "flex",
            flexDirection: "column",
          }}
        >
          {is_beta && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                flexDirection: "row",
                gap: 1,
              }}
            >
              <CheckCircleIcon sx={{ color: "green" }} />
              <Typography variant="body1" color="green">
                You have premium access and can use all the features for free.
                You can also choose to pay the subscription.
              </Typography>
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
            {/* Subscription Status */}
            {cancel_at_period_end !== null && (
              <Typography
                variant="body1"
                color="primary"
                sx={{ mb: 1, textDecoration: "underline" }}
              >
                Subscription Status:{" "}
                {cancel_at_period_end ? "Cancelled" : "Active"}
              </Typography>
            )}
            {current_period_end !== 0 && (
              <Typography variant="body1" color="primary" sx={{ mb: 1 }}>
                Your current billing will end on{" "}
                {new Date(current_period_end).toDateString()}
              </Typography>
            )}
            {showManageSubscription ? (
              <CustomerPortalButton />
            ) : (
              <SubscriptionButton email={email} is_usd={isUsd} />
            )}
          </Box>
        </Box>
      </Box>
    </>
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
    try {
      const APIKit = await createServerAPIKit(session.token_key);
      const response = await APIKit.get("/subscription/check");
      const { is_beta, cancel_at_period_end, current_period_end } =
        response.data.payload;
      return {
        props: {
          email: session.user.email,
          is_beta,
          cancel_at_period_end,
          current_period_end,
        },
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
    <Button
      href={`${stripeBuyLink}?prefilled_email=${encodeURIComponent(email)}`}
      variant="contained"
      sx={{ width: "100%" }}
    >
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
