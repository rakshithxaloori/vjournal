import axios from "axios";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

const handler = async (req, res) => {
  const { params } = req.query;
  let path = params.join("/");
  path += "/";

  const API_ENDPOINT = process.env.BASE_API_ENDPOINT;

  let headers = {};
  const session = await getServerSession(req, res, authOptions);

  if (session?.token_key) {
    headers["Authorization"] = `Token ${session.token_key}`;
  }

  const APIKit = axios.create({
    baseURL: API_ENDPOINT,
    timeout: 10000,
    headers: headers,
  });

  try {
    if (req.method === "GET") {
      const response = await APIKit.get(path);
      res.status(response.status).json(response.data);
      return;
    } else if (req.method === "POST") {
      const response = await APIKit.post(path, req.body);
      res.status(response.status).json(response.data);
      return;
    }
  } catch (e) {
    if (e.response) {
      res.status(e.response.status).json(e.response?.data || "Server Error");
      return;
    } else if (e.request) {
      res.status(503).json({ detail: "Offline", e });
      return;
    } else {
      res.status(503).json({ detail: "Something went wrong", e });
      return;
    }
  }
};

export default handler;
