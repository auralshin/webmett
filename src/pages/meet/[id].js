import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import useSocket from "../../hooks/useSocket";
import {
  BsFillMicMuteFill,
  BsFillMicFill,
  BsCameraVideoFill,
  BsCameraVideoOffFill,
} from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";
import Chat from "@/components/chat";
import { useMessageStore } from "@/store/useMessage";
import { ICE_SERVERS } from "@/utils/constants";

const Meet = () => {
  useSocket();
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const { messages, setMessages } = useMessageStore((state) => state);

  const router = useRouter();
  const localVideoRef = useRef();
  const peerVideoRef = useRef();
  const webRTCConnection = useRef(null);
  const signalingServerRef = useRef();
  const localMediaStream = useRef();
  const hostRef = useRef(false);

  const meetingId = usePathname();
  
  useEffect(() => {
    signalingServerRef.current = io();
    signalingServerRef.current.emit("join", meetingId);

    signalingServerRef.current.on("room:joined", setupMediaOnJoin);
    signalingServerRef.current.on("room:created", onRoomCreation);
    signalingServerRef.current.on("ready", startCall);

    signalingServerRef.current.on("leave", onPeerLeave);

    signalingServerRef.current.on("full", () => {
      window.location.href = "/";
    });

    signalingServerRef.current.on("offer", handleReceivedOffer);
    signalingServerRef.current.on("answer", handleAnswer);
    signalingServerRef.current.on("ice-candidate", handlerNewIceCandidateMsg);
    signalingServerRef.current.on("receive-message", (message) => {
      console.log(messages, message);
      setMessages({ text: message, senderId: "peer" });
    });

    return () => signalingServerRef.current.disconnect();
  }, [meetingId]);

  /**
   * Handles the event when a room is joined by obtaining user media and initializing WebRTC functionalities.
   * Establishes the user's media stream by accessing the device's camera and microphone, sets the local video
   * element's source to this stream, and emits a "ready" event to indicate readiness for RTC communication.
   */
  const setupMediaOnJoin = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 800 }, height: { ideal: 800 } },
      })
      .then((stream) => {
        localMediaStream.current = stream;
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play();
        };
        signalingServerRef.current.emit("ready", meetingId);
      })
      .catch((err) => {
        console.log("error", err);
      });
  };
  /**
   * Handles the event when a room is created by the user, performing similar actions to `handleJoinRoom`
   * but specifically tailored for the room creator, ensuring they are set as the host.
   */
  const onRoomCreation = () => {
    hostRef.current = true;
    navigator.mediaDevices
      .getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { width: { ideal: 800 }, height: { ideal: 800 } },
      })
      .then((stream) => {
        localMediaStream.current = stream;
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play();
        };
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /**
   * Initiates the call by creating a peer connection, adding tracks from the user's media stream
   * to the connection, creating an offer, setting the local description to this offer, and then
   * emitting the offer to the server to be sent to the other peer.
   */
  const startCall = () => {
    if (hostRef.current) {
      webRTCConnection.current = newPeerConnection();
      localMediaStream.current.getTracks().forEach((track) => {
        webRTCConnection.current.addTrack(track, localMediaStream.current);
      });
      webRTCConnection.current
        .createOffer()
        .then((offer) => {
          webRTCConnection.current.setLocalDescription(offer);
          signalingServerRef.current.emit("offer", offer, meetingId);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  /**
   * Handles the event when a peer leaves the room by stopping the peer's video stream and closing the peer connection.
   */
  const onPeerLeave = () => {
    hostRef.current = true;
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (webRTCConnection.current) {
      webRTCConnection.current.ontrack = null;
      webRTCConnection.current.onicecandidate = null;
      webRTCConnection.current.close();
      webRTCConnection.current = null;
    }
  };
  /**
   * Handles the reception of a new ICE candidate from the signaling server
   * and adds it to the peer connection.
   * @returns {RTCPeerConnection} A new instance of an RTCPeerConnection.
   */

  const newPeerConnection = () => {
    const connection = new RTCPeerConnection(ICE_SERVERS);
    connection.onicecandidate = handleICECandidateEvent;
    connection.ontrack = handleTrackEvent;
    return connection;
  };

  /**
   * Handles an offer received from another peer by creating a peer connection,
   * setting the remote description to the received offer, creating an answer,
   * setting the local description to this answer, and then emitting the answer
   * to the server to be sent to the other peer.
   * @param {RTCSessionDescriptionInit} offer - The received offer.
   */

  const handleReceivedOffer = (offer) => {
    if (!hostRef.current) {
      webRTCConnection.current = newPeerConnection();
      localMediaStream.current.getTracks().forEach((track) => {
        webRTCConnection.current.addTrack(track, localMediaStream.current);
      });
      webRTCConnection.current.setRemoteDescription(offer);

      webRTCConnection.current
        .createAnswer()
        .then((answer) => {
          webRTCConnection.current.setLocalDescription(answer);
          signalingServerRef.current.emit("answer", answer, meetingId);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  /**
   * Handles an answer received from the answering peer by setting the remote
   * description of the peer connection to the received answer.
   * @param {RTCSessionDescriptionInit} answer - The received answer.
   */

  const handleAnswer = (answer) => {
    webRTCConnection.current
      .setRemoteDescription(answer)
      .catch((err) => console.log(err));
  };

  /**
   * Handles the reception of a new ICE candidate from the signaling server
   * and adds it to the peer connection.
   * @param {RTCIceCandidate} incoming - The incoming ICE candidate.
   */

  const handleICECandidateEvent = (event) => {
    if (event.candidate) {
      signalingServerRef.current.emit(
        "ice-candidate",
        event.candidate,
        meetingId
      );
    }
  };

  /**
   * Handles the reception of a new ICE candidate from the signaling server
   * and adds it to the peer connection.
   * @param {RTCIceCandidate} incoming - The incoming ICE candidate.
   */
  const handlerNewIceCandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);
    webRTCConnection.current
      .addIceCandidate(candidate)
      .catch((e) => console.log(e));
  };

  /**
   * Handles the reception of a new media stream from the peer by setting the peer video element's source to this stream.
   * @param {RTCTrackEvent} event - The event containing the new media stream.
   */

  const handleTrackEvent = (event) => {
    peerVideoRef.current.srcObject = event.streams[0];
  };

  /**
   * Toggle Mic - Mute/Unmute
   */

  const toggleMic = useCallback(() => {
    localMediaStream.current.getTracks().forEach((track) => {
      if (track.kind === "audio") {
        track.enabled = !micActive;
      }
    });
    setMicActive((prev) => !prev);
  }, [micActive]);

  /**
   * Toggle Camera - On/Off
   */

  const toggleCamera = () => {
    localMediaStream.current.getTracks().forEach((track) => {
      if (track.kind === "video") {
        track.enabled = !cameraActive;
      }
    });
    setCameraActive((prev) => !prev);
  };

  /**
   * Leave Room
   */
  const exitCall = useCallback(() => {
    signalingServerRef.current.emit("leave", meetingId);

    [localVideoRef.current, peerVideoRef.current].forEach((videoRef) => {
      if (videoRef?.srcObject) {
        videoRef.srcObject.getTracks().forEach((track) => track.stop());
      }
    });

    if (webRTCConnection.current) {
      webRTCConnection.current.ontrack = null;
      webRTCConnection.current.onicecandidate = null;
      webRTCConnection.current.close();
      webRTCConnection.current = null;
    }
    router.push("/");
  }, [meetingId]);

  return (
    <div className="flex flex-col min-h-screen p-2">
      <div className="flex gap-x-4 p-4">
        <div className="relative w-500 h-800 rounded-lg overflow-hidden">
          <video
            autoPlay
            ref={localVideoRef}
            width="500"
            height="800"
            className="rounded-lg flex-none"
          />
          <span className="absolute bottom-0 left-0 bg-black text-white text-sm p-1">
            "You"
          </span>
        </div>
        <div className="relative w-500 h-800 rounded-lg overflow-hidden">
          <video
            autoPlay
            ref={peerVideoRef}
            width={500}
            height={800}
            className="rounded-lg flex-none"
          />
          <span className="absolute bottom-0 left-0 bg-black text-white text-sm p-1">
            "Peer"
          </span>
        </div>

        <div className="flex-1">
          <Chat messages={messages} setMessages={setMessages} />
        </div>
      </div>

      <div className="p-4 flex justify-center items-center bg-transparent w-screen fixed bottom-4 left-0 right-0 mx-auto">
        <button
          onClick={toggleMic}
          className="mx-4 p-6 bg-gray-800 text-white text-xl rounded-full"
        >
          {micActive ? <BsFillMicFill /> : <BsFillMicMuteFill color="red" />}
        </button>
        <button
          onClick={toggleCamera}
          className="mx-4 p-6 bg-gray-800 text-white text-xl rounded-full"
        >
          {cameraActive ? (
            <BsCameraVideoFill />
          ) : (
            <BsCameraVideoOffFill color="red" />
          )}
        </button>
        <button
          onClick={exitCall}
          className="mx-4 p-5 bg-red-600 text-white text-3xl rounded-full"
        >
          <MdCallEnd color="white" />
        </button>
      </div>
    </div>
  );
};

export default Meet;
