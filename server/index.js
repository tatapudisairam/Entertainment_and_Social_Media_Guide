const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/AuthRoute");
const myLikeComment = require("./Routes/MyLikeCommentRoute")
const likesdislikes = require("./Routes/LikesDislikesRoute")
const { MONGO_URL, PORT } = process.env;
const connection = require('./db');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const User = require('./Models/UserModel');

const app = express();

// MongoDB connection
mongoose
  .connect("mongodb+srv://tatapudisairam5:SimbaRoy7609@cluster0.bsv2e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/thumbnails', express.static('thumbnails'));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'video' ? './uploads' : './temp';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// Create temporary directory for thumbnails if it doesn't exist
const tempDir = './temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const upload = multer({ storage });

// Upload route
app.post('/upload', upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
  const { userId, title, description, keyword, genre } = req.body;

  // Validate inputs
  if (!userId || !title || !description || !keyword || !genre || !req.files['video'] || !req.files['thumbnail']) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const videoPath = `uploads/${req.files['video'][0].filename}`;
    const thumbnailOriginalPath = path.join(tempDir, req.files['thumbnail'][0].filename);
    const thumbnailPath = path.join(__dirname, 'thumbnails', `${Date.now()}-resized-${req.files['thumbnail'][0].filename}`);

    await sharp(thumbnailOriginalPath)
      .resize({ width: 1280, height: 720, fit: 'cover' })
      .toFile(thumbnailPath);

    // Insert metadata into the database
    const sql = 'INSERT INTO videos (userId, title, description, path, keyword, genre, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [userId, title, description, videoPath, keyword, genre, `thumbnails/${path.basename(thumbnailPath)}`], (err, result) => {
      if (err) {
        console.error('Database insertion error:', err);
        return res.status(500).json({ error: 'Failed to save video and metadata' });
      }
      res.status(200).json({ message: 'Video and metadata uploaded successfully' });
    });

  } catch (err) {
    console.error('Error processing upload:', err);
    return res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Fetch videos route
app.get('/videos', async (req, res) => {
  const sql = 'SELECT * FROM videos';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Database fetching error:', err);
      return res.status(500).json({ error: 'Failed to fetch videos' });
    }
    res.status(200).json(results);
  });
});

// Fetch video duration route
app.get('/video-duration/:id', async (req, res) => {
  const videoId = req.params.id;

  const sql = 'SELECT path FROM videos WHERE id = ?';
  connection.query(sql, [videoId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error fetching video path:', err);
      return res.status(500).json({ error: 'Failed to fetch video path' });
    }

    const videoPath = path.join(__dirname, results[0].path);

    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('Error getting video duration:', err);
        return res.status(500).json({ error: 'Failed to get video duration' });
      }
      const durationInSeconds = metadata.format.duration;

      // Format the duration
      const duration = formatDuration(durationInSeconds);
      res.status(200).json(duration);
    });
  });
});

// Helper function to format duration
const formatDuration = (durationInSeconds) => {
  const totalSeconds = Math.floor(durationInSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
};

app.use("/", authRoute);
app.use("/", myLikeComment)
app.use("/", likesdislikes)

// Fetch video data by ID route
app.get('/videos/:id', async (req, res) => {
  const videoId = req.params.id;

  const sql = `
    SELECT v.*, 
           (SELECT COUNT(*) FROM likes WHERE video_id = ?) AS like_count,
           (SELECT COUNT(*) FROM dislikes WHERE video_id = ?) AS dislike_count
    FROM videos v 
    WHERE v.id = ?
  `;

  connection.query(sql, [videoId, videoId, videoId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error fetching video:', err);
      return res.status(404).json({ error: 'Video not found' });
    }
    res.status(200).json(results[0]);
  });
});

// Route to get like count
app.get('/likes/count', async (req, res) => {
  const videoId = req.query.videoId;
  const sql = 'SELECT COUNT(*) AS count FROM likes WHERE video_id = ?';
  connection.query(sql, [videoId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch like count' });
    }
    res.json({ count: results[0].count });
  });
});

// Route to get dislike count
app.get('/dislikes/count', async (req, res) => {
  const videoId = req.query.videoId;
  const sql = 'SELECT COUNT(*) AS count FROM dislikes WHERE video_id = ?';
  connection.query(sql, [videoId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch dislike count' });
    }
    res.json({ count: results[0].count });
  });
});

