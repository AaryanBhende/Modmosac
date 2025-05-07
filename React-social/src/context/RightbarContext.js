import { createContext, useState } from "react";

export const RightbarContext = createContext();

export const RightbarContextProvider = ({ children }) => {
  const [selectedPostId, setSelectedPostId] = useState(null);

  return (
    <RightbarContext.Provider value={{ selectedPostId, setSelectedPostId }}>
      {children}
    </RightbarContext.Provider>
  );
}; 