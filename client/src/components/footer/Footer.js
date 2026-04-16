import React from "react";
import "./footer.css";

function Footer() {
  return (
    <footer className="desktop-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-brand-name">My Blog</div>
          <p className="footer-brand-tagline">
            A place for ideas, stories, and conversations that matter.
          </p>
          <div className="footer-myblog-tag">
            ✦ Built with passion
          </div>
        </div>

        {/* Products */}
        <div className="footer-column">
          <h3>Explore</h3>
          <ul>
            <li><a href="/" className="subfot">All Posts</a></li>
            <li><a href="/topic/tech" className="subfot">Tech</a></li>
            <li><a href="/topic/lifestyle" className="subfot">Lifestyle</a></li>
            <li><a href="/topic/food" className="subfot">Food</a></li>
            <li><a href="/topic/travelling" className="subfot">Travel</a></li>
          </ul>
        </div>

        {/* About */}
        <div className="footer-column">
          <h3>About</h3>
          <ul>
            <li><a href="https://github.com/Prashant0664" className="subfot">Our Story</a></li>
            <li><a href="https://portfolio-prashant-xi.vercel.app/" className="subfot">Our Team</a></li>
            <li><a href="https://mail-senderprojectv1.vercel.app" className="subfot">Contact Us</a></li>
          </ul>
        </div>

        {/* Connect */}
        <div className="footer-column">
          <h3>Connect</h3>
          <ul>
            <li><a href="https://github.com/Prashant0664" className="subfot">GitHub</a></li>
            <li><a href="https://github.com/Prashant0664" className="subfot">Instagram</a></li>
            <li><a href="https://github.com/Prashant0664" className="subfot">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-info" style={{ textAlign: "center", paddingBottom: "20px" }}>
        <p style={{ marginBottom: "10px", fontSize: "15px", color: "var(--text-secondary)" }}>
          © 2025 My Blog
        </p>
        <p style={{ fontWeight: "bold", color: "var(--accent)", lineHeight: "1.6" }}>
          Made by: Beer Singh(3312)-Backend, Pranay Rahar(3334)-Database, Pushpendra Tiwari(3336)-Frontend.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
