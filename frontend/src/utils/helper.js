// utils/helper.js
import axios from "axios";

export const getToken = async (participantName) => {
  try {
    const response = await axios.get("http://localhost:3000/token/getToken", {
      params: {
        participantName,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response.data.message ||
        "An error occurred while fetching the token."
    );
  }
};
