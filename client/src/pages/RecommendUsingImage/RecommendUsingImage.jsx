import React, { useEffect, useState } from 'react';
import './RecommendUsingImage.css';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';

const RecommendUsingImage = ({ uploadedImage }) => {
  const [similarVideos, setSimilarVideos] = useState([]);
  const [durations, setDurations] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!uploadedImage) return;

      setLoading(true);
      const formData = new FormData();
      formData.append('file', uploadedImage);

      try {
        const response = await axios.post('http://localhost:4000/recommend-using-image', formData, {
          withCredentials: true,
        });
        const { video_details } = response.data;
        setSimilarVideos(video_details);

        // Fetch durations for each video
        video_details.forEach(video => {
          fetchVideoDuration(video.id);
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [uploadedImage]);

  const fetchVideoDuration = async (id) => {
    try {
      const response = await axios.get(`http://localhost:4000/video-duration/${id}`);
      if (response.data) {
        setDurations(prev => ({ ...prev, [id]: response.data }));
      }
    } catch (error) {
      console.error(`Failed to fetch duration for video ${id}:`, error);
    }
  };

  return (
    <div className='recommend-image'>
      {loading ? (
        <div className="loading-message">
          <p>Loading...</p>
        </div>
      ) : (
        <div className='video-list'>
          {similarVideos.map((video) => (
            <Link key={video.id} to={`/video/${video.id}`} className="card">
              <div className="thumbnail-container">
                <img src={`http://localhost:4000/${video.thumbnail}`} alt={video.title} />
                <p className="duration">{durations[video.id] ? durations[video.id] : 'Loading...'}</p>
              </div>
              <h2>{video.title}</h2>
              <h3>{video.userId}</h3>
              <p>{moment(video.uploaded_at).fromNow()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendUsingImage;
