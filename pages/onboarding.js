const Onboarding = () => {};

export default Onboarding;

const NEXT_PUBLIC_STRIPE_USD_BTN_ID = process.env.NEXT_PUBLIC_STRIPE_USD_BTN_ID;
const NEXT_PUBLIC_STRIPE_INR_BTN_ID = process.env.NEXT_PUBLIC_STRIPE_INR_BTN_ID;
const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const Subscription = ({ email }) => {
  // TODO - use the user's country to determine which button to show
  const stripeBtnId = NEXT_PUBLIC_STRIPE_USD_BTN_ID;
  return (
    <>
      <script async src="https://js.stripe.com/v3/buy-button.js"></script>
      <stripe-buy-button
        buy-button-id={stripeBtnId}
        publishable-key={NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        customer-email={email}
      ></stripe-buy-button>
    </>
  );
};
