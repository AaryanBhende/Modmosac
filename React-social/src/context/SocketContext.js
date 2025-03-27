import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:8800");
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit("addUser", user._id);
      
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}; 