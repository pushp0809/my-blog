import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { deletepost } from '../../../helpers';
import { RWebShare } from 'react-web-share';
import { BsThreeDotsVertical } from 'react-icons/bs';

function PostCard({ post, type }) {
  const { user } = useSelector((state) => ({ ...state }));
  const navigate = useNavigate();
  const [menus, showmenu] = React.useState(false);

  const utcTimeString = post?.createdAt || 'N/A';
  const localTimeString = new Date(utcTimeString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const navigateToArticle = () => navigate(`/article/${post._id}`);

  const deleteposts = async (postid) => {
    try {
      await deletepost(postid, user.id);
      window.location.reload();
    } catch (error) {
      // ignore
    }
  };

  const editposts = () => navigate(`/edit/${post._id}`);

  const tags = post?.tags || [];

  return (
    <div className="item">
      {/* Cover image */}
      <div className="left" onClick={navigateToArticle} style={{ cursor: 'pointer' }}>
        <img src={post?.image || ''} alt={post?.title} />
      </div>

      {/* Content */}
      <div className="right">
        <div className="title">
          {/* Status badge (only for post owner) */}
          {type === 'powner' && post?.status && post.status !== 'published' && (
            <span className="status-badge" data-status={post.status}>
              {post.status === 'draft' ? '📝 Draft' : '🕐 Scheduled'}
            </span>
          )}

          <h3 onClick={navigateToArticle}>{post?.title}</h3>

          {/* Views (only for non-owner) */}
          {type !== 'powner' && (
            <div className="view_post">
              {post?.views || 0}
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="13px" height="13px" viewBox="-3.5 0 32 32">
                <path d="M12.406 13.844c1.188 0 2.156 0.969 2.156 2.156s-0.969 2.125-2.156 2.125-2.125-0.938-2.125-2.125 0.938-2.156 2.125-2.156zM12.406 8.531c7.063 0 12.156 6.625 12.156 6.625 0.344 0.438 0.344 1.219 0 1.656 0 0-5.094 6.625-12.156 6.625s-12.156-6.625-12.156-6.625c-0.344-0.438-0.344-1.219 0-1.656 0 0 5.094-6.625 12.156-6.625zM12.406 21.344c2.938 0 5.344-2.406 5.344-5.344s-2.406-5.344-5.344-5.344-5.344 2.406-5.344 5.344 2.406 5.344 5.344 5.344z" />
              </svg>
              &nbsp;views
            </div>
          )}
        </div>

        {/* Description */}
        <div className="description">{post?.description}</div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="post-tags">
            {tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="post-tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Profile / meta row */}
        {type === 'powner' ? (
          <div className="profile_data">
            <div className="view_post_profile bluev">
              {post?.views || 0}
              <svg fill="currentColor" width="16px" height="16px" viewBox="-3.5 0 32 32">
                <path d="M12.406 13.844c1.188 0 2.156 0.969 2.156 2.156s-0.969 2.125-2.156 2.125-2.125-0.938-2.125-2.125 0.938-2.156 2.125-2.156zM12.406 8.531c7.063 0 12.156 6.625 12.156 6.625 0.344 0.438 0.344 1.219 0 1.656 0 0-5.094 6.625-12.156 6.625s-12.156-6.625-12.156-6.625c-0.344-0.438-0.344-1.219 0-1.656 0 0 5.094-6.625 12.156-6.625zM12.406 21.344c2.938 0 5.344-2.406 5.344-5.344s-2.406-5.344-5.344-5.344-5.344 2.406-5.344 5.344 2.406 5.344 5.344 5.344z" />
              </svg>
            </div>
            |
            <div className="green" onClick={editposts} style={{ cursor: 'pointer', color: '#4ade80' }}>Edit</div>
            |
            <div className="red" onClick={() => deleteposts(post._id)}>Delete</div>

            <RWebShare
              data={{
                text: 'Check out this post on My Blog',
                url: `/article/${post?._id}`,
                title: post?.title || 'My Blog',
              }}
            >
              <div className="sharepostmy">Share</div>
            </RWebShare>
          </div>
        ) : (
          <div className="profile_data">
            <div className="user_image">
              {!user ? (
                <Link to="/auth"><img className="imgscp" src={post?.user?.picture || ''} alt="" /></Link>
              ) : (
                <Link to={`/ProfileRedirect/${post?.user?._id}`}>
                  <img className="imgscp" src={post?.user?.picture || ''} alt="" />
                </Link>
              )}
            </div>

            <div className="user_middle">
              {!user ? (
                <span className="user_name">
                  <Link to="/auth">{post?.user?.name || 'Unknown'}</Link>
                </span>
              ) : (
                <span className="user_name">
                  <Link to={`/ProfileRedirect/${post?.user?._id}`}>{post?.user?.name || 'Unknown'}</Link>
                </span>
              )}
              <span className="date">{localTimeString}</span>
            </div>

            {/* 3-dot share menu */}
            <div className="savePost">
              <div className="flex">
                <BsThreeDotsVertical
                  className="sizf"
                  size={22}
                  onMouseLeave={() => showmenu(false)}
                  onMouseOver={() => showmenu(true)}
                />
                <div
                  className={menus ? 'menus2' : 'hidden'}
                  onMouseOver={() => showmenu(true)}
                  onMouseLeave={() => showmenu(false)}
                >
                  <RWebShare
                    data={{
                      text: 'Check out this post on My Blog',
                      url: `/article/${post?._id}`,
                      title: post?.title || 'My Blog',
                    }}
                  >
                    <span className="shareprofile">Share</span>
                  </RWebShare>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostCard;
