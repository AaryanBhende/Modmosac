import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Post from "../../components/post/Post";
import "./search.css";

export default function Search() {
  const { type, query } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/search/results?q=${query}&type=${type}`);
        setPosts(res.data.posts || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load results");
        setPosts([]);
      }
      setLoading(false);
    };

    fetchResults();
  }, [type, query]);

  return (
    <div className="searchResults">
      <h2 className="searchTitle">
        {type === "tag" ? `Posts tagged with #${query}` : `Search results for "${query}"`}
      </h2>
      
      {loading && <div className="loading">Loading...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && posts.length === 0 && (
        <div className="noResults">No posts found</div>
      )}
      
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
} 