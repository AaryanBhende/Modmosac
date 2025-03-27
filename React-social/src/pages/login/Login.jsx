import { Link } from "react-router-dom";
import { useContext, useRef, useState } from "react"; // Import useState
import "./login.css"; 
import { loginCall } from "../../apiCalls"
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { user, isFetching, error, dispatch } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const response = await loginCall(
        { email: email.current.value, password: password.current.value },
        dispatch
      );
  
      if (response && response.error) {
        alert(response.error); // Set error message from response
      } else {
        setErrorMessage(""); // Clear error message on successful login
      }
    } catch (error) {
      setErrorMessage(""); // Handle unexpected errors
    }
  };

  return (
    <div className="Login">
      <div className="LoginWrapper">
        <div className="LoginLeft">
          <h3 className="LoginLogo">Mod Mosaic</h3>
          <span className="LoginDesc">
            Connect with friends and the world around you on Mod Mosaic.
          </span>
        </div>
        <div className="LoginRight">
          <form className="loginBox" onSubmit={handleClick}>
            <input 
              placeholder="Email" 
              type="email" 
              className="LoginInput"
              required 
              ref={email}
            />
            <input 
              placeholder="Password" 
              type="password" 
              className="LoginInput"
              required
              minLength={6}
              ref={password} 
            />
            <button type="submit" className="LoginButton">Log In</button>
            {errorMessage && <div className="errorPopup">{errorMessage}</div>} {/* Display error message */}
            <span className="LoginForgot">Forgot Password?</span>
            <button type="button" className="LoginRegisterButton" onClick={() => window.location.href = '/register'}>
              Create a New Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}