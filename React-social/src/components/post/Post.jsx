import "./post.css";
import { MoreVert, Bookmark, BookmarkBorder, Room } from '@mui/icons-material';
import { useEffect, useContext, useState, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Comment from "../comment/Comment";

export default function Post({ post }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const PF = process.env.REACT_APP_PUBLIC_FOLDER; 
  const { user: currentUser } = useContext(AuthContext);
  const optionsRef = useRef();

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users?userId=${post.userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [post.userId]);

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const res = await axios.get(`/users/${currentUser._id}/bookmarks/${post._id}`);
        setIsBookmarked(res.data.isBookmarked);
      } catch (err) {
        console.error(err);
      }
    };
    checkBookmark();
  }, [currentUser._id, post._id]);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await axios.get(`/comments/${post._id}`);
      setComments(res.data || []);
    };
    fetchComments();
  }, [post._id]);

  const likeHandler = () => {
    try {
      axios.put("/posts/" + post._id + "/like", { userId: currentUser._id });
    } catch (err) {}
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await axios.delete(`/users/${currentUser._id}/bookmarks/${post._id}`);
      } else {
        await axios.post(`/users/${currentUser._id}/bookmarks/${post._id}`);
      }
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/comments", { postId: post._id, userId: currentUser._id, text: newComment });
      setNewComment("");
      const res = await axios.get(`/comments/${post._id}`);
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={
                  user.profilePicture
                    ? `${PF}${user.profilePicture}?${new Date().getTime()}`
                    : PF + "person/default.png"
                }
                alt=""
              />
            </Link>
            <div className="postUserInfo">
              <span className="postUsername">{user.username}</span>
              <div className="postMetadata">
                {post.feeling && (
                  <span className="postFeeling">
                    is feeling {post.feeling}
                  </span>
                )}
                {post.location && (
                  <span className="postLocation">
                    <Room fontSize="small" /> {post.location}
                  </span>
                )}
                <span className="postDate">{format(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="postTopRight">
            <div className="bookmarkIcon" onClick={handleBookmark}>
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </div>
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          {post.tags && post.tags.length > 0 && (
            <div className="postTags">
              {post.tags.map((tag, index) => (
                <span key={index} className="postTag">#{tag}</span>
              ))}
            </div>
          )}
          {post.img && (
            <img className="postImg" src={PF + post.img} alt="" />
          )}
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={`${PF}like.png`}
              onClick={likeHandler}
              alt=""
            />
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText" onClick={toggleComments}>
              {comments.length} comments
            </span>
          </div>
        </div>
      </div>
      {showComments && (
        <div className="commentSection">
          <form onSubmit={handleCommentSubmit} className="commentInputContainer">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="commentInput"
            />
            <button type="submit" className="postButton">Post</button>
          </form>
          <h4>Comments</h4>
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <Comment key={comment._id} comment={comment} />
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      )}
    </div>
  );
}