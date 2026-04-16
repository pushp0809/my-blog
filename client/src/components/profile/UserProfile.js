import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BeatLoader, PuffLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

import Navbar from "../Navbar";
import Footer from "../footer/Footer";
import PostCard from "../home/post/PostCard";
import {
  getUser,
  dataURItoBlob,
  uplaodImages,
  uploadProfilePicture,
  showmyposts,
  changeabout,
} from "../../helpers";
import "./userprofile.css";

function UserProfile() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();
  
  const img_ref = useRef();
  const [image, setimage] = useState("");
  const [dbPic, setDbPic] = useState("");
  const [dbAbout, setDbAbout] = useState("");
  const [about, setAbout] = useState("");
  const [rawDbAbout, setrawDbAbout] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [posts, setpostlist] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const myprofile = await getUser(user.id);
        const fetchedBio = myprofile.bio || myprofile.about || "";
        setDbPic(myprofile.picture);
        setrawDbAbout(fetchedBio);
        setDbAbout(fetchedBio);
        setAbout(fetchedBio);
        
        handleposts();
      } catch (error) {
        // console.log("error in profile", error)
      }
    };
    fetchMyProfile();
  }, [user.id]);

  const handleposts = async () => {
    try {
      const data = await showmyposts(user.id);
      if (data && data.msg) {
        setpostlist(data.msg);
      }
    } catch (err) {
      // console.log(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files.length) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (readerEvent) {
        setimage(readerEvent.target.result);
        setError("");
      };
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!image && about === rawDbAbout) {
        return; // nothing changed
      }
      
      setLoading(true);

      if (!image) {
        await changeabout(about, user.id);
        const updatedUser = { ...user, bio: about };
        Cookies.set("user", JSON.stringify(updatedUser));
        dispatch({ type: "UPDATEPICTURE", payload: updatedUser });
        setDbAbout(about);
        setrawDbAbout(about);
        setLoading(false);
        return;
      }

      if (about.length > 200) {
        setError("Maximum 200 characters allowed for bio");
        setLoading(false);
        return;
      }
      
      setError("");
      const path = `${user.name}/profile_image`;
      const imgBlob = dataURItoBlob(image);
      let formData = new FormData();
      formData.append("path", path);
      formData.append("file", imgBlob);
      
      const profile_img = await uplaodImages(formData, user.token);
      const data = await uploadProfilePicture(
        profile_img[0].url,
        about,
        user.token
      );
      
      const updatedUser = {
        ...user,
        picture: profile_img[0].url,
        bio: data.bio || about,
      };
      
      Cookies.set("user", JSON.stringify(updatedUser));
      dispatch({ type: "UPDATEPICTURE", payload: updatedUser });
      
      setDbPic(profile_img[0].url);
      setDbAbout(updatedUser.bio);
      setrawDbAbout(updatedUser.bio);
      setimage("");
      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="profile_container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      
      <div className="profile" style={{ marginTop: "40px", marginBottom: "40px" }}>
        <div className="profile-photo">
          <div className="preview_img" style={{ border: "2px solid var(--accent)" }}>
            {dbPic && !image ? 
              <img src={dbPic} referrerPolicy="no-referrer" alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : 
              <img src={image} referrerPolicy="no-referrer" alt="New Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            }
          </div>
        </div>
        
        <div className="image_button">
          <button
            onClick={() => {
              img_ref.current.click();
            }}
            style={{ background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}
          >
            {dbPic ? "Change Image" : "Add Image"}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
          <input
            ref={img_ref}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            hidden
          />
          
          <label className="hreffor" htmlFor="about" style={{ display: "block", marginBottom: "10px", textAlign: "left" }}>Bio:</label>
          
          {dbAbout && dbAbout === rawDbAbout && !image ? (
            <div className="about_me" style={{ background: "#111116", padding: "15px", borderRadius: "8px", minHeight: "80px", textAlign: "left" }}>
              {dbAbout}
            </div>
          ) : (
            <textarea
              id="about"
              name="about"
              rows="5"
              value={about}
              placeholder='Write something about yourself...'
              style={{ width: "100%", background: "#111116", color: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #333", resize: "vertical" }}
              onChange={(e) => {
                setAbout(e.target.value);
                setDbAbout(null);
              }}
            ></textarea>
          )}
          
          {error && <div className="my_profile_error" style={{ color: "#ef4444", marginTop: "10px" }}>{error}</div>}
          
          {dbAbout && dbAbout === rawDbAbout && !image && (
            <div 
              className="change_about" 
              onClick={() => { setDbAbout(''); setAbout(rawDbAbout) }} 
              style={{ color: "var(--accent)", cursor: "pointer", marginTop: "10px", textAlign: "right" }}
            >
              Edit Bio
            </div>
          )}
          
          {(image || dbAbout !== rawDbAbout) && (
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button 
                type="button" 
                onClick={() => { setimage(""); setAbout(rawDbAbout); setDbAbout(rawDbAbout); setError(""); }}
                style={{ flex: 1, background: "transparent", border: "1px solid #555", color: "#fff", padding: "10px", borderRadius: "5px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                className="jenc" 
                disabled={loading} 
                type="submit"
                style={{ flex: 1, background: "var(--accent)", color: "#fff", padding: "10px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}
              >
                {loading ? <BeatLoader color="#fff" size={8} /> : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="profile-sub" style={{ flex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 20px", marginTop: "40px" }}>
        <div className="bookmark-main">
          <h1 className="heading1 sm" style={{ marginBottom: "20px", color: "var(--accent)" }}>Your Posts</h1>
          <hr style={{ borderColor: "var(--border)", marginBottom: "30px" }} />

          {loadingPosts ? (
            <div className="loader-container" style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <PuffLoader color="var(--accent)" size={40} />
            </div>
          ) : posts.length === 0 ? (
            <div className="ssm" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px" }}>
              You haven't published any posts yet.
            </div>
          ) : (
            <div className="posts_container">
              {posts.map((post, i) => (
                <PostCard post={post} key={i} type={"powner"} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default UserProfile;