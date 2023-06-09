import { getServerSession } from "next-auth/next";

import { authOptions } from "pages/api/auth/[...nextauth]";

import { createServerAPIKit, networkError } from "@/utils/APIKit";

const Journal = ({ video }) => {
  console.log(video);
  return (
    <div>
      <h1>Journal</h1>
      <h2>{video.title}</h2>
      <video src={video.url} controls></video>
    </div>
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
