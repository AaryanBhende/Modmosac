// import { createContext, useReducer } from "react";
// import AuthReducer from "./AuthReducer";

// const INITIAL_STATE = {
//     user: null,
//     isFecthing:false,
//     error:false
// };

// export const AuthContext = createContext(INITIAL_STATE);

// export const AuthContextProvider =({children}) =>{
//     const [state, dispatch] = useReducer(AuthReducer,INITIAL_STATE);

//     return(
//         <AuthContext.Provider 
//             value={{
//                 user:state.user, 
//                 isFecthing:state.isFecthing, 
//                 error:state.error,
//                 dispatch,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     )
// }

import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
  user:JSON.parse(localStorage.getItem("user")) || null,
  // user:{
  //   _id:"6719c9b4ed2b2faae92d8b1e",
  //   username:"",
  //   email:"",
  //   profilePicture:"",
  //   coverPicture:"",
  //   followers:[1,2,3],
  //   followings:[1],
  // },
  isFetching: false,
  error: false,
};


export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  
  useEffect(()=>{
    localStorage.setItem("user", JSON.stringify(state.user))
  },[state.user])
  
  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};