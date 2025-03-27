import axios from "axios";
import { useRef, useState } from "react";
import "./register.css";
import { useNavigate } from "react-router-dom";// have used useNavigate instead of useHistory();

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const handleClick = async (e) => {
    e.preventDefault();
    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
    } else {
      const user = {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      };
      try {
        await axios.post("/auth/register", user);
        navigate("/login");
      } catch (err) {
        setErrorMessage("Registration failed. Please try again."); // Set error message
        console.log(err);
      }
    }
  };

  return (
    <div className="Register">
      <div className="RegisterWrapper">
        <div className="RegisterLeft">
          <h3 className="RegisterLogo">Mod Mosaic</h3>
          <span className="RegisterDesc">
            Connect with friends and the world around you on Mod Mosaic.
          </span>
        </div>
        <div className="RegisterRight">
          <form className="RegisterBox" onSubmit={handleClick}>
            <input
              placeholder="Username"
              required
              ref={username}
              className="RegisterInput"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="RegisterInput"
              type="email"
            />
            <input
              placeholder="Password"
              required
              ref={password}
              className="RegisterInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Password Again"
              required
              ref={passwordAgain}
              className="RegisterInput"
              type="password"
            />
            <button className="RegisterButton" type="submit">
              Sign Up
            </button>
            {errorMessage && <div className="errorPopup">{errorMessage}</div>} {/* Display error message */}
            <button type="button" className="LoginRegisterButton" onClick={() => navigate("/login")}>
              Log into Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}