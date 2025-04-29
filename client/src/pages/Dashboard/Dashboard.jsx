import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import Feed from '../../components/Feed/Feed';
import './Dashboard.css';

const Dashboard = ({ username }) => {
  const [cookies] = useCookies(["token"]);

  useEffect(() => {
    const showToast = () => {
      if (cookies.token && username) {
        toast(`Hello, ${username}!`, { position: "top-right" });
      }
    };

    showToast();
  }, [cookies, username]);

  return (
    <div className="dashboard">
      <div className="container">
        <Feed />
      </div>
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
