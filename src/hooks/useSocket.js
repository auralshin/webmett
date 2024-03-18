import { useEffect, useRef } from "react";

/**
 * Custom React hook for initializing a WebSocket connection.
 * Ensures the WebSocket is only initialized once during the component's lifecycle.
 * This hook is designed to be used in components that require real-time data communication capabilities.
 * @dev
 * The hook attempts to make a call to "/api/socket", which should be an API route configured to upgrade
 * the HTTP connection to a WebSocket connection.
 * 
 * @example
 * useSocket();
 */
const useSocket = () => {
  const socketCreated = useRef(false);
  useEffect(() => {
    if (!socketCreated.current) {
      const socketInitializer = async () => {
        await fetch("/api/socket");
      };
      try {
        socketInitializer();
        socketCreated.current = true;
      } catch (error) {
        console.log(error);
      }
    }
  }, []);
};

export default useSocket;
