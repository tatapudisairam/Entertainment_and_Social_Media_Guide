const connection = require('../db');

module.exports.MyLikes = async (req, res) => {
    const userId = req.query.userId; // Get userId from the query parameters
  
    const sql = 'SELECT * FROM likes WHERE user_id = ?';
    connection.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching likes:', err);
        return res.status(500).json({ error: 'Failed to fetch likes' });
      }
  
      // Extract video IDs from the liked records
      const videoIds = results.map(like => like.video_id);
  
      // Fetch video details for these IDs
      const sqlVideos = 'SELECT * FROM videos WHERE id IN (?)';
      connection.query(sqlVideos, [videoIds], (err, videoResults) => {
        if (err) {
          console.error('Error fetching videos for likes:', err);
          return res.status(500).json({ error: 'Failed to fetch videos' });
        }
  
        res.status(200).json(videoResults); 
      });
    });
  };