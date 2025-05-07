## Documentation

### Overview

This application provides real-time insights into the network performance within a LiveKit environment by displaying key metrics:

- **Bandwidth**: Measures the data transfer rate, indicating the capacity of your connection.
- **Latency**: Reflects the delay in data transmission, affecting the responsiveness of the connection.
- **Packet Loss**: Indicates the percentage of data packets lost during transmission, which can impact media quality.

By monitoring these metrics, users can assess their network quality when joining a LiveKit room, ensuring optimal audio and video experiences.

### Workflow

**1. Token Management**

- **Generation**: Tokens for peerA (Publisher) and peerB (Subscriber) are generated using the LiveKit API Key and Secret.
- **Retrieval**: Tokens are fetched from the backend via Redux Saga and stored in the Redux state.
- **Usage**: These tokens authenticate and connect participants to the LiveKit room.

2. Room Connection

- **Permissions**: Before establishing a connection, the application verifies camera and microphone permissions.
- **Connection**: Upon successful verification, participants connect to the LiveKit room.
- **Controls**: Participants can toggle their microphone and camera using the provided controls.

---

3. Real-Time Metrics Collection

**Publisher (Peer A):**

- **Data Source**: Utilises `room.engine.publisher.pcManager._pc` to access transport and candidate-pair statistics.
- **Metrics**:
    - **Bandwidth**: Calculated from `bytesSent` and `bytesReceived` over time.
    - **Latency**: Derived from `currentRoundTripTime` in the candidate-pair statistics

**Subscriber (Peer B):**

- **Data Source**: Accesses `nroom.engine.subscriber.pcManager._pc` to retrieve `inbound-rtp` statistics for both audio and video.
- **Metrics**:
    - **Packet Loss**:
        - **Audio**: Calculated using `packetsLost` and `packetsReceived` for audio streams.
        - **Video**: Calculated using `packetsLost` and `packetsReceived` for video streams.
        - **Average**: Computed as the mean of audio and video packet loss percentages.
    

---

### Technologies Used

1. **Frontend**:
    - **React**: For building the user interface.
    - **Redux Toolkit**: For state management.
    - **Redux Saga**: For handling side effects like API calls.
    - **LiveKit**: For real-time video and audio streaming.
    - **Recharts**: For visualizing real-time metrics.
    - **Tailwind CSS**: For styling the application.
    - **React Hot Toast**: For displaying notifications.
2. **Backend**:
    - **Express.js**: For serving APIs.
    - **LiveKit Server SDK**: For generating tokens and managing room permissions.
3. **Testing**:
    - **Jest** and **React Testing Library**: For unit and integration testing.
    - **Storybook**: For developing and testing UI components in isolation.


### Screen Recordings

Connected via WiFi
[Link](https://talviewinc-my.sharepoint.com/:f:/g/personal/amith_paul_talview_com/Ep0-g0vx-etLjRSBvwX-0EkBg_O1Y8lExVsp9PD4H6--CA?tdid=6605eca4-c1c8-44d0-9a87-a37675e06b5d)

Connected via Mobile Network 
[Link](https://talviewinc-my.sharepoint.com/:f:/g/personal/amith_paul_talview_com/EoQL-RPp8FtCtO-pLiZCv2MBO3gg9381k6U7mLBMVJ6mYA?tdid=55b867db-696e-4e60-adb1-beb132705bbe)

### References
- https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
- https://docs.livekit.io/home/
- https://webrtc.org/
- https://www.reddit.com/r/WebRTC/comments/1ilyqzn/what_is_the_livekit/?rdt=47097
- https://webrtc.org/getting-started/overview#webrtc_apis
- https://github.com/livekit/livekit/tree/master/pkg/telemetry/prometheus
- https://webkul.com/blog/react-code-splitting-with-redux-redux-saga/
- https://docs.livekit.io/home/client/tracks/subscribe/
- https://echarts.apache.org/en/option.html#title
- https://groups.google.com/g/discuss-webrtc/c/ylrlPp-fcH0?pli=1
- [https://webrtchacks.com/power-up-getstats-for-client-monitoring/#:~:text=getStats outputs different reports such,these stats can help developers](https://webrtchacks.com/power-up-getstats-for-client-monitoring/#:~:text=getStats%20outputs%20different%20reports%20such,these%20stats%20can%20help%20developers)
- https://docs.livekit.io/home/get-started/authentication/#token-refresh
