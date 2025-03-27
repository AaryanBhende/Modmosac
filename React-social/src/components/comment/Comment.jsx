import "./comment.css";
import { useState, useEffect } from "react";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Comment({ comment, currentUser, onDelete }) {
  const [user, setUser] = useState({});
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users?userId=${comment.userId}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [comment.userId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/comments/${comment._id}`, {
        data: { userId: currentUser._id },
      });
      onDelete(comment._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="comment">
      <div className="commentWrapper">
        <div className="commentLeft">
          <Link to={`/profile/${user.username}`}>
            <img
              className="commentProfileImg"
              src={
                user.profilePicture
                  ? PF + user.profilePicture
                  : PF + "person/default.png"
              }
              alt=""
            />
          </Link>
        </div>
        <div className="commentContent">
          <div className="commentInfo">
            <span className="commentUsername">{user.username}</span>
            <span className="commentDate">{format(comment.createdAt)}</span>
          </div>
          <p className="commentText">{comment.text}</p>
          {comment.userId === currentUser._id && (
            <div className="commentActions">
              <span className="commentDelete" onClick={handleDelete}>Delete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}