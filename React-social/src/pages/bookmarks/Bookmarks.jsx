import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import BookmarkFeed from "../../components/bookmarkFeed/BookmarkFeed";
import Rightbar from "../../components/rightbar/Rightbar";
import "./bookmarks.css";

export default function Bookmarks() {
  return (
    <>
      <Topbar />
      <div className="bookmarksContainer">
        <Sidebar />
        <BookmarkFeed />
        <Rightbar />
      </div>
    </>
  );
} 