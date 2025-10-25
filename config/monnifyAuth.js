// utils/monnifyAuth.js
import axios from "axios";

export const getMonnifyToken = async () => {
  try {
    const { MONNIFY_API_KEY, MONNIFY_SECRET_KEY, MONNIFY_BASE_URL } =
      process.env;

    const encodedKey = Buffer.from(
      `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`
    ).toString("base64");

    const res = await axios.post(`${MONNIFY_BASE_URL}/auth/login`);

    return res.data.responseBody.accessToken;
  } catch (err) {
    console.error("Error getting Monnify token:", err.message);
    throw err;
  }
};
