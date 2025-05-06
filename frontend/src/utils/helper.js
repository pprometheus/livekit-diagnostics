import {Cookies } from "react-cookie"
import axios from "axios";
const cookies = new Cookies();
export const getToken = async (participantName) => {
  try {
    const response = await axios.get("http://localhost:3000/token/getToken", {
      withCredentials: true,
       params: {
        participantName,
      },
    });
    const token = cookies.get("token" + participantName);
    return token;
  } catch (error) {
    throw new Error(
      error.response.data.message ||
        "An error occurred while fetching the token."
    );
  }
};
