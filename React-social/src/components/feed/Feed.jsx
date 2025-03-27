import { useContext, useEffect, useState, useCallback } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { user } = useContext(AuthContext);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true); // Show loading before fetching
      const res = username
        ? await axios.get(`/posts/profile/${username}`)
        : await axios.get(`/posts/timeline/${user._id}`);
      
      setPosts(
        res.data.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt))
      );
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false); // Hide loading after fetching
    }
  }, [username, user._id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="feed">
      <div className="feedWrapper">
        {(!username || username === user.username) && <Share />}
        
        {/* Show Loading Spinner */}
        {isLoading ? (
          <div className="loadingIndicator">Loading posts...</div>
        ) : (
          posts.map((p) => <Post key={p._id} post={p} />)
        )}
      </div>
    </div>
  );
}
