import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  peers: [],
};

const testRoomSlice = createSlice({
  name: "testRoom",
  initialState,
  reducers: {
    fetchToken: (state, action) => {
      const peerName = action.payload;
      console.log("peerName",peerName)
      const existingPeer = state.peers.find((p) => p.name === peerName);

      if (existingPeer) {
        existingPeer.status = "loading";
      } else {
        state.peers.push({
          name: peerName,
          token: null,
          roomName: null,
          status: "loading",
        });
      }
    },

    setToken: (state, action) => {
      const { peer, token, roomName } = action.payload;
      const existingPeer = state.peers.find((p) => p.name === peer);

      if (existingPeer) {
        existingPeer.token = token;
        existingPeer.roomName = roomName;
        existingPeer.status = "success";
      } else {
        state.peers.push({
          name: peer,
          token,
          roomName,
          status: "success",
        });
      }
    },

    tokenStatus: (state, action) => {
      const { peer, status } = action.payload;
      const existingPeer = state.peers.find((p) => p.name === peer);

      if (existingPeer) {
        existingPeer.status = status;
      }
    },
  },
});

export const { fetchToken, setToken, tokenStatus } = testRoomSlice.actions;

export const selectPeerByName = (name) => (state) =>
  state.testRoom.peers.find((p) => p.name === name);

export default testRoomSlice.reducer;
