// File: src/components/share/Share.jsx

import "./share.css";
import { PermMedia, Label, Room, EmojiEmotions, Cancel } from "@mui/icons-material";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const EMOTIONS = [
  { name: "Happy", emoji: "😊" },
  { name: "Loved", emoji: "🥰" },
  { name: "Excited", emoji: "🤩" },
  { name: "Sad", emoji: "😢" },
  { name: "Angry", emoji: "😠" },
  { name: "Thankful", emoji: "🙏" },
  { name: "Blessed", emoji: "😇" },
  { name: "Tired", emoji: "😫" },
  { name: "Motivated", emoji: "💪" },
  { name: "Peaceful", emoji: "😌" }
];

export default function Share() {
  const { user } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const desc = useRef();
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [location, setLocation] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showEmotions, setShowEmotions] = useState(false);
  const [feeling, setFeeling] = useState("");
  const [currentTag, setCurrentTag] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    const newPost = {
      userId: user._id,
      desc: desc.current.value,
      tags,
      location,
      feeling,
    };

    if (file) {
      const data = new FormData();
      const fileName = Date.now() + file.name;
      data.append("name", fileName);
      data.append("file", file);
      newPost.img = fileName;
      try {
        await axios.post("/upload", data);
      } catch (err) {
        console.log(err);
      }
    }

    try {
      await axios.post("/posts", newPost);
      setTags([]);
      setLocation("");
      setFeeling("");
      setFile(null);
      desc.current.value = "";
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentTag.trim()) {
        if (!tags.includes(currentTag.trim())) {
          setTags([...tags, currentTag.trim()]);
        }
        setCurrentTag("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const selectEmotion = (emotion, emoji) => {
    setFeeling(`${emotion} ${emoji}`);
    setShowEmotions(false);
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={user.profilePicture ? PF + user.profilePicture : PF + "person/default.png"}
            alt=""
          />
          <input
            placeholder={`What's in your mind ${user.username}?`}
            className="shareInput"
            ref={desc}
          />
        </div>
        <hr className="shareHr" />

        {tags.length > 0 && (
          <div className="tagContainer">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}<span className="tagRemove" onClick={() => removeTag(tag)}>×</span>
              </span>
            ))}
          </div>
        )}

        {location && (
          <div className="locationDisplay">
            <Room htmlColor="green" className="shareIcon" />
            <span>{location}</span>
            <span className="tagRemove" onClick={() => setLocation("")}>×</span>
          </div>
        )}

        {feeling && (
          <div className="feelingDisplay">
            <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
            <span>{feeling}</span>
            <span className="tagRemove" onClick={() => setFeeling("")}>×</span>
          </div>
        )}

        {file && (
          <div className="shareImgContainer">
            <img className="shareImg" src={URL.createObjectURL(file)} alt="" />
            <Cancel className="shareCancelImg" onClick={() => setFile(null)} />
          </div>
        )}

        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <div className="shareOption">
              <label htmlFor="file" className="fileUploadLabel">
                <PermMedia htmlColor="tomato" className="shareIcon" />
                <span className="shareOptionText">Photo or Video</span>
              </label>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="shareOption" onClick={() => setShowTagInput(!showTagInput)}>
              <Label htmlColor="blue" className="shareIcon" />
              <span className="shareOptionText">Tag</span>
            </div>

            <div className="shareOption" onClick={() => setShowLocationInput(!showLocationInput)}>
              <Room htmlColor="green" className="shareIcon" />
              <span className="shareOptionText">Location</span>
            </div>

            <div className="shareOption" onClick={() => setShowEmotions(!showEmotions)}>
              <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
              <span className="shareOptionText">Feelings</span>
            </div>
          </div>

          {showTagInput && (
            <div className="inputContainer">
              <input
                type="text"
                placeholder="Add tags (press Enter)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagSubmit}
                className="tagInput"
              />
            </div>
          )}

          {showLocationInput && (
            <div className="inputContainer">
              <input
                type="text"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="locationInput"
              />
            </div>
          )}

          {showEmotions && (
            <div className="emotionsScrollContainer">
              <div className="emotionsContainer">
                {EMOTIONS.map(({ name, emoji }) => (
                  <div key={name} className="emotionItem" onClick={() => selectEmotion(name, emoji)}>
                    <span className="emotionEmoji">{emoji}</span>
                    <span className="emotionText">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="shareButton" type="submit">
            Share
          </button>
        </form>
      </div>
    </div>
  );
}