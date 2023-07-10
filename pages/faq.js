import Head from "next/head";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import SupportClipboard from "@/components/supportClipboard";

const FAQ = () => {
  return (
    <>
      <Head>
        <title>FAQ</title>
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
            FAQ
          </Typography>
        </Grid>
        <Grid item xs={9}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <QuestionAnswer
              question="What is this?"
              answer="A personal video diary & journal."
            />
            <QuestionAnswer
              question="How much does it cost?"
              answer="$3/month"
            />
            <QuestionAnswer
              question="Who has access to my entries?"
              answer="Only you have access to your VJournal entries."
            />
            <Box>
              <Typography
                variant="body1"
                color="primary"
                sx={{ fontWeight: "bold" }}
              >
                More questions?
              </Typography>
              <SupportClipboard>
                <Typography variant="body1" color="textSecondary">
                  Email us at
                </Typography>
              </SupportClipboard>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default FAQ;

const QuestionAnswer = ({ question, answer }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="body1" color="primary" sx={{ fontWeight: "bold" }}>
        {question}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {answer}
      </Typography>
    </Box>
  );
};
