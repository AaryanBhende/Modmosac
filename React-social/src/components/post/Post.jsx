   import "./post.css";
import { MoreVert, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { useEffect, useContext, useState, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Post({ post }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
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
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight" ref={optionsRef}>
            <MoreVert onClick={() => setShowOptions(!showOptions)} className="postOptionsIcon" />
            {showOptions && (
              <div className="postOptions">
                <button onClick={handleBookmark}>
                  {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          <img className="postImg" src={post.img ? PF + post.img : PF + ""} alt="" />
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
            <span className="postCommentText">{post.comment} comments</span>
            <div className="bookmarkIcon" onClick={handleBookmark}>
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}