import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import './PlayVideo.css';
import axios from 'axios';

const PlayVideo = ({ userId }) => {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [uploaderUsername, setUploaderUsername] = useState('');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  const getUsername = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:4000/user/${userId}`, { withCredentials: true });
      return response.data?.username || null;
    } catch (error) {
      console.error('Error fetching username:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/videos/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setVideoData(data);
        const username = await getUsername(data.userId);
        setUploaderUsername(username);

        // Fetch like and dislike counts
        await fetchLikeDislikeCounts(data.id);

        fetchComments(data.id);
        checkIfLiked(data.id);
        checkIfDisliked(data.id);
      } catch (error) {
        console.error('Failed to fetch video data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLikeDislikeCounts = async (videoId) => {
      try {
        const likeResponse = await axios.get(`http://localhost:4000/likes/count?videoId=${videoId}`);
        const dislikeResponse = await axios.get(`http://localhost:4000/dislikes/count?videoId=${videoId}`);

        setLikeCount(likeResponse.data.count);
        setDislikeCount(dislikeResponse.data.count);
      } catch (error) {
        console.error('Error fetching like/dislike counts:', error);
      }
    };

    const fetchComments = async (videoId) => {
      try {
        const response = await fetch(`http://localhost:4000/comments?videoId=${videoId}`);
        const data = await response.json();
        const commentsWithUsernames = await Promise.all(data.map(async (comment) => {
          const username = await getUsername(comment.user_id);
          return {
            ...comment,
            username: username || 'Unknown',
          };
        }));

        commentsWithUsernames.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
        setComments(commentsWithUsernames);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    const checkIfLiked = async (videoId) => {
      try {
        const response = await axios.get(`http://localhost:4000/likes?userId=${userId}&videoId=${videoId}`);
        setLiked(response.data.liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    const checkIfDisliked = async (videoId) => {
      try {
        const response = await axios.get(`http://localhost:4000/dislikes?userId=${userId}&videoId=${videoId}`);
        setDisliked(response.data.disliked);
      } catch (error) {
        console.error('Error checking dislike status:', error);
      }
    };

    fetchVideoData();
  }, [id, userId]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    try {
      const response = await fetch('http://localhost:4000/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          video_uploader_id: videoData.userId,
          video_id: id,
          comment: comment,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        const newUsername = await getUsername(userId);
        setComments([{ ...newComment, username: newUsername || 'You' }, ...comments]);
        setComment('');
      } else {
        console.error('Failed to submit comment:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (disliked) {
      await handleDislikeToggle(); // Remove dislike first
    }

    try {
      const response = await axios.post('http://localhost:4000/likes', {
        userId,
        videoUploaderId: videoData.userId,
        videoId: videoData.id,
        liked: !liked,
      });

      if (response.status === 200) {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1); // Update like count
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
    }
  };

  const handleDislikeToggle = async () => {
    if (liked) {
      await handleLikeToggle(); // Remove like first
    }

    try {
      const response = await axios.post('http://localhost:4000/dislikes', {
        userId,
        videoUploaderId: videoData.userId,
        videoId: videoData.id,
        disliked: !disliked,
      });

      if (response.status === 200) {
        setDisliked(!disliked);
        setDislikeCount(disliked ? dislikeCount - 1 : dislikeCount + 1); // Update dislike count
      }
    } catch (error) {
      console.error('Error toggling dislike status:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!videoData) {
    return <div>Video not found</div>;
  }

  return (
    <div className="video-container">
      <div className="video-player">
        <video controls>
          <source src={`http://localhost:4000/${videoData.path}`} type="video/mp4" />
        </video>
        <h2>{videoData.title}</h2>
        <h3>Uploaded by: {uploaderUsername || 'Loading...'}</h3>
        <p>Uploaded: {moment(videoData.uploaded_at).fromNow()}</p>

        <button
          className={liked ? 'liked' : ''}
          onClick={handleLikeToggle}>
          {liked ? `Liked: ${likeCount}` : `Like: ${likeCount}`}
        </button>
        <button
          className={disliked ? 'disliked' : ''}
          onClick={handleDislikeToggle}>
          {disliked ? `Disliked: ${dislikeCount}` : `Dislike: ${dislikeCount}`}
        </button>
      </div>
      <div className="comments-section">
        <h3>Comments:</h3>
        <div className="comment-input-container">
          <input
            type="text"
            value={comment}
            onChange={handleCommentChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your comment..."
          />
          <button onClick={handleCommentSubmit}>Send</button>
        </div>
        <div className="comments-list">
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <p><strong>{comment.username}:</strong> {comment.comment}</p>
              <p className="timestamp">{moment(comment.uploaded_at).fromNow()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayVideo
