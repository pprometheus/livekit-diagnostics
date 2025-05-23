import { AccessToken } from "livekit-server-sdk";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } from "../config/config.js";

export const getToken = async (req, res) => {
  try {
    const roomName = "Testing Room";
    const { participantName } = req.query;
    console.log("Particpant",participantName)
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      ttl: "10m",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canUpdateOwnMetadata: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({
      token,
      status: 201,
      message: "Token created successfully",
    });
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).send("Failed to create token");
  }
};
