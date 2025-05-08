// File: Comment.jsx
import React, { useState, useEffect } from "react";
import "./comment.css";
import { format } from "timeago.js";
import axios from "axios";

const PF = process.env.REACT_APP_PUBLIC_FOLDER;

const Comment = ({ comment, onReply, replies = [] }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [commentReplies, setCommentReplies] = useState(replies);
  const [commentUser, setCommentUser] = useState(null);
  const [replyUsers, setReplyUsers] = useState({});
  const [showReplies, setShowReplies] = useState(false);
  const [offensiveWarning, setOffensiveWarning] = useState(null);

  useEffect(() => {
    const fetchCommentUser = async () => {
      try {
        const res = await axios.get(`/users?userId=${comment.userId}`);
        setCommentUser(res.data);
      } catch (err) {
        console.error("Error fetching comment user:", err);
      }
    };
    if (comment.userId) {
      fetchCommentUser();
    }
  }, [comment.userId]);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const res = await axios.get(`/comments/replies/${comment._id}`);
        setCommentReplies(res.data || []);
        const userPromises = res.data.map(reply => axios.get(`/users?userId=${reply.userId}`));
        const userResponses = await Promise.all(userPromises);
        const userMap = {};
        userResponses.forEach((response, index) => {
          userMap[res.data[index]._id] = response.data;
        });
        setReplyUsers(userMap);
      } catch (err) {
        console.error("Error fetching replies:", err);
      }
    };
    fetchReplies();
  }, [comment._id]);

  const handleReply = (toUser) => {
    setReplyTo(toUser);
    setReplyOpen(true);
  };

  const handleRepliesClick = () => {
    setShowReplies(!showReplies);
    setReplyOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    const replyContent = replyTo ? `@${replyTo} ${replyText}` : replyText;

    try {
      const res = await axios.post("/comments", {
        postId: comment.postId,
        text: replyContent,
        parentId: comment._id,
      });

      const userRes = await axios.get(`/users?userId=${res.data.userId}`);
      setReplyUsers(prev => ({ ...prev, [res.data._id]: userRes.data }));
      setCommentReplies(prev => [...prev, res.data]);
      setReplyText("");
      setReplyOpen(true);
      setReplyTo(null);

      if (onReply) onReply(comment._id, replyContent);
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.offensive) {
        setOffensiveWarning(err.response.data.message || "Your reply contains offensive content.");
      } else {
        console.error("Error posting reply:", err);
      }
    }
  };

  return (
    <div className="comment-container">
      {offensiveWarning && (
        <div className="offensiveModal">
          <h3>🚫 Offensive Comment Detected</h3>
          <p>{offensiveWarning}</p>
          <button onClick={() => setOffensiveWarning(null)}>Close</button>
        </div>
      )}

      <div className="comment">
        <img
          src={commentUser?.profilePicture ? PF + commentUser.profilePicture : PF + "person/default.png"}
          alt=""
          className="commentImg"
        />
        <div className="commentContent">
          <span className="username">{commentUser?.username || "User"}</span>
          <span className="time">{format(comment.createdAt)}</span>
          <p className="commentText">{comment.text || comment.desc}</p>
          <span className="replyToggle" onClick={handleRepliesClick}>
            {commentReplies.length} {commentReplies.length === 1 ? "reply" : "replies"}
          </span>
        </div>
      </div>

      {showReplies && (
        <div className="replySection">
          {replyOpen && (
            <div className="commentInputContainer">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${replyTo || commentUser?.username}...`}
                className="commentInput"
              />
              <button className="commentButton" onClick={handleReplySubmit}>
                Reply
              </button>
            </div>
          )}

          {commentReplies.map((reply) => {
            const replyUser = replyUsers[reply._id];
            return (
              <div key={reply._id} className="comment reply flatReply">
                <img
                  src={replyUser?.profilePicture ? PF + replyUser.profilePicture : PF + "person/default.png"}
                  alt=""
                  className="commentImg"
                />
                <div className="commentContent">
                  <span className="username">{replyUser?.username || "User"}</span>
                  <span className="time">{format(reply.createdAt)}</span>
                  <p className="commentText">{reply.text || reply.desc}</p>
                  <span className="replyToggle" onClick={() => handleReply(replyUser?.username || "user")}>
                    Reply
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comment;
