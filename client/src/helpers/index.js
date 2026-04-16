import axios from 'axios';

const API = 'http://localhost:5002';

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const clearCookie = (cookieName) => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ── Image helpers ─────────────────────────────────────────────────────────────
export const dataURItoBlob = (dataURI) => {
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else byteString = unescape(dataURI.split(',')[1]);

  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeString });
};

export const uplaodImages = async (formData, token = null) => {
  try {
    const { data } = await axios.post(`${API}/uploadImages`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    return error.response?.data?.message;
  }
};

// ── Post CRUD helpers ─────────────────────────────────────────────────────────
export const createPost = async (
  title, description, image, category, userId, token, cleanHtml, tags = [], status = 'published', scheduledAt = null
) => {
  try {
    const { data } = await axios.post(
      `${API}/post`,
      { title, description, image, category, user: userId, content: cleanHtml, tags, status, scheduledAt },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return data;
  } catch (error) {
    return error.response?.data?.message;
  }
};

export const editPost = async (
  title, description, image, category, userId, token, cleanHtml, id, tags = [], status = 'published', scheduledAt = null
) => {
  try {
    const { data } = await axios.post(
      `${API}/editPost`,
      { title, description, image, category, user: userId, content: cleanHtml, id, tags, status, scheduledAt },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return data;
  } catch (error) {
    return error.response?.data?.message;
  }
};

export const deletepost = async (postid, userid) => {
  try {
    const { data } = await axios.post(`${API}/deletepost`, { postid, userid });
    return data;
  } catch (error) {
    return { msg: error };
  }
};

// ── Get all posts (paginated, filtered, searchable) ───────────────────────────
export const getAllPost = async (activePage, LIMIT, mpost, search = '') => {
  try {
    const { data } = await axios.post(
      `${API}/getallpost?page=${activePage}&size=${LIMIT}`,
      { mpost, search }
    );
    return data;
  } catch (error) {
    return { posts: [], total: 0 };
  }
};

// ── Search posts ──────────────────────────────────────────────────────────────
export const searchPosts = async (q, page = 1, size = 6) => {
  try {
    const { data } = await axios.get(
      `${API}/searchposts?q=${encodeURIComponent(q)}&page=${page}&size=${size}`
    );
    return data;
  } catch (error) {
    return { posts: [], total: 0 };
  }
};

// ── Article helpers ───────────────────────────────────────────────────────────
export const getarticle = async (id) => {
  try {
    const { data } = await axios.post(`${API}/getarticle`, { id });
    return data;
  } catch (error) {
    return error;
  }
};

export const getallpostdata = async (id) => {
  try {
    const data = await axios.post(`${API}/getallpostdata`, { id });
    return data;
  } catch (error) {
    return { msg: 'error' };
  }
};

// ── Comment helpers ───────────────────────────────────────────────────────────
export const createcomment = async (name, image, content, id1, id2) => {
  try {
    const { data } = await axios.post(`${API}/postcomment`, {
      name, image, content, id1, id2,
    });
    return data;
  } catch (error) {
    return;
  }
};

export const getcomment = async (id) => {
  try {
    const { data } = await axios.post(`${API}/getcomment`, { id });
    return [...data, { msg: 'ok' }];
  } catch (error) {
    return { msg: 'error' };
  }
};

// ── Profile helpers ───────────────────────────────────────────────────────────
export const fetchprof = async (id) => {
  try {
    const { data } = await axios.post(`${API}/fetchprof`, { id });
    return data;
  } catch (error) {
    return { msg: 'error' };
  }
};

export const uploadProfilePicture = async (picture, about, token = null) => {
  try {
    const { data } = await axios.put(
      `${API}/uploadprofile`,
      { picture, about },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    );
    return data;
  } catch (error) {
    return error.response?.data?.message;
  }
};

export const changeabout = async (about, id) => {
  try {
    const { data } = await axios.post(`${API}/changeabout`, { about, id });
    return data;
  } catch (error) {
    return;
  }
};

export const getUser = async (userId) => {
  try {
    const { data } = await axios.get(`${API}/getUser/${userId}`);
    return data;
  } catch (error) {
    return error.response?.data?.message;
  }
};

export const showmyposts = async (id) => {
  try {
    const { data } = await axios.post(`${API}/showmyposts`, { id });
    return data;
  } catch (error) {
    return;
  }
};
