import { useEffect, useState } from "react";
import Post from "../post/Post";
import "./globalFeed.css";
import axios from "axios";
import Topbar from "../topbar/Topbar";
import Sidebar from "../sidebar/Sidebar";
import Rightbar from "../rightbar/Rightbar";

export default function GlobalFeed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/posts/"); // Ensure this URL is correct
        setPosts(res.data.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt)));
      } catch (error) {
        console.error("Error fetching global posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />
        <div className="feed">
          <div className="feedWrapper">
            <h2 className="globalFeedTitle">Global Feed</h2>
            {isLoading ? (
              <div className="loadingIndicator">Loading posts...</div>
            ) : (
              posts.map((p) => <Post key={p._id} post={p} />)
            )}
          </div>
        </div>
        <Rightbar />
      </div>
    </>
  );
}