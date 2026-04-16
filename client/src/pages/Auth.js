import { useState } from 'react';
import { TfiEmail } from 'react-icons/tfi';
import { CiLock } from 'react-icons/ci';
import { TiUser } from 'react-icons/ti';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [state, setState] = useState('Sign Up');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState({ email: '', password: '', name: '' });
  const { email, password, name } = user;

  const handleChange = (e) => {
    const { name: field, value } = e.target;
    setUser({ ...user, [field]: value });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    const temail = email.toLowerCase();

    if (state === 'Log In') {
      if (!temail || !password) {
        setError('All fields are required!');
        return;
      }
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/login`,
          { temail, password },
          { withCredentials: true }
        );
        setSuccess('Login successful!');
        setTimeout(() => {
          dispatch({ type: 'LOGIN', payload: data });
          Cookies.set('user', JSON.stringify(data), { expires: 15 });
          navigate('/');
        }, 800);
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed.');
      }
    } else {
      if (!name || !temail || !password) {
        setError('All fields are required!');
        return;
      }
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/register`,
          { name, temail, password },
          { withCredentials: true }
        );
        setSuccess('Account created! Redirecting…');
        setTimeout(() => {
          dispatch({ type: 'LOGIN', payload: data });
          Cookies.set('user', JSON.stringify(data), { expires: 15 });
          navigate('/');
        }, 800);
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="containerzz">
      <div className="auth_wrapper">
        {/* Logo */}
        <div className="img">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="authGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#db2777"/>
              </linearGradient>
            </defs>
            <rect width="24" height="24" rx="6" fill="url(#authGrad)"/>
            <path d="M12 4L4 8.5l8 4 8-4L12 4zM4 15.5l8 4 8-4M4 12l8 4 8-4"
              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{state}</span>
        </div>

        {/* Tabs */}
        <div className="login-cont">
          <div
            className="tab"
            style={{
              borderBottom: state === 'Log In' ? '2px solid var(--accent)' : '',
              color: state === 'Log In' ? 'var(--text-primary)' : '',
            }}
            onClick={() => { setState('Log In'); setError(''); setSuccess(''); }}
          >
            Log In
          </div>
          <div
            className="tab"
            style={{
              borderBottom: state === 'Sign Up' ? '2px solid var(--accent)' : '',
              color: state === 'Sign Up' ? 'var(--text-primary)' : '',
            }}
            onClick={() => { setState('Sign Up'); setError(''); setSuccess(''); }}
          >
            Sign Up
          </div>
        </div>

        {/* Form */}
        <form action="" style={{ padding: '8px 0' }}>
          {state === 'Sign Up' && (
            <div className="input">
              <TiUser size={16} />
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={name}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="input">
            <TfiEmail size={14} />
            <input
              type="text"
              name="email"
              placeholder="Enter email"
              value={email}
              onChange={handleChange}
            />
          </div>
          <div className="input">
            <CiLock size={16} />
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={handleChange}
            />
          </div>
        </form>

        {error && <span className="errorValidation">{error}</span>}
        {success && <span className="RegisterSuccess">{success}</span>}

        {state === 'Sign Up' && (
          <div className="dilougue">
            By signing up, you agree to our <b>terms of service</b> and{' '}
            <b>privacy policy</b>.
          </div>
        )}

        <div className="footer" onClick={handleSubmit}>
          {state === 'Sign Up' ? 'CREATE ACCOUNT' : 'LOG IN'}
        </div>
      </div>
    </div>
  );
}

export default Auth;
