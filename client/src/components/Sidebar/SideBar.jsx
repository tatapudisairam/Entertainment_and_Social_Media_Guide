import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaHome, FaUser, FaThumbsUp, FaComment } from "react-icons/fa";
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion } from "framer-motion";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from "sweetalert2"; 

const routes = [
  { path: "/", name: "Home", icon: <FaHome /> },
  { path: "/upload", name: "Upload", icon: <FontAwesomeIcon icon={faUpload} /> },
  { path: "/mylikes", name: "Liked Vdos", icon: <FaThumbsUp /> }, 
  { path: "/mycomments", name: "Commented Vdos", icon: <FaComment /> }, 
  { path: "/profile", name: "Profile", icon: <FaUser /> },
];


const SideBar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true); // Start with sidebar open
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies(["token"]);

  const toggle = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    if (!cookies.token) {
      // If not logged in, show alert
      Swal.fire({
        title: 'You are not logged in!',
        text: "Please log in to perform this action.",
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }
    
  
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to log out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        removeCookie("token", { path: "/", secure: true, sameSite: "Strict" });
        
        Swal.fire(
          'Logged out!',
          'You have been logged out successfully.',
          'success'
        );
  
        navigate("/login");
      }
    });
  };
  

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (a.name === searchTerm ? -1 : 1));

  return (
    <div className="main-container">
      <motion.div
        animate={{ width: isOpen ? "200px" : "45px", transition: { duration: 0.5, type: "spring", damping: 10 } }}
        className="sidebar"
      >
        <div className="top_section">
          <AnimatePresence>
            {isOpen && (
              <NavLink to='/' className='logo' style={{ cursor: 'pointer' }}>
                <motion.h1 className="logo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  LOGO
                </motion.h1>
              </NavLink>
            )}
          </AnimatePresence>
          <div className="bars" onClick={toggle}>
            <FaBars />
          </div>
        </div>
        <div className="search">
          <AnimatePresence>
            {isOpen && (
              <motion.input
                type="text"
                placeholder="Search"
                initial={{ width: 0 }}
                animate={{ width: "140px" }}
                exit={{ width: 0 }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          </AnimatePresence>
        </div>
        <section className="routes">
          {filteredRoutes.map((route, index) => (
            <NavLink to={route.path} key={index} className="link" activeClassName="active">
              <div className="icon">{route.icon}</div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="link_text">
                    {route.name}
                  </motion.div>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
          <div className="link" onClick={handleLogout}>
            <div className="icon"><FontAwesomeIcon icon={faSignOutAlt} /></div>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="link_text">
                  Logout
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </motion.div>

      <main className={isOpen ? 'main-content smaller' : 'main-content larger'}>
        {children}
      </main>
    </div>
  );
};

export default SideBar;
