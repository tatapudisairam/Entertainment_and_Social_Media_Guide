const router = require('express').Router();
const {PostLikes, GetLikes, PostDislikes, GetDislikes} = require("../Controllers/LikesDislikesController")

router.get('/likes', GetLikes);
router.post('/likes', PostLikes);
router.get('/dislikes', GetDislikes)
router.post('/dislikes', PostDislikes)

module.exports = router