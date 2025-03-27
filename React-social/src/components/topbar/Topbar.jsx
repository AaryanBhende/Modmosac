import "./topbar.css";
import { Search, Person, Chat, Notifications } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { user, dispatch } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  
  // const handleLogout = () => {
  //   const confirmLogout = window.confirm("Are you sure you want to log out?");
  //   if (confirmLogout) {
  //     dispatch({ type: "LOGOUT" });
  //     window.location.href = "/login"; // Redirect to login page after logout
  //   }
  // };
 
  const navigate = useNavigate(); // Use React Router navigation

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user"); 
        localStorage.removeItem("token"); 
  
        navigate("/login"); // Redirect properly
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
  };
  
  
  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Modmosac</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for friend, post or video"
            className="searchInput"
          />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <span className="topbarLink">Homepage</span>
          <span className="topbarLink">Timeline</span>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
        </div>
        <Link onClick={() => (window.location.href = `/profile/${user.username}`)}>
          <img
            src={
              user.profilePicture
                ? PF + user.profilePicture
                : PF + "person/default.png"
            }
            alt=""
            className="topbarImg"
          />
        </Link>
        {/* Logout Button with Confirmation */}
        <button className="logoutButton" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
