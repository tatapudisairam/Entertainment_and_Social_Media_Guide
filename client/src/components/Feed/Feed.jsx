import React, { useEffect, useState } from 'react';
import './Feed.css';
import { Link } from 'react-router-dom';
import moment from 'moment';

const Feed = () => {
  const [data, setData] = useState([]);
  const [durations, setDurations] = useState({}); 

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:4000/videos'); 
      if (!response.ok) throw new Error('Network response was not ok');
      const videos = await response.json();
      setData(fisherYatesShuffle(videos)); // Shuffle the data after fetching

      videos.forEach(video => {
        fetchVideoDuration(video.id);
      });
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const fetchVideoDuration = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/video-duration/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const duration = await response.json();
      setDurations(prev => ({ ...prev, [id]: duration })); 
    } catch (error) {
      console.error(`Failed to fetch duration for video ${id}:`, error);
    }
  };

  // Fisher-Yates Shuffle Algorithm
  const fisherYatesShuffle = (array) => {
    const shuffledArray = [...array]; 
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className='feed'>
      {data.map((item, index) => (
        <Link key={index} to={`/video/${item.id}`} className="card"> 
          <div className="thumbnail-container">
            <img src={`http://localhost:4000/${item.thumbnail}`} alt={item.title} />
            <p className="duration">{durations[item.id] ? durations[item.id] : 'Loading...'}</p>
          </div>
          <h2>{item.title}</h2>
          <h3>{item.userId}</h3>
          <p>{moment(item.uploaded_at).fromNow()}</p>
        </Link>
      ))}
    </div>
  );
};

export default Feed;
