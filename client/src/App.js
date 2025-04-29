import React, { useState, useEffect } from 'react';
import './App.css';
import SideBar from './components/Sidebar/SideBar';
import Navbar from './components/Navbar/Navbar';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';

//import statements
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Signup from './pages/Signup/Signup';
import Upload from './pages/Upload/Upload';
import Recommend from './pages/Recommend/Recommend';
import Profile from './pages/Profile/Profile';
import RecommendUsingImage from './pages/RecommendUsingImage/RecommendUsingImage';
import PlayVideo from './pages/PlayVideo/PlayVideo'
import MyLikes from './pages/MyLikes/MyLikes';
import MyComments from './pages/MyComments/MyComments';

const ProtectedRoute = ({ element }) => {
  const [cookies] = useCookies(['token']);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const verifyCookie = async () => {
      if (!cookies.token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const { data } = await axios.post(
          `http://localhost:4000/`,
          {},
          { withCredentials: true }
        );
        setIsAuthenticated(data.status);
        if (data.status) {
          setUserId(data.userId);
          setUsername(data.user);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyCookie();
  }, [cookies]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    React.cloneElement(element, { userId, username })
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);

  return (
    <Router>
      <div className='main-routes'>
        <Navbar onImageUpload={setUploadedImage} />
        <SideBar>
          <Routes>
            <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path="/video/:id" element={<ProtectedRoute element={<PlayVideo />} />} />
            <Route path="/upload" element={<ProtectedRoute element={<Upload />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
            <Route path="/recommend" element={<ProtectedRoute element={<Recommend />} />} />
            <Route path="/mylikes" element={<ProtectedRoute element={<MyLikes />} />} />
            <Route path="/mycomments" element={<ProtectedRoute element={<MyComments />} />} />
            <Route path="/recommend-using-image" element={<ProtectedRoute element={<RecommendUsingImage uploadedImage={uploadedImage} />} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<> Not found</>} />
          </Routes>
        </SideBar>
      </div>
    </Router>
  );
}

export default App;    