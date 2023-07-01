import Head from "next/head";
import { useState } from "react";
import { getServerSession } from "next-auth/next";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { createServerAPIKit, networkError } from "@/utils/APIKit";
import FlashMessage from "@/components/flashMessage";
import Subscription from "@/components/subscription";

const Onboarding = ({
  email,
  is_beta,
  cancel_at_period_end,
  current_period_end,
  error,
}) => {
  const [message, setMessage] = useState(error || "");
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
      <Subscription
        email={email}
        is_beta={is_beta}
        cancel_at_period_end={cancel_at_period_end}
        current_period_end={current_period_end}
      />
      <FlashMessage message={message} setMessage={setMessage} />
    </>
  );
};

export default Onboarding;

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
