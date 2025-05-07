import Home from "./pages/home/Home";
import GlobalFeed from "./components/globalFeed/GlobalFeed"; // Import GlobalFeed
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import Bookmarks from "./pages/bookmarks/Bookmarks";
import SearchResults from "./pages/search/SearchResults";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={user ? <Home /> : <Login />} />
        <Route path="/globalfeed" element={user ? <GlobalFeed /> : <Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/globalfeed" element={user ? <GlobalFeed /> : <Navigate to="/login" />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/search/:type/:query" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;
