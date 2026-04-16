const express = require('express');
const router = express.Router();
const { authUser } = require('../middleware/auth');

const {
  newPost,
  editPost,
  allPost,
  getarticle,
  getallpostdata,
  postcomment,
  getcomment,
  searchPosts,
} = require('../controllers/post');

// ── Post CRUD ─────────────────────────────────────────────────────────────────
router.post('/post', authUser, newPost);
router.post('/editPost', authUser, editPost);
router.post('/getallpost', allPost);
router.post('/getarticle', getarticle);
router.post('/getallpostdata', getallpostdata);

// ── Comments ──────────────────────────────────────────────────────────────────
router.post('/postcomment', postcomment);
router.post('/getcomment', getcomment);

// ── Search ────────────────────────────────────────────────────────────────────
// GET /searchposts?q=keyword&page=1&size=6
router.get('/searchposts', searchPosts);

module.exports = router;
