import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Upload.css'; 

const Tooltip = ({ message, visible }) => {
  return (
    <div className={`tooltip ${visible ? 'visible' : ''}`}>
      {message}
    </div>
  );
};

const Upload = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState([]);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    console.log("User ID:", userId);
  }, [userId]);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadPercentage(0);
  };

  const onThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleGenreChange = (e) => {
    const selectedGenre = e.target.value;
    if (e.target.checked) {
      setGenre([...genre, selectedGenre]);
    } else {
      setGenre(genre.filter((g) => g !== selectedGenre));
    }
  };

  const onUpload = async () => {
    if (!userId || !file || !thumbnail || !title || !description || !keyword || genre.length === 0) {
      Swal.fire('Error', 'Please provide all required inputs (video, thumbnail, title, description, keyword, and genre)', 'error');
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("thumbnail", thumbnail);
    formData.append("userId", userId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("keyword", keyword);
    formData.append("genre", genre.join(','));

    try {
      setIsUploading(true);
      const res = await axios.post("http://localhost:4000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadPercentage(percentCompleted);
        },
      });

      if (res.status === 200) {
        Swal.fire('Success!', 'Video and metadata uploaded successfully!', 'success');
        resetForm();
      }
    } catch (err) {
      Swal.fire('Error!', 'Failed to upload video and metadata', 'error');
    } finally {
      setIsUploading(false);
      setUploadPercentage(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setThumbnail(null);
    setTitle("");
    setDescription("");
    setKeyword("");
    setGenre([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = null;
    }
  };

  return (
    <div className="upload-container">
      <h2 className="title">Upload Video</h2>
      <input
        type="text"
        className="input"
        placeholder="Enter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="textarea"
        placeholder="Enter description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      
      <div className="input-wrapper" style={{ position: 'relative' }}>
        <input
          type="text"
          className="input"
          placeholder="Enter keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
        />
        <Tooltip
          message="If a user types this keyword in the search field, they will get this video."
          visible={showTooltip}
        />
      </div>

      <div className="genre-selection">
        <label>Select Genre:</label>
        <div className="checkbox-container">
          {[
            "Action", "Adventure", "Comedy", "Romance", "Crime",
            "Shopping", "Music", "Gaming", "News", "Sports",
            "Fashion & Beauty", "Kids or Cartoons", "Food or Cooking",
            "Health or Fitness", "Education", "Animals or Pets",
            "Travel", "Stories"
          ].map((g) => (
            <label key={g} className="checkbox-label">
              <input type="checkbox" value={g} onChange={handleGenreChange} />
              {g}
            </label>
          ))}
        </div>
      </div>

      <label>Video File:</label>
      <input
        type="file"
        className="file-input"
        onChange={onFileChange}
        accept="video/*"
        ref={fileInputRef}
        required
      />
      <label>Thumbnail Image:</label>
      <input
        type="file"
        className="file-input"
        onChange={onThumbnailChange}
        accept="image/*"
        ref={thumbnailInputRef}
        required
      />
      <button className="button" onClick={onUpload}>Upload</button>

      {isUploading && (
        <div className="progress-overlay">
          <div className="progress-container">
            <CircularProgressbar
              value={uploadPercentage}
              text={`${uploadPercentage}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: `rgba(62, 152, 199, ${uploadPercentage / 100})`,
                textColor: '#fff',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
