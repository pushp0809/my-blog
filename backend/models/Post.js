const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['tech', 'lifestyle', 'food', 'travelling'],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'scheduled'],
      default: 'published',
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    user: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [
      {
        comment: { type: String },
        image: { type: String },
        commentBy: { type: ObjectId, ref: 'User' },
        commentAt: { type: Date, required: true },
        name: { type: String, default: 'A User' },
      },
    ],
  },
  { timestamps: true }
);

// Full-text search index on title, description, content, tags
postSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
