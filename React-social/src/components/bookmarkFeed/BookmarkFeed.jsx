import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import "./bookmarkFeed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function BookmarkFeed() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        setIsLoading(true);
        // Get the user's bookmarked posts
        const userRes = await axios.get(`/users?userId=${user._id}`);
        const bookmarkIds = userRes.data.bookmarks || [];
        
        if (bookmarkIds.length > 0) {
          // Fetch all bookmarked posts
          const posts = await Promise.all(
            bookmarkIds.map(async (postId) => {
              try {
                const postRes = await axios.get(`/posts/${postId}`);
                return postRes.data;
              } catch (err) {
                console.error(`Error fetching post ${postId}:`, err);
                return null;
              }
            })
          );

          // Filter out any null values from failed requests and sort by date
          const validPosts = posts
            .filter(post => post !== null)
            .sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt));

          setBookmarkedPosts(validPosts);
        } else {
          setBookmarkedPosts([]);
        }
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
        setBookmarkedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchBookmarkedPosts();
    }
  }, [user]);

  return (
    <div className="feed">
      <div className="feedWrapper">
        <h2 className="bookmarkTitle">Bookmarked Posts</h2>
        {isLoading ? (
          <div className="loadingBookmarks">Loading bookmarked posts...</div>
        ) : bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post) => (
            <Post key={post._id} post={post} />
          ))
        ) : (
          <div className="noBookmarks">No bookmarked posts yet</div>
        )}
      </div>
    </div>
  );
} 