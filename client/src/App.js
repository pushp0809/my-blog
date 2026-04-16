import './App.css';
import { Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import HomePage from './pages/HomePage';
import { useState } from 'react';
import LoggedInRoutes from './routes/LoggedInRoutes';
import NotAllowedLoggedInRoutes from './routes/NotAllowedLoggedInRoutes';
import { useSelector } from 'react-redux';
import WritePost from './pages/write/WritePost';
import Profile from './pages/Profile';
import ArticlePage from './pages/ArticlePage';
import ProfileOfOtherUser from './components/profileOftherUser/ProfileOfOtherUser';
import Not_found from './pages/not_found';
import Editpost from './pages/write/Editpost';
import TopicPage from './pages/TopicPage';

function App() {
  const { user } = useSelector((state) => ({ ...state }));

  return (
    <div className="App">
      <Routes>
        <Route path="/" exact element={<HomePage user={user} category="all" />} />
        <Route path="/topic/:id" element={<TopicPage user={user} />} />
        <Route path="/article/:postID" element={<ArticlePage />} />
        <Route path="/ProfileRedirect/:userID" element={<ProfileOfOtherUser />} />
        <Route path="/404" element={<Not_found />} />

        <Route element={<LoggedInRoutes />}>
          <Route path="/write" element={<WritePost />} />
          <Route path="/edit/:id" element={<Editpost />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<NotAllowedLoggedInRoutes />}>
          <Route path="/auth" exact element={<Auth />} />
        </Route>

        <Route path="*" element={<Not_found />} />
      </Routes>
    </div>
  );
}

export default App;
