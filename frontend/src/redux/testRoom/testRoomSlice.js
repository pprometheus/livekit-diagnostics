import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  peers: {
    peerA: { token: null, roomName: null, status: null },
    peerB: { token: null, roomName: null, status: null },
  },
};

const testRoomSlice = createSlice({
  name: "testRoom",
  initialState,
  reducers: {
    fetchToken: (state, action) => {
      const peer = action.payload.participantName; // peer can be "peerA" or "peerB"
      // console.log("Fetching token for:", peer, action.payload.participantName);
      state.peers[peer].status = "loading";
    },
    fetchTokenB: (state, action) => {
      const peer = action.payload.participantName; // peer can be "peerA" or "peerB"
      // console.log("Fetching token for:", peer, action.payload.participantName);
      state.peers[peer].status = "loading";
    },
    setToken: (state, action) => {
      const { peer, token, roomName } = action.payload;
      console.log("Setting token for:", peer, action.payload);
      state.peers[peer].token = token;
      state.peers[peer].roomName = roomName;
      state.peers[peer].status = "success";
    },
    clearToken: (state, action) => {
      const { peer } = action.payload;
      state.peers[peer].token = null;
      state.peers[peer].roomName = null;
      state.peers[peer].status = null;
    },
    tokenStatus: (state, action) => {
      const { peer, status } = action.payload;
      state.peers[peer].status = status;
    },
  },
});

export const { fetchToken, fetchTokenB,setToken, clearToken, tokenStatus } =
  testRoomSlice.actions;
export const selectPeerA = (state) => state.testRoom.peers.peerA;
export const selectPeerB = (state) => state.testRoom.peers.peerB;

export default testRoomSlice.reducer;
