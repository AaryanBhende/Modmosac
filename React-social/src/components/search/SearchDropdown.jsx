import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./searchDropdown.css";

export default function SearchDropdown({ query, onClose }) {
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ users: [], posts: [] });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        setError("Failed to fetch search results");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  if (!query.trim()) return null;

  return (
    <div className="searchDropdown" ref={dropdownRef}>
      {loading ? (
        <div className="searchLoading">Loading...</div>
      ) : error ? (
        <div className="searchError">{error}</div>
      ) : (
        <>
          {results.users.length > 0 && (
            <div className="searchSection">
              <h3>Users</h3>
              {results.users.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user.username}`}
                  className="searchItem"
                  onClick={onClose}
                >
                  <img
                    src={
                      user.profilePicture
                        ? process.env.REACT_APP_PUBLIC_FOLDER + user.profilePicture
                        : process.env.REACT_APP_PUBLIC_FOLDER + "person/default.png"
                    }
                    alt=""
                    className="searchItemImg"
                  />
                  <span className="searchItemText">@{user.username}</span>
                </Link>
              ))}
            </div>
          )}

          {results.posts.length > 0 && (
            <div className="searchSection">
              <h3>Posts</h3>
              {results.posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/post/${post._id}`}
                  className="searchItem"
                  onClick={onClose}
                >
                  <div className="searchItemContent">
                    <span className="searchItemText">{post.desc.substring(0, 50)}...</span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="searchItemTags">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="searchItemTag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.users.length === 0 && results.posts.length === 0 && (
            <div className="noResults">No results found</div>
          )}
        </>
      )}
    </div>
  );
} 