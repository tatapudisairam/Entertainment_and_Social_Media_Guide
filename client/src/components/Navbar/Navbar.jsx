import React, { useState, useEffect, useRef } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FaUserCircle } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';

const Navbar = ({ onImageUpload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const handleSearch = () => {
    if (searchTerm) {
      navigate(`/recommend?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:4000/recommend-using-image', formData, {
        withCredentials: true,
      });
      onImageUpload(file);
      navigate('/recommend-using-image');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  useEffect(() => {
    const isSearchResultsPage = location.pathname.startsWith('/recommend');
    if (!isSearchResultsPage) {
      setSearchTerm('');
    }
  }, [location]);

  return (
    <nav className="navbar">
      <div className="input-container">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
          />
          <BiSearch className="search-icon" onClick={handleSearch} />
        </div>
        <div className="image-upload-container">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageChange} 
            style={{ display: 'none' }} // Hide the default file input
          />
          <FontAwesomeIcon 
            icon={faImage} 
            className="upload-icon" 
            onClick={() => fileInputRef.current.click()} 
          />
        </div>
      </div>
      <div className="profile-container">
        <FaUserCircle className="profile-icon" />
      </div>
    </nav>
  );
};

export default Navbar;
