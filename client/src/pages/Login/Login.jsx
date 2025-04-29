import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import InputField from "../../components/InputField";
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) => 
    toast.error(err, {
      position: "bottom-left",
    });
  
  const handleSuccess = (msg) => 
    toast.success(msg, {
      position: "bottom-left",
    });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      handleError("Please fill in all fields.");
      return;
    }
    try {
      const { data } = await axios.post(
        `http://localhost:4000/login`,
        inputValue,
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/");
        }, 700);
      } else {
        handleError(message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
      handleError(errorMessage);
    }
    setInputValue({
      email: "",
      password: "",
    });
  };

  return (
    <div style={styles.container}>
      <div className="form_container login_form">
        <h2>Login Account</h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={password}
            placeholder="Enter your password"
            onChange={handleOnChange}
          />
          <button type="submit">Submit</button>
          <span>
            Don't have an account? <Link to="/signup">Signup</Link>
          </span>
          <br />
          <Link to="/forgot-password">Forgot Password?</Link>
        </form>
        <ToastContainer />
      </div>
      <style>
        {`
          .form_container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
          }

          .form_container h2 {
            margin-bottom: 20px;
            color: #333;
            font-size: 24px;
            font-weight: 600;
          }

          input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            color: #333;
            outline: none;
            transition: border-color 0.3s;
          }

          input:focus {
            border-color: #007bff;
          }

          .login_form button {
            background-color: #007bff;
            color: #fff;
            padding: 12px;
            width: 100%;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 15px;
            transition: background-color 0.3s;
          }

          .login_form button:hover {
            background-color: #0056b3;
          }

          span, a {
            display: block;
            margin-top: 10px;
            color: #007bff;
            text-decoration: none;
            font-size: 14px;
          }

          a:hover {
            text-decoration: underline;
          }

          ::placeholder {
            color: #aaa;
          }

          @media (max-width: 768px) {
            .form_container {
              padding: 20px;
            }

            input, button {
              font-size: 14px;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.4)',
  },
};




export default Login;
