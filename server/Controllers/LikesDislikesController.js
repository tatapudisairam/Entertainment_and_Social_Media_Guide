const connection = require('../db');

// Like/unlike route
module.exports.PostLikes = async (req, res) => {
    const { userId, videoUploaderId, videoId, liked } = req.body;
  
    const sql = liked
      ? 'INSERT INTO likes (user_id, video_uploader_id, video_id,liked) VALUES (?, ?, ?, 1)'
      : 'DELETE FROM likes WHERE user_id = ? AND video_id = ?';
  
    const values = liked ? [userId, videoUploaderId, videoId] : [userId, videoId];
  
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error liking/unliking video:', err);
        return res.status(500).json({ error: 'Failed to toggle like status' });
      }
      res.status(200).json({ message: liked ? 'Liked' : 'Unliked' });
    });
  };



// Check if the user has liked a video
module.exports.GetLikes = async (req, res) => {
    const { userId, videoId } = req.query;
  
    const sql = 'SELECT COUNT(*) AS liked FROM likes WHERE user_id = ? AND video_id = ?';
    connection.query(sql, [userId, videoId], (err, results) => {
      if (err) {
        console.error('Error checking like status:', err);
        return res.status(500).json({ error: 'Failed to check like status' });
      }
      res.status(200).json({ liked: results[0].liked > 0 });
    });
  };
  

// Dislike/unlike route
module.exports.PostDislikes = async (req, res) => {
    const { userId, videoUploaderId, videoId, disliked } = req.body;
  
    const sql = disliked
      ? 'INSERT INTO dislikes (user_id, video_uploader_id, video_id, disliked) VALUES (?, ?, ?, 1)'
      : 'DELETE FROM dislikes WHERE user_id = ? AND video_id = ?';
  
    const values = disliked ? [userId, videoUploaderId, videoId] : [userId, videoId];
  
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error liking/unliking video:', err);
        return res.status(500).json({ error: 'Failed to toggle dislike status' });
      }
      res.status(200).json({ message: disliked ? 'Disliked' : 'Removed Dislike' });
    });
  };
  
  // Check if the user has disliked a video
 module.exports.GetDislikes = async (req, res) => {
    const { userId, videoId } = req.query;
  
    const sql = 'SELECT COUNT(*) AS disliked FROM dislikes WHERE user_id = ? AND video_id = ?';
    connection.query(sql, [userId, videoId], (err, results) => {
      if (err) {
        console.error('Error checking dislike status:', err);
        return res.status(500).json({ error: 'Failed to check dislike status' });
      }
      res.status(200).json({ disliked: results[0].disliked > 0 });
    });
  };