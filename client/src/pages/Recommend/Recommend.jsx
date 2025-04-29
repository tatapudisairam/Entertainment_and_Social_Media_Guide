import React, { useEffect, useState } from 'react';
import './Recommend.css';
import { Link, useLocation } from 'react-router-dom';
import moment from 'moment';

const Recommend = () => {
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [durations, setDurations] = useState({});
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const keyword = query.get('keyword');

  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      try {
        const response = await fetch(`http://localhost:4000/recommend?keyword=${keyword}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setRecommendedVideos([...data.filteredVideos, ...data.recommendedVideos]); 

        data.filteredVideos.concat(data.recommendedVideos).forEach(video => {
          fetchVideoDuration(video.id);
        });
      } catch (error) {
        console.error('Failed to fetch recommended videos:', error);
      }
    };

    fetchRecommendedVideos();
  }, [keyword]);

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

  return (
    <div className='recommend'>
      {recommendedVideos.map((item, index) => (
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

export default Recommend;
