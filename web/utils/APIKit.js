import axios from "axios";

export const createClientAPIKit = async () => {
  const APIKit = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL,
    timeout: 10000,
  });
  return APIKit;
};

export const createServerAPIKit = async (token_key) => {
  const API_ENDPOINT = process.env.BASE_API_ENDPOINT;
  let headers = {};
  if (token_key) {
    headers["Authorization"] = `Token ${token_key}`;
  }
  return axios.create({
    baseURL: API_ENDPOINT,
    timeout: 10000,
    headers: headers,
  });
};

export const networkError = (error) => {
  if (error.response) {
    // Request made and server responded
    if (error.response.status >= 500) return "Oops, server error";
    else return error.response.data?.detail || "Something went wrong";
  } else if (error.request) {
    // The request was made but no response was received
    return "You're offline";
  } else {
    // Something happened in setting up the request that triggered an Error
    return "Huh, something went wrong";
  }
};

export const uploadToS3 = async (
  file,
  s3Url,
  onProgress,
  onSuccess,
  onFailure
) => {
  const formData = new FormData();
  // append the fields in url in formData
  Object.keys(s3Url.fields).forEach((key) => {
    formData.append(key, s3Url.fields[key]);
  });

  // append the file
  formData.append("file", file);

  axios
    .post(s3Url.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    })
    .then(onSuccess)
    .catch(onFailure);
};
