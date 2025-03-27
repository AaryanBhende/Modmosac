import axios from "axios";

export const loginCall = async (userCredentials, dispatch) => {
  try {
    const res = await axios.post("/auth/login", userCredentials);
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    return { data: res.data }; // Return data on success
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err });
    return { error: err.response?.data || "An error occurred" }; // Return error message
  }
};