const {MyLikes} = require("../Controllers/MyLikeCommentController")
const router = require('express').Router();

router.get('/mylikes', MyLikes);

module.exports = router