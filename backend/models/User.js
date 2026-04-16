const { model, Schema } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      trim: true,
      default:
        'https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    posts: {
      type: [Schema.Types.ObjectId],
      ref: 'Post',
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
