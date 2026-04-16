const express = require('express');
const router = express.Router();
const { authUser } = require('../middleware/auth');

const {
  register,
  login,
  loginSuccess,
  getUser,
  fetchprof,
  uploadprofile,
  showmyposts,
  deletepost,
  changeabout,
} = require('../controllers/user');

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/login/success', loginSuccess);

// Logout is stateless (client deletes token/cookie)
router.get('/logout', (req, res) => {
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.status(200).json({ success: true });
});

// ── User Profile ──────────────────────────────────────────────────────────────
router.get('/getUser/:userId', getUser);
router.post('/fetchprof', fetchprof);
router.put('/uploadprofile', authUser, uploadprofile);
router.post('/changeabout', changeabout);

// ── Posts (user-scoped) ───────────────────────────────────────────────────────
router.post('/showmyposts', showmyposts);
router.post('/deletepost', deletepost);

module.exports = router;
