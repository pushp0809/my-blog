const Post = require('../models/Post');
const User = require('../models/User');

// ── Create Post ───────────────────────────────────────────────────────────────
exports.newPost = async (req, res) => {
  try {
    const { title, description, content, image, category, tags, status, scheduledAt, user: userId } = req.body;

    const newPost = await new Post({
      title,
      description,
      content,
      image,
      category,
      tags: tags || [],
      status: status || 'published',
      scheduledAt: scheduledAt || null,
      user: userId,
    }).save();

    await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });
    await newPost.populate('user', 'name picture');

    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Edit Post ─────────────────────────────────────────────────────────────────
exports.editPost = async (req, res) => {
  try {
    const { id, title, description, content, image, category, tags, status, scheduledAt } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.title = title ?? post.title;
    post.description = description ?? post.description;
    post.content = content ?? post.content;
    post.image = image ?? post.image;
    post.category = category ?? post.category;
    post.tags = tags !== undefined ? tags : post.tags;
    post.status = status ?? post.status;
    post.scheduledAt = scheduledAt !== undefined ? scheduledAt : post.scheduledAt;

    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ── Get All Posts (with search + category filter + pagination) ────────────────
exports.allPost = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const size = Math.min(20, Math.max(1, parseInt(req.query.size) || 6));
    const { mpost, search } = req.body;
    const skip = (page - 1) * size;

    // Build query — only show published posts to public
    const query = { status: 'published' };

    // Category filter
    if (mpost && mpost !== 'all') {
      query.category = mpost;
    }

    // Search by title, tags, or content (text index)
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .skip(skip)
      .limit(size)
      .sort({ createdAt: -1 })
      .populate('user', 'name picture bio');

    return res.status(200).json({ posts, total, page, size });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// ── Get Single Article ────────────────────────────────────────────────────────
exports.getarticle = async (req, res) => {
  try {
    const { id } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: '!article' });

    // Increment views
    post.views += 1;
    await post.save();

    const user = await User.findById(post.user).select('name picture bio');
    if (!user) return res.status(404).json({ msg: '!user' });

    post.user = user;
    return res.status(200).json({ msg: post });
  } catch (error) {
    return res.status(400).json({ msg: 'error' });
  }
};

// ── Get All Post Data (raw, for edit) ─────────────────────────────────────────
exports.getallpostdata = async (req, res) => {
  try {
    const { id } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: 'Not found' });
    return res.status(200).json({ msg: post });
  } catch (error) {
    return res.status(400).json({ msg: 'error' });
  }
};

// ── Post a Comment ────────────────────────────────────────────────────────────
// Fixed: was finding by user field, now correctly by post _id
exports.postcomment = async (req, res) => {
  try {
    const { name, image, content, id1, id2 } = req.body;
    // id2 = postId (the post being commented on)
    const post = await Post.findById(id2);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.comments.push({
      comment: content,
      image: image || '',
      commentBy: id1,
      commentAt: new Date(),
      name: name || 'Anonymous',
    });
    await post.save();

    return res.status(201).json({ msg: 'ok' });
  } catch (error) {
    return res.status(400).json({ msg: 'An Error Occurred' });
  }
};

// ── Get Comments for a Post ───────────────────────────────────────────────────
// Fixed: was finding by user field, now correctly by post _id
exports.getcomment = async (req, res) => {
  try {
    const { id } = req.body;
    const post = await Post.findById(id).select('comments');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    return res.status(200).json(post.comments);
  } catch (error) {
    return res.status(400).json({ msg: 'error' });
  }
};

// ── Search Posts ──────────────────────────────────────────────────────────────
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const size = Math.min(20, parseInt(req.query.size) || 6);
    const skip = (page - 1) * size;

    if (!q || !q.trim()) {
      return res.status(200).json({ posts: [], total: 0, page, size });
    }

    // Search across title, description, content, and tags using text index
    const query = {
      status: 'published',
      $text: { $search: q.trim() },
    };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(size)
      .populate('user', 'name picture');

    return res.status(200).json({ posts, total, page, size });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
