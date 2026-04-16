const { validateEmail, validateLength } = require('../helper/validation');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcrypt');
const { generateToken } = require('../helper/token');

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, temail, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    }
    if (!validateEmail(temail)) {
      return res.status(400).json({ message: 'Please enter a valid email.' });
    }
    if (!validateLength(password, 6, 50)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: temail.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await new User({
      name: name.trim(),
      email: temail.toLowerCase(),
      password: hashed,
    }).save();

    const token = generateToken({ id: user._id.toString() }, '15d');
    return res.status(201).json({
      id: user._id,
      name: user.name,
      picture: user.picture,
      bio: user.bio,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { temail, password } = req.body;

    if (!temail || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: temail.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials. Please try again.' });
    }

    const token = generateToken({ id: user._id.toString() }, '15d');
    return res.status(200).json({
      id: user._id,
      name: user.name,
      picture: user.picture,
      bio: user.bio,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ── Get User (public profile) ─────────────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name picture bio posts');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Fetch profile (by body id) ────────────────────────────────────────────────
exports.fetchprof = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await User.findById(id).select('name picture bio _id');
    if (!data) return res.status(404).json({ msg: 'User not found' });
    return res.status(200).json({ msg: data });
  } catch (error) {
    return res.status(400).json({ msg: 'error' });
  }
};

// ── Upload / update profile picture + bio ─────────────────────────────────────
exports.uploadprofile = async (req, res) => {
  try {
    const { picture, bio } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (picture) user.picture = picture;
    if (bio !== undefined) user.bio = bio;
    await user.save();

    return res.status(200).json({
      picture: user.picture,
      bio: user.bio,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Show my posts ─────────────────────────────────────────────────────────────
exports.showmyposts = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const posts = await Post.find({ user: id })
      .populate('user', 'name picture')
      .sort({ createdAt: -1 });

    return res.status(200).json({ msg: posts });
  } catch (error) {
    return res.status(400).json({ msg: 'error' });
  }
};

// ── Delete a post ─────────────────────────────────────────────────────────────
exports.deletepost = async (req, res) => {
  try {
    const { postid, userid } = req.body;
    await Post.deleteOne({ _id: postid });

    await User.findByIdAndUpdate(userid, { $pull: { posts: postid } });

    return res.status(200).json({ msg: 'ok' });
  } catch (error) {
    return res.status(400).json({ msg: 'Error deleting post' });
  }
};

// ── Update bio ────────────────────────────────────────────────────────────────
exports.changeabout = async (req, res) => {
  try {
    const { about, id } = req.body;
    await User.findByIdAndUpdate(id, { bio: about });
    return res.status(200).json({ msg: 'Saved successfully' });
  } catch (error) {
    return res.status(400).json({ msg: 'error' });
  }
};