// Fetch comments by userId route
app.get('/user-comments', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const sql = `
    SELECT c.comment, c.uploaded_at, v.id AS video_id, v.title, v.path, v.thumbnail
    FROM comments c
    JOIN videos v ON c.video_id = v.id
    WHERE c.user_id = ?
    ORDER BY c.uploaded_at ASC
  `;

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching comments for user:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    res.status(200).json(results);
  });
});

// Recommend route
app.get('/recommend', async (req, res) => {
  const keyword = req.query.keyword;
  try {
    // Step 1: Fetch filtered and recommended IDs from the recommendation service
    const response = await axios.get(`http://localhost:5000/recommend?keyword=${keyword}`);

    const filteredVideoIds = response.data.filtered_video_ids;
    const recommendationIds = response.data.recommendation_ids;

    // Step 2: Fetch details for filtered video IDs
    const sqlFiltered = 'SELECT * FROM videos WHERE id IN (?)';
    connection.query(sqlFiltered, [filteredVideoIds], (err, filteredResults) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch filtered videos' });
      }

      // Step 3: Fetch details for recommended video IDs
      const sqlRecommended = 'SELECT * FROM videos WHERE id IN (?)';
      connection.query(sqlRecommended, [recommendationIds], (err, recommendedResults) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to fetch recommended videos' });
        }

        // Step 4: Maintain order for filtered videos
        const filteredMap = new Map(filteredResults.map(video => [video.id, video]));
        const recommendedMap = new Map(recommendedResults.map(video => [video.id, video]));

        const orderedFilteredVideos = filteredVideoIds.map(id => filteredMap.get(id));
        const orderedRecommendedVideos = recommendationIds.map(id => recommendedMap.get(id)).filter(video => video);

        // Step 5: Return the ordered results
        const data = {
          filteredVideos: orderedFilteredVideos,
          recommendedVideos: orderedRecommendedVideos,
        };

        res.json(data);
      });
    });

  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

const FormData = require('form-data');

app.post('/recommend-using-image', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const imagePath = req.file.path;
    const formData = new FormData();

    // Append the file to the form data
    formData.append('file', fs.createReadStream(imagePath));

    // Send image to Python backend
    const response = await axios.post('http://localhost:5000/recommendusingimage', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const similarImages = response.data.similar_images;

    // Fetch details for similar images from the database
    const sql = 'SELECT * FROM videos WHERE thumbnail IN (?)';
    connection.query(sql, [similarImages.map(img => `thumbnails/${img}`)], (err, results) => {
      if (err) {
        console.error('Database fetching error:', err);
        return res.status(500).json({ message: 'Failed to fetch video details' });
      }

      // Create a map for quick lookup
      const videoMap = new Map(results.map(video => [path.basename(video.thumbnail), video]));

      // Order the results based on the similarImages array
      const orderedVideos = similarImages.map(img => videoMap.get(img)).filter(video => video);

      res.status(200).json({
        similar_images: similarImages,
        video_details: orderedVideos
      });
    });

  } catch (error) {
    console.error('Error sending image to Python backend:', error);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

app.post('/comments', (req, res) => {
  const { user_id, video_uploader_id, video_id, comment } = req.body;
  const sql = 'INSERT INTO comments (user_id, video_uploader_id, video_id, comment) VALUES (?, ?, ?, ?)';

  connection.query(sql, [user_id, video_uploader_id, video_id, comment], (err, result) => {
    if (err) {
      console.error('Error inserting comment:', err);
      return res.status(500).json({ error: 'Failed to add comment' });
    }
    res.status(201).json({
      user_id,
      video_uploader_id,
      video_id,
      comment,
      uploaded_at: new Date()
    });
  });
});

// Endpoint to fetch comments for a specific video
app.get('/comments', (req, res) => {
  const videoId = req.query.videoId;
  const sql = 'SELECT * FROM comments WHERE video_id = ?';

  connection.query(sql, [videoId], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    res.json(results);
  });
});


// Fetch username by user ID route
app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Fetch comments for a specific video (visualization route)
app.get('/visualize-comments', (req, res) => {
  const videoId = req.query.video_id;

  if (!videoId) {
    return res.status(400).json({ error: 'video_id is required' });
  }

  const sql = 'SELECT * FROM comments WHERE video_id = ?';

  connection.query(sql, [videoId], (err, results) => {
    if (err) {
      console.error('Error fetching comments for video:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    res.status(200).json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
