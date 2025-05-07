import { AccessToken } from "livekit-server-sdk";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } from "../config/config.js";

export const getToken = async (req, res) => {
  try {
    const roomName = "Testing Room";
    const { participantName } = req.query;
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

    res.cookie(`token${participantName}`, token, {
      secure: true,
      sameSite: "strict",
      maxAge: 10 * 60 * 1000,
    });

    res.json({
      status: 201,
      message: "Token created successfully",
    });
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).send("Failed to create token");
  }
};
