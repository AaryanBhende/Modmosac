import "./sidebar.css";
import { RssFeed, PlayCircleFilledOutlined, Bookmark } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <ul className="sidebarList">
          <li className="sidebarListItem">
            <RssFeed className="sidebarIcon" />
            <Link to="/" className="sidebarListItemText">My Feed</Link>
          </li>

          <li className="sidebarListItem">
            <RssFeed className="sidebarIcon" />
            <Link to="/globalfeed" className="sidebarListItemText">Global Feed</Link>
          </li>

          <li className="sidebarListItem">
            <PlayCircleFilledOutlined className="sidebarIcon" />
            <span className="sidebarListItemText">Videos</span>
          </li>

          <li className="sidebarListItem">
            <Bookmark className="sidebarIcon" />
            <Link to="/bookmarks" className="sidebarListItemText">Bookmarks</Link>
          </li>
        </ul>
        <button className="sidebarButton">Show More</button>
        <hr className="sidebarHr" />
      </div>
    </div>
  );
}
