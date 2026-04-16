import { TfiWrite } from "react-icons/tfi";
import { RiShieldUserLine } from "react-icons/ri";
import { ImMenu } from "react-icons/im";
import { GiSplitCross } from "react-icons/gi";
import { BsSearch, BsPencilSquare } from "react-icons/bs";

import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Cookies from "js-cookie";

import { useState } from "react";
import axios from "axios";
import { clearCookie } from "../helpers";
import { useMediaQuery } from "react-responsive";
import { searchPosts } from "../helpers/index";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5002";

function Navbar({ postpage }) {
  const view1 = useMediaQuery({ query: "(max-width: 564px)" });
  const view2 = useMediaQuery({ query: "(max-width: 420px)" });
  const view3 = useMediaQuery({ query: "(max-width: 825px)" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchsel, setsearchsel] = useState(true);
  const [sres, searchf] = useState([]);
  const [ssw, cssw] = useState(false)
  const [scontent, cscontent] = useState("")

  const navigateToHome = () => {
    navigate("/");
  };
  const onsearchc = async () => {
    try {
      if (scontent === "") {
        searchf([]);
        return;
      }
      const data = await searchPosts(scontent);
      if (!data.posts || data.posts.length === 0) {
        searchf([]);
        return;
      }
      searchf(data.posts);
    } catch (error) {
      // console.log("error in search result");
    }
  }
  const { user } = useSelector((state) => ({ ...state }));
  const handleLoad = () => {
    if (user === null || user === undefined) {
      fetch(`${API_BASE_URL}/login/success`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      })
        .then((response) => {
          if (response.status === 200) return response.json();
          throw new Error("Authentication Failed!");
        })
        .then((resObject) => {
          dispatch({ type: "LOGIN", payload: resObject.user });
          Cookies.set("user", JSON.stringify(resObject.user), {
            expires: 15,
          });
        })
        .catch((err) => {
          // console.log(err);
        });
    }
  };

  const logoutFunction = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/logout`, { withCredentials: true }
      );
      if (data) {
        Cookies.set("user", "");
        Cookies.remove("sessionId");
        clearCookie("sessionId");
        dispatch({
          type: "LOGOUT",
        });
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
  const select_action = async () => {
    setsearchsel((prev) => !prev);
  };

  return (
    <nav className="navbar">
      {ssw ?
        <div className="btnsrch" onClick={() => { cssw(false); }}>

        </div>
        :
        <></>}
      <div className="rocket" onClick={() => navigateToHome()}>
        <div className="img">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span>My Blog</span>
      </div>
      <div className="search" style={{display:`${view3?"none":""}`}}>
        <div className="search_wrap">
          <input className="inputnav" onClick={() => { cssw(true) }} onChange={(e) => { cscontent(e.target.value); cssw(true); onsearchc() }} type="text" name="" value={scontent} id="" placeholder="Search..." />
          {ssw && scontent ?
            <div className="search-result">
              <ul className="search-list">
                {sres.map((post) => (
                  <li className="lis-item noun" key={post._id}>
                    <img className="imgscp" src={post.image || post.user?.picture} alt="" style={{ objectFit: 'cover' }} />
                    <Link className="noun" to={`/article/${post._id}`} onClick={() => cssw(false)}>
                      <div className="blackclr" style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                          {post.title}
                        </span>
                        <span style={{ fontSize: '11px', color: '#666' }}>By {post.user?.name}</span>
                      </div>
                    </Link>
                  </li>
                ))}
                {sres.length === 0 && (
                  <li className="lis-item noun">
                    <p style={{ padding: '10px', fontSize: '14px', color: '#666' }}>No posts found.</p>
                  </li>
                )}
              </ul>
            </div>
            : <></>
          }
        </div>
        <div className="imagesearch" onClick={() => { cssw(true); onsearchc() }}>
          <BsSearch size={view1 ? 15 : 20} />
          {view2 ? (
            <div className="searchsel" onClick={select_action}>
              {searchsel ? <ImMenu size={22} /> : <GiSplitCross size={22} />}
            </div>
          ) : null}
        </div>
      </div>
      {user ? (
        <div className="links write2 for-mid-screen2" style={{ marginRight: '20px' }}>
          <Link
            className={view1 ? "write extra" : "write"}
            to="/write"
            style={{ visibility: `${postpage && "hidden"}`, display: "flex", alignItems: 'center', gap: '4px' }}
          >
            <BsPencilSquare className="pencill" style={{ marginBottom: '-2px' }} />
            <span>Add</span>
          </Link>
          <Link className="user" to="/profile">
            <div className="user_image">
              <img src={user.picture} alt="" />
            </div>
          </Link>
          <Link
            to=""
            className={view1 ? "logout extra" : "logout"}
            onClick={logoutFunction}
            style={{ marginTop: '-2px' }}
          >
            Log Out
          </Link>
        </div>
      ) : (
        <div style={{ marginRight: '20px' }} className="for-mid-screen">
          <div className="links" style={{ gap: '20px' }}>
            <Link className="add-button" to="/auth" style={{ display: "flex", alignItems: 'center', gap: '4px' }}>
              <BsPencilSquare className="BsPencilSquare" style={{ marginBottom: '-2px' }} />
              <span>Add</span>
            </Link>
            <Link to="/auth" className="logout" style={{ marginTop: '-2px' }}>
              SignUp | LogIn
            </Link>
          </div>
        </div>
      )}
      {view2 && (
        <div className={!searchsel ? "sidebar" : "sidebar2"}>
          {/* <ul>
            <li>
              <RiShieldUserLine size={15} />
              {user ? (
                <Link to="/profile">Profile</Link>
              ) : (
                <Link to="/auth">LogIn | SignUp</Link>
              )}
            </li>
            <li>
              <TfiWrite size={15} /> <Link to="/write">Write</Link>
            </li>
            {user ? (
              <li className="hamburger_logout">
                <Link to="/" onClick={logoutFunction}>
                  LogOut
                </Link>
              </li>
            ) : (
              ""
            )}
          </ul> */}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
