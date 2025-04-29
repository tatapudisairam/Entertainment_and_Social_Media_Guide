import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import './MyLikes.css'; 

const MyLikes = ({ userId }) => {
  const [data, setData] = useState([]);
  const [durations, setDurations] = useState({});

  const fetchLikedVideos = async () => {
    try {
      const response = await fetch(`http://localhost:4000/mylikes?userId=${userId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const videos = await response.json();
      setData(videos);

      videos.forEach(video => {
        fetchVideoDuration(video.id);
      });
    } catch (error) {
      console.error('Failed to fetch liked videos:', error);
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

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  return (
    <div className='my-likes-feed'>
      {data.map((item, index) => (
        <Link key={index} to={`/video/${item.id}`} className="my-likes-card">
          <div className="my-likes-thumbnail-container">
            <img src={`http://localhost:4000/${item.thumbnail}`} alt={item.title} />
            <p className="my-likes-duration">{durations[item.id] ? durations[item.id] : 'Loading...'}</p>
          </div>
          <h2 className="my-likes-title">{item.title}</h2>
          <h3 className="my-likes-user">{item.userId}</h3>
          <p className="my-likes-uploaded">{moment(item.uploaded_at).fromNow()}</p>
        </Link>
      ))}
    </div>
  );
};

export default MyLikes;
