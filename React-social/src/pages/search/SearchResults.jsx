import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Post from "../../components/post/Post";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Rightbar from "../../components/rightbar/Rightbar";
import "./searchResults.css";

export default function SearchResults() {
  const { type, query } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/search/${type}/${query}?page=${currentPage}`);
        setResults(res.data.results);
        setTotalPages(res.data.totalPages);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load results");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [type, query, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const getSearchTitle = () => {
    switch (type) {
      case "text":
        return `Search results for "${query}"`;
      case "tag":
        return `Posts tagged with #${query}`;
      case "user":
        return `Users matching "${query}"`;
      default:
        return "Search Results";
    }
  };

  return (
    <>
      <Topbar />
      <div className="searchResultsContainer">
        <Sidebar />
        <div className="searchResultsContent">
          <h2 className="searchTitle">{getSearchTitle()}</h2>

          {loading && <div className="loading">Loading...</div>}

          {error && <div className="error">{error}</div>}

          {!loading && !error && results.length === 0 && (
            <div className="noResults">No results found</div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="resultsList">
                {type === "user" ? (
                  results.map((user) => (
                    <div
                      key={user._id}
                      className="userResult"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <img
                        src={
                          user.profilePicture
                            ? process.env.REACT_APP_PUBLIC_FOLDER + user.profilePicture
                            : process.env.REACT_APP_PUBLIC_FOLDER + "person/default.png"
                        }
                        alt=""
                        className="userResultImg"
                      />
                      <span className="userResultName">@{user.username}</span>
                    </div>
                  ))
                ) : (
                  results.map((post) => <Post key={post._id} post={post} />)
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="paginationButton"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="paginationInfo">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="paginationButton"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <Rightbar />
      </div>
    </>
  );
} 