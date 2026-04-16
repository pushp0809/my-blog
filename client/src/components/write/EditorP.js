import React, { useState, useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import './editor.css';
import { useSelector } from 'react-redux';
import { editPost, dataURItoBlob, uplaodImages } from '../../helpers';
import { PulseLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import dompurify from 'dompurify';
import Footer from '../footer/Footer';

const CATEGORIES = ['tech', 'lifestyle', 'food', 'travelling'];
const STATUSES = [
  { value: 'published', label: '✅ Published' },
  { value: 'draft', label: '📝 Draft' },
  { value: 'scheduled', label: '🕐 Scheduled' },
];

const EditpostP = ({ placeholder, pflag, post }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => ({ ...state }));
  const inputref = useRef(null);
  const editor = useRef(null);

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setimage] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');
  const [scheduledAt, setScheduledAt] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cimage, setcimage] = useState(false);
  const scroll = useRef();

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: 'smooth' });
  }, [error]);

  useEffect(() => {
    if (post && post.user && post.user._id === user.id && pflag) {
      setContent(post.content || '');
      setTitle(post.title || '');
      setDescription(post.description || '');
      setCategory(post.category || '');
      setimage(post.image || '');
      setTags(post.tags ? post.tags.join(', ') : '');
      setStatus(post.status || 'published');
      
      if (post.scheduledAt) {
        // Format date for datetime-local input
        const date = new Date(post.scheduledAt);
        // adjust for timezone offset to get local time string in correct format
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setScheduledAt(date.toISOString().slice(0, 16));
      }
    } else {
      navigate('/');
    }
  }, [post, user.id, pflag, navigate]);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: placeholder || 'Start writing your post here…',
    sanitize: dompurify.sanitize,
    extraStyles: 'img {max-width: 100%}',
    theme: 'dark',
    toolbarButtonSize: 'middle',
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'h1', 'h2', 'h3', '|',
      'font', 'fontsize', 'paragraph', '|',
      'image', 'link', '|',
      'source', 'fullsize',
    ],
  }), [placeholder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') setTitle(value);
    if (name === 'description') setDescription(value);
    if (name === 'tags') setTags(value);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError(`${file.name} is too large — max 1MB allowed.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target.result;
      img.onload = function () {
        if (this.naturalWidth < 800 || this.naturalHeight < 400) {
          setError('Image resolution too low — minimum 800×400 required.');
        } else {
          setimage(ev.target.result);
          setcimage(true);
          setError('');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !content || !category || !image) {
      setError('All fields are required including a cover image.');
      return;
    }
    if (title.length < 10 || title.length > 120) {
      setError('Title must be between 10 and 120 characters.');
      return;
    }
    if (description.length < 30 || description.length > 200) {
      setError('Description must be between 30 and 200 characters.');
      return;
    }
    if (status === 'scheduled' && !scheduledAt) {
      setError('Please set a scheduled publish date/time.');
      return;
    }

    try {
      setLoading(true);
      let finalImageUrl = image;
      
      if (cimage) {
        const imgBlob = dataURItoBlob(image);
        const path = `${user.name}/blog_images`;
        const formData = new FormData();
        formData.append('path', path);
        formData.append('file', imgBlob);
        const postImg = await uplaodImages(formData, user?.token);
        if (postImg && postImg[0]) {
          finalImageUrl = postImg[0].url;
        }
      }

      const cleanHtml = dompurify.sanitize(content, { FORCE_BODY: true });

      // Parse tags: comma-separated → trimmed array
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const posted = await editPost(
        title,
        description,
        finalImageUrl,
        category,
        user.id,
        user?.token,
        cleanHtml,
        post._id,
        tagsArray,
        status,
        status === 'scheduled' ? scheduledAt : null
      );

      if (posted) navigate('/');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="editor_wrap">
      <div className="editor">
        <div className="form">
          <form method="post" encType="multipart/form-data">
            
            {/* Cover image */}
            <div className="selectedImg">
              {image && <img src={image} alt="Cover preview" />}
            </div>
            <p className="photoButton" onClick={() => inputref.current.click()}>
              {image ? '🖼 Change Cover Image' : '📷 Upload Cover Image'}
            </p>
            <input type="file" accept="image/*" hidden ref={inputref} onChange={handleImage} />

            {/* Title */}
            <label htmlFor="title">Post Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              placeholder="Enter a compelling title (10–120 chars)"
              onChange={handleChange}
            />

            {/* Description */}
            <label htmlFor="description">Short Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={description}
              placeholder="Brief summary shown in post listings (30–200 chars)"
              onChange={handleChange}
            />

            {/* Category */}
            <label htmlFor="category">Category *</label>
            <select onChange={(e) => setCategory(e.target.value)} value={category} className="cato" id="category">
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} className="catoo" value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>

            {/* Tags */}
            <label htmlFor="tags">Tags <span style={{ opacity: 0.6, fontSize: '0.8em' }}>(comma-separated, e.g. react, javascript)</span></label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              placeholder="react, javascript, webdev"
              onChange={handleChange}
            />

            {/* Status */}
            <label htmlFor="status">Post Status *</label>
            <select className="cato" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Scheduled date (only shown when status = scheduled) */}
            {status === 'scheduled' && (
              <>
                <label htmlFor="scheduledAt">Publish Date & Time *</label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  className="cato"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </>
            )}

            {/* Rich text editor */}
            <label>Post Content *</label>
            <div className="editor_main">
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
                onChange={(newContent) => setContent(newContent)}
              />
            </div>

            {error && (
              <div className="errorPopup" ref={scroll}>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onClick={handleEdit}
              className="btnsubt"
            >
              {loading ? <PulseLoader color="#fff" size={5} /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditpostP;