import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

import Copier from "@/components/copier";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

// const brandLogoUrl = `logo.png`;

export const NewEntryComponent = ({
  brandLogoUrl,
  thumbnailImageUrl,
  dateStr,
  title,
  summary,
  entryUrl,
}) => {
  const previewText = `Watch your VJournal Entry`;

  return (
    <>
      {/* <Html> */}
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Section style={main}>
          <Container style={container}>
            <Section>
              <Img
                src={brandLogoUrl}
                width="48"
                alt="VJournal"
                style={brandLogoStyle}
              />
            </Section>
            <Section style={{ paddingBottom: "20px" }}>
              <Row>
                <Text style={heading}>Your Entry on {dateStr}</Text>
                <Text style={titleStyle}>{title}</Text>
                <Img
                  src={thumbnailImageUrl}
                  width="100%"
                  alt="Entry's Thumbnail"
                  style={thumbnailImageStyle}
                />
                <Text style={summaryStyle}>{summary}</Text>
                <Button pY={19} style={button} href={entryUrl}>
                  Watch My Entry
                </Button>
              </Row>
            </Section>
          </Container>
        </Section>
      </Body>
      {/* </Html> */}
    </>
  );
};

const NewEntry = () => {
  let props = {
    brandLogoUrl: "logo.png",
    thumbnailImageUrl: "thumbnail.jpg",
    dateStr: "26th June, 2023",
    title: "Zeno was a great guest!",
    summary:
      "“Zeno was a great guest! Easy communication, the apartment was left in great condition, very polite, and respectful of all house rules. He's welcome back anytime and would easily recommend him to any host!”",
    entryUrl: `/static/airbnb-review-entry.mp4`,
  };
  props = {
    brandLogoUrl: "{brandLogoUrl}",
    thumbnailImageUrl: "{thumbnailImageUrl}",
    dateStr: "{dateStr}",
    title: "{title}",
    summary: "{summary}",
    entryUrl: "{entryUrl}",
  };

  return (
    <Copier childProps={props}>
      <NewEntryComponent {...props} />
    </Copier>
  );
};

export default NewEntry;

const main = {
  backgroundColor: "#000",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const brandLogoStyle = {
  margin: "0 auto",
  marginBottom: "16px",
  borderRadius: "50%",
};

const thumbnailImageStyle = {
  margin: "0 auto",
  marginBottom: "16px",
  borderRadius: "10px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#fff",
  marginBottom: "20px",
};

const titleStyle = {
  fontSize: "27px",
  color: "#bdbdbd",
};

const summaryStyle = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#fff",
  paddingTop: "24px",
  paddingBottom: "24px",
  borderRadius: "4px",
};

const button = {
  backgroundColor: "#fff",
  borderRadius: "3px",
  color: "#000",
  fontSize: "18px",
  textDecoration: "none",
  textAlign: "center",
  display: "block",
  width: "100%",
};
