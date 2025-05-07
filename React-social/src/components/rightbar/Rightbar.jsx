import "./rightbar.css";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Add, Remove } from '@mui/icons-material';
import Modal from "../Modal/Modal";
import Online from "../online/Online";
import { SocketContext } from "../../context/SocketContext";

export default function Rightbar({ user, postId }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: "", city: "", from: "", relationship: 1 });
  const { onlineUsers } = useContext(SocketContext);
  const [modifiedFields, setModifiedFields] = useState({});
  const [usernameError, setUsernameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPicture, setCoverPicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [postLikers, setPostLikers] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        city: user.city || "",
        from: user.from || "",
        relationship: user.relationship || 1,
      });
    }
  }, [user]);

  useEffect(() => {
    if (currentUser && user) {
      setFollowed(currentUser.followings.includes(user._id));
    }
  }, [currentUser, user]);

  useEffect(() => {
    if (user && user._id) {
      const getFriends = async () => {
        try {
          const res = await axios.get("/users/friends/" + user._id);
          setFriends(res.data);
        } catch (err) {
          console.log(err);
        }
      };
      getFriends();
    }
  }, [user]);

  useEffect(() => {
    if (currentUser && currentUser._id && onlineUsers.length > 0) {
      const getMyFriends = async () => {
        try {
          const res = await axios.get("/users/friends/" + currentUser._id);
          const online = res.data.filter(friend => onlineUsers.includes(friend._id));
          setOnlineFriends(online);
        } catch (err) {
          console.error("Error fetching friends:", err);
        }
      };
      getMyFriends();
    }
  }, [currentUser, onlineUsers]);

  useEffect(() => {
    if (postId) {
      const fetchLikers = async () => {
        try {
          const res = await axios.get(`/posts/${postId}/likes`);
          setPostLikers(res.data);
        } catch (err) {
          console.error("Error fetching post likers:", err);
        }
      };
      fetchLikers();
    }
  }, [postId]);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (followed) {
        await axios.put(`/users/${user._id}/unfollow`, { userId: currentUser._id });
        dispatch({ type: "UNFOLLOW", payload: user._id });
      } else {
        await axios.put(`/users/${user._id}/follow`, { userId: currentUser._id });
        dispatch({ type: "FOLLOW", payload: user._id });
      }
      const updatedUser = await axios.get(`/users/${currentUser._id}`);
      dispatch({ type: "UPDATE_USER", payload: updatedUser.data });
      setFollowed(!followed);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isModified = value !== user[name];
    setModifiedFields(prev => ({ ...prev, [name]: isModified }));
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'username') setUsernameError('');
  };

  const checkUsername = async (username) => {
    if (username === user.username) return true;
    try {
      const res = await axios.get(`/users/check-username/${username}`);
      return res.data.available;
    } catch (err) {
      console.error("Error checking username:", err);
      return false;
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'profile') {
        setProfilePicture(file);
        setProfilePreview(URL.createObjectURL(file));
        setModifiedFields(prev => ({ ...prev, profilePicture: true }));
      } else {
        setCoverPicture(file);
        setCoverPreview(URL.createObjectURL(file));
        setModifiedFields(prev => ({ ...prev, coverPicture: true }));
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (modifiedFields.username) {
        const available = await checkUsername(formData.username);
        if (!available) {
          setUsernameError("Username already exists");
          setIsSubmitting(false);
          return;
        }
      }
      const dataToSend = new FormData();
      dataToSend.append("userId", currentUser._id);
      Object.keys(modifiedFields).forEach(field => {
        if (modifiedFields[field] && !['profilePicture', 'coverPicture'].includes(field)) {
          dataToSend.append(field, formData[field]);
        }
      });
      if (profilePicture) dataToSend.append("profilePicture", profilePicture);
      if (coverPicture) dataToSend.append("coverPicture", coverPicture);

      const res = await axios.put(`/users/${currentUser._id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch({ type: "UPDATE_USER", payload: res.data });
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const HomeRightbar = () => (
    <>
      <h4 className="rightbarTitle">Online Friends</h4>
      <ul className="rightbarFriendList">
        {onlineFriends.length > 0 ? (
          onlineFriends.map((user) => (
            <Link to={`/profile/${user.username}`} style={{ textDecoration: "none" }} key={user._id}>
              <Online user={user} />
            </Link>
          ))
        ) : (
          <div className="noOnlineFriends">No friends online right now</div>
        )}
      </ul>
    </>
  );

  const ProfileRightbar = () => (
    <>
      {user && user.username !== currentUser.username && (
        <button className="rightbarFollowButton" onClick={handleClick} disabled={loading}>
          {loading ? "Loading..." : followed ? "Unfollow" : "Follow"}
          {!loading && (followed ? <Remove /> : <Add />)}
        </button>
      )}
      <h4 className="rightbarTitle">User information</h4>
      <div className="rightbarInfo">
        <div className="rightbarInfoItem">
          <span className="rightbarInfoKey">City:</span>
          <span className="rightbarInfoValue">{user?.city}</span>
        </div>
        <div className="rightbarInfoItem">
          <span className="rightbarInfoKey">From:</span>
          <span className="rightbarInfoValue">{user?.from}</span>
        </div>
        <div className="rightbarInfoItem">
          <span className="rightbarInfoKey">Relationship:</span>
          <span className="rightbarInfoValue">{user?.relationship === 1 ? "Single" : user?.relationship === 2 ? "Married" : "-"}</span>
        </div>
      </div>
      <h4 className="rightbarTitle">User friends</h4>
      <div className="rightbarFollowings">
        {friends.map((friend) => (
          <a key={friend._id} href={`/profile/${friend.username}`} style={{ textDecoration: "none" }}>
            <div className="rightbarFollowing">
              <img
                src={friend.profilePicture ? PF + friend.profilePicture : PF + "person/default.png"}
                alt=""
                className="rightbarFollowingImg"
              />
              <span className="rightbarFollowingName">{friend.username}</span>
            </div>
          </a>
        ))}
      </div>
      {postId && (
        <>
          <h4 className="rightbarTitle">People who liked this post</h4>
          <ul className="rightbarFriendList">
            {postLikers.length > 0 ? (
              postLikers.map((liker) => (
                <Link key={liker._id} to={`/profile/${liker.username}`} style={{ textDecoration: "none" }}>
                  <Online user={liker} />
                </Link>
              ))
            ) : (
              <div className="noOnlineFriends">No likes yet</div>
            )}
          </ul>
        </>
      )}
    </>
  );

  return (
    <div className="rightbar">
      <div className="rightbarWrapper">
        {user ? (
          <>
            <ProfileRightbar />
            {currentUser && user._id === currentUser._id && (
              <button className="editProfileButton" onClick={() => setShowModal(true)}>
                Edit Profile
              </button>
            )}
          </>
        ) : (
          <HomeRightbar />
        )}
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <form onSubmit={handleFormSubmit}>
            <div className="imageUploadSection">
              <div className="imageUploadContainer">
                <label>Profile Picture</label>
                <div className="imagePreviewContainer">
                  <img
                    src={
                      profilePreview || 
                      (user?.profilePicture ? PF + user.profilePicture : PF + "person/default.png")
                    }
                    alt="Profile"
                    className="imagePreview"
                  />
                  <input
                    type="file"
                    id="profilePicture"
                    accept=".png,.jpeg,.jpg"
                    onChange={(e) => handleFileChange(e, 'profile')}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profilePicture" className="uploadButton">
                    Change Profile Picture
                  </label>
                  {modifiedFields.profilePicture && <div className="modified-indicator">Modified</div>}
                </div>
              </div>

              <div className="imageUploadContainer">
                <label>Cover Picture</label>
                <div className="imagePreviewContainer">
                  <img
                    src={
                      coverPreview || 
                      (user?.coverPicture ? PF + user.coverPicture : PF + "cover/default.png")
                    }
                    alt="Cover"
                    className="coverPreview"
                  />
                  <input
                    type="file"
                    id="coverPicture"
                    accept=".png,.jpeg,.jpg"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="coverPicture" className="uploadButton">
                    Change Cover Picture
                  </label>
                  {modifiedFields.coverPicture && <div className="modified-indicator">Modified</div>}
                </div>
              </div>
            </div>

            <div>
              <label>Username</label>
              <div className="fieldDescription">Choose a unique username that represents you</div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className={usernameError ? 'input-error' : ''}
              />
              {usernameError && <div className="error-message">{usernameError}</div>}
              {modifiedFields.username && <div className="modified-indicator">Modified</div>}
            </div>
            <div>
              <label>City</label>
              <div className="fieldDescription">Where do you currently live?</div>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
              />
              {modifiedFields.city && <div className="modified-indicator">Modified</div>}
            </div>
            <div>
              <label>From</label>
              <div className="fieldDescription">Where are you originally from?</div>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="Enter your hometown"
              />
              {modifiedFields.from && <div className="modified-indicator">Modified</div>}
            </div>
            <div>
              <label>Relationship Status</label>
              <div className="fieldDescription">Select your current relationship status</div>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
              >
                <option value="1">Single</option>
                <option value="2">Married</option>
                <option value="3">Other</option>
              </select>
              {modifiedFields.relationship && <div className="modified-indicator">Modified</div>}
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || (Object.keys(modifiedFields).length === 0)}
              className="submitButton"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
