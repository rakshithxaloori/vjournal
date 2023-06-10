import { getServerSession } from "next-auth/next";

import { authOptions } from "pages/api/auth/[...nextauth]";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { createServerAPIKit, networkError } from "@/utils/APIKit";

const Journal = ({ video }) => {
  console.log(video);
  return (
    <Box>
      <Typography variant="h4" component="h4" color="primary">
        Journal
      </Typography>
      <Typography variant="body1" color="primary">
        {video.title}
      </Typography>
      <video src={video.url} controls></video>
    </Box>
  );
};

export default Journal;

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  } else {
    const { videoId } = context.query;
    if (videoId) {
      try {
        const APIKit = await createServerAPIKit(session.token_key);
        const response = await APIKit.post("/video/detail/", {
          video_id: videoId,
        });
        if (response.status === 200) {
          const { video } = response.data.payload;
          return { props: { video } };
        }
      } catch (e) {
        return { props: { error: networkError(e) } };
      }
    } else
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
  }
}
