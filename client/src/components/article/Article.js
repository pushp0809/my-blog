import React, { useEffect, useState } from "react";
import dompurify from "dompurify";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../footer/Footer";
import { BsDownload, BsThreeDotsVertical } from "react-icons/bs";
import { useSelector } from "react-redux";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import { toast } from 'react-hot-toast';
import { RWebShare } from "react-web-share";

import { createcomment, getcomment } from "../../helpers";

function Article({ post, __id }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => ({ ...state }));

  const [comment, setcomment] = useState("");
  const [scomment, setscomment] = useState(false);
  const [allc, setallc] = useState([]);
  const [menus, showmenu] = useState(false);

  const utcTimeString = post.createdAt;
  const date = new Date(utcTimeString);
  const options = { month: "long", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  const cleanHtml = dompurify.sanitize(post.content, { FORCE_BODY: true });

  const notify = (notice) => toast({ notice });

  // ── PDF Download ────────────────────────────────────────────────────────────
  const handleDown = () => {
    htmlToImage.toPng(document.getElementById('article-content'), { quality: 1.0 })
      .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = 'my-image-name.jpeg';
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save("ALLBlogs.pdf");
      });
  };

  // ── Comments ────────────────────────────────────────────────────────────────
  const handle = async () => {
    if (comment.length <= 0 || comment.length >= 550) {
      alert("comment can only have between 1 to 550 characters");
      return;
    }
    try {
      const data = await createcomment(
        user.name,
        user.picture,
        comment,
        user.id,
        post._id
      );
      if (data && data.msg === "ok") {
        setcomment("");
        loadcomm();
      }
    } catch (error) {
      // console.log(error)
    }
  };

  const loadcomm = async () => {
    try {
      const data = await getcomment(post._id);
      if (data && data.length > 0 && data[data.length - 1].msg === 'ok') {
        data.pop();
        data.reverse();
        setallc(data);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  if (!post || !post.user) {
    return (
      <>
        <br /><br /><br /><br />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontWeight: 'bold' }}>Loading...</h1>
          <p style={{ fontSize: '24px' }}>Preparing your article...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="article_wrapper" id="article-content">
        <div className="article">
          
          {/* User Info & Actions row */}
          <div className="user_info">
            <div className="user_image">
              <img className="imgi" src={post.user.picture} alt="" />
            </div>
            
            <div className="user_side">
              <span className="userni">
                {!user ? (
                  <Link to="/auth">{post.user.name}</Link>
                ) : (
                  <Link to={`/ProfileRedirect/${post.user._id}`}>
                    {post.user.name}
                  </Link>
                )}
              </span>
              <span className="userdi">
                <p className="userdi">
                  "{post.user.bio || post.user.about || "Author"}"
                </p>
              </span>
            </div>

            <div className="downloadi" style={{ marginLeft: "auto", display: "flex", gap: "15px", alignItems: "center" }}>
              <BsDownload className="sizf" size={22} style={{ cursor: "pointer" }} onClick={handleDown} title="Download PDF"/>
              
              <div className="flex" style={{ position: "relative" }}>
                <BsThreeDotsVertical 
                  className="sizf" 
                  size={22} 
                  style={{ cursor: "pointer" }}
                  onMouseOver={() => showmenu(true)} 
                  onMouseLeave={() => showmenu(false)} 
                />
                
                <div 
                  className={menus ? 'menus' : `hidden`} 
                  style={{ position: "absolute", right: 0, top: "100%", background: "#1f1f2e", border: "1px solid #333", borderRadius: "5px", padding: "10px", zIndex: 100 }}
                  onMouseOver={() => showmenu(true)}
                  onMouseLeave={() => showmenu(false)}
                >
                  <RWebShare
                    data={{
                      text: "Check out this article on My Blog",
                      url: window.location.href,
                      title: post.title || "My Blog Article",
                    }}
                  >
                    <button style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", padding: "5px 10px" }}>
                      Share Article
                    </button>
                  </RWebShare>
                </div>
              </div>
            </div>
          </div>

          <div className="article_title">{post.title}</div>
          
          <span className="post_date" style={{ opacity: 0.8, fontSize: "0.95rem" }}>
            {formattedDate.toUpperCase()} | {post.category.toUpperCase()} | {post.views} views
          </span>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags" style={{ marginTop: "15px" }}>
              {post.tags.map(tag => (
                <span key={tag} className="post-tag" style={{ marginRight: "10px", color: "var(--accent)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <br />

          <div className="article_image">
            <img src={post.image} alt="post visual" />
          </div>

          <div
            className="article_content"
            style={{ marginTop: "30px", lineHeight: "1.8", fontSize: "1.1rem" }}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          ></div>

          <br /><br /><hr style={{ borderColor: "var(--border)" }} />

          {/* Comment Section */}
          <div className="comment-main" style={{ marginTop: "30px" }}>
            <div 
              className={scomment ? 'hidden' : `com-head`} 
              style={{ cursor: "pointer", color: "var(--accent)", fontWeight: "bold" }}
              onClick={() => { setscomment(true); loadcomm(); }}
            >
              Show Comments ({post.comments ? post.comments.length : 0})
            </div>
            
            <div 
              className={scomment ? 'com-head' : `hidden`} 
              style={{ cursor: "pointer", fontWeight: "bold" }}
              onClick={() => setscomment(false)}
            >
              Hide Comments
            </div>

            {scomment && (
              <div style={{ marginTop: "20px" }}>
                {!user ? (
                  <div style={{ padding: "10px", background: "rgba(124, 58, 237, 0.1)", borderRadius: "8px" }}>
                    <Link to="/auth" style={{ color: "var(--accent)", fontWeight: "bold" }}>Sign in to join the discussion</Link>
                  </div>
                ) : (
                  <div>
                    <div className="add-com">
                      <form className="com-form" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <textarea
                          className="com-inp"
                          style={{ resize: "vertical", minHeight: "80px", padding: "12px", borderRadius: "8px", background: "#0f0f15", color: "#fff", border: "1px solid #333" }}
                          placeholder="Add your comment..."
                          value={comment}
                          onChange={(e) => setcomment(e.target.value)}
                        />
                        <button type="button" className="com-btn" style={{ alignSelf: "flex-end", background: "var(--accent)", color: "white", padding: "8px 16px", borderRadius: "5px", border: "none", cursor: "pointer" }} onClick={handle}>
                          Post Comment
                        </button>
                      </form>
                    </div>

                    <div style={{ marginTop: "30px" }}>
                      {allc.length === 0 ? (
                        <div style={{ color: "#888", fontStyle: "italic" }}>Be the first one to comment!</div>
                      ) : (
                        allc.map((c, idx) => {
                          const cDate = new Date(c.commentAt).toLocaleDateString();
                          return (
                            <div key={idx} style={{ display: "flex", gap: "15px", marginBottom: "25px", background: "#111116", padding: "15px", borderRadius: "10px", border: "1px solid #222" }}>
                              <img src={c.image} alt="user" style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                                  <Link to={`/ProfileRedirect/${c.commentBy}`} style={{ fontWeight: "bold", color: "#fff" }}>{c.name}</Link>
                                  <span style={{ fontSize: "12px", color: "#888" }}>{cDate}</span>
                                </div>
                                <div style={{ color: "#ccc", lineHeight: "1.5" }}>
                                  {c.comment}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Article;
