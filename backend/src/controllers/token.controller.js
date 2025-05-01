import { AccessToken } from "livekit-server-sdk";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } from "../config/config.js";

export const getToken = async (req, res) => {
  console.log("Generating token...");
  try {
    const roomName = "Testing Room";
    const participantName = "Amith"; // change from frontend
    
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      ttl: "10m",
    });

    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
      res.json({
      token,
      roomName: roomName,
      participantName: participantName,
    });
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).send("Failed to create token");
  }
};
