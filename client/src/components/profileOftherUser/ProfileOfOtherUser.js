import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import InfiniteScroll from "react-infinite-scroll-component";

import Navbar from "../Navbar";
import Footer from "../footer/Footer";
import PostCard from "../home/post/PostCard";
import { getUser, showmyposts } from "../../helpers";
import "./profileOfOtherUser.css";

function ProfileOfOtherUser() {
  const { userID } = useParams();
  const { user } = useSelector((state) => ({ ...state }));
  const navigate = useNavigate();

  const [otherUser, setOtherUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    userData();
  }, [userID]);

  const userData = async () => {
    if (user && userID === user.id) {
      navigate("/profile");
      return;
    }
    
    try {
      const data = await getUser(userID);
      if (data && data._doc) {
        setOtherUser(data._doc);
      } else if (data) {
        setOtherUser(data);
      }
      
      const postData = await showmyposts(userID);
      if (postData && postData.msg) {
        setPosts(postData.msg);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <div className="ProfileOfOtherUser" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      
      <div className="user_wrapper" style={{ marginTop: "40px", marginBottom: "40px" }}>
        <div className="user_image">
          <img
            className="imgpro"
            src={
              otherUser?.picture
                ? otherUser.picture
                : "https://res.cloudinary.com/dttyhvsnv/image/upload/v1677430557/default_pic_gxoa10.png"
            }
            alt="Profile"
          />
          <span className="aboutn" style={{ fontSize: "24px", fontWeight: "bold" }}>{otherUser.name}</span>
        </div>
        <div className="user_about marg" style={{ fontStyle: "italic", color: "var(--text-secondary)", textAlign: "center", maxWidth: "600px", margin: "20px auto" }}>
          {otherUser?.bio || otherUser?.about || "No bio available."}
        </div>
      </div>

      <div className="profile-sub" style={{ flex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div className="bookmark-main">
          <h1 className="heading1 sm" style={{ marginBottom: "20px", color: "var(--accent)" }}>{otherUser.name}'s Posts</h1>
          <hr style={{ borderColor: "var(--border)", marginBottom: "30px" }} />
          
          {loadingPosts ? (
            <div className="loader-container" style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
              <PuffLoader color="var(--accent)" size={40} />
            </div>
          ) : posts.length === 0 ? (
            <div className="ssm" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>
              This user hasn't published any posts yet.
            </div>
          ) : (
            <div className="posts_container">
              {posts.map((post, i) => (
                <PostCard post={post} key={i} type="main" />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default ProfileOfOtherUser;
