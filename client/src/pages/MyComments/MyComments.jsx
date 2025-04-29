import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios';
import './MyComments.css'; 

const MyComments = ({ userId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [durations, setDurations] = useState({}); 

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/user-comments?userId=${userId}`, {
          withCredentials: true,
        });
        setComments(response.data);
        
        response.data.forEach(comment => {
          fetchVideoDuration(comment.video_id);
        });
      } catch (err) {
        setError('Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchComments();
    }
  }, [userId]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {comments.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <div className="comments-container">
          {comments.map((comment) => (
            <div key={comment.video_id} className="comment-row">
              <Link to={`/video/${comment.video_id}`} className="thumbnail">
                <img src={`http://localhost:4000/${comment.thumbnail}`} alt={comment.title} />
                <p className="duration">
                  {durations[comment.video_id] ? durations[comment.video_id] : 'Loading...'}
                </p>
              </Link>
              <div className="uploaded-at">
              {new Date(comment.uploaded_at).toLocaleString()} {/* Using moment for relative time */}
              </div>
              <div className="comment">
                {comment.comment}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComments;
