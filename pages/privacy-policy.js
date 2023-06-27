import Head from "next/head";
import Link from "next/link";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
        <meta
          name="description"
          content="Your personal video diary & journal"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="h3" color="primary">
            Privacy Policy
          </Typography>
        </Grid>

        <Grid item xs={9}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              Introduction
            </Typography>
            <Typography variant="body1" color="primary">
              VJournal(a JuntoX(OPC) Private Limited product) (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              and disclose your personal information when you visit our website
              https://vjournal.me (&quot;Site&quot;).
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              Information We Collect
            </Typography>
            <Typography variant="body1" color="primary">
              We may collect personal information when you visit our Site, such
              as:
            </Typography>
            <ul>
              {[
                "Name",
                "Email address",
                "Mailing address",
                "Billing information",
                "Demographic information",
              ].map((text, index) => (
                <li key={index}>
                  <Typography variant="body1" color="primary">
                    {text}
                  </Typography>
                </li>
              ))}
            </ul>

            <Typography variant="body1" color="primary">
              We may also collect non-personal information, such as your browser
              type, IP address, and the pages you visit on our Site.
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              {" "}
              How We Use Your Information
            </Typography>
            <ul>
              {[
                "To process your orders and transactions",
                "To provide customer service and support",
                "To send you promotional emails and newsletters",
                "To improve our products and services",
                "To conduct market research and analysis",
                "To comply with legal and regulatory requirements",
              ].map((text, index) => (
                <li key={index}>
                  <Typography variant="body1" color="primary">
                    {text}
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              How We Protect Your Information
            </Typography>
            <Typography variant="body1" color="primary">
              We take reasonable measures to protect your personal information
              from unauthorized access, disclosure, alteration, or destruction.
              We use industry-standard security technologies and procedures to
              safeguard your personal information.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              Sharing Your Information
            </Typography>
            <Typography variant="body1" color="primary">
              We do not sell or rent your personal information to third parties.
              We may share your personal information with our service providers
              and partners who assist us in providing our services, such as
              payment processors and shipping providers. We may also share your
              personal information if required by law or in the event of a
              merger, acquisition, or sale of assets.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              Your Choices
            </Typography>
            <Typography variant="body1" color="primary">
              You can opt out of receiving promotional emails and newsletters
              from us by following the instructions in the email. You can also
              update your personal information by contacting us at <EmailLink />
              .
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              Third-Party Links
            </Typography>
            <Typography variant="body1" color="primary">
              Our Site may contain links to third-party websites or services. We
              are not responsible for the privacy practices of these websites or
              services. We encourage you to review their privacy policies before
              providing them with any personal information.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              {" "}
              Children&apos;s Privacy
            </Typography>
            <Typography variant="body1" color="primary">
              Our Site is not intended for children under the age of 13. We do
              not knowingly collect personal information from children under the
              age of 13. If you are under the age of 13, do not provide us with
              any personal information.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              {" "}
              Changes to this Privacy Policy
            </Typography>
            <Typography variant="body1" color="primary">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page. We encourage you to review this Privacy Policy
              periodically for any changes.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" color="primary">
              {" "}
              Contact Us
            </Typography>
            <Typography variant="body1" color="primary">
              If you have any questions or concerns about this Privacy Policy,
              please contact us at <EmailLink />.
            </Typography>
          </Box>

          {/* <Typography variant="h5" color="primary"></Typography>
        <Typography variant="body1" color="primary"></Typography> */}
        </Grid>
      </Grid>
    </>
  );
};

export default PrivacyPolicy;

const EmailLink = () => (
  <Link
    href="mailto:support@vjournal.me"
    rel="noopener noreferrer"
    target="_blank"
    style={{ color: "#fff" }}
  >
    support@vjournal.me
  </Link>
);
