import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import InputField from "../../components/InputField";
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleOnChange = (e) => {
    setEmail(e.target.value);
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
    if (!email) {
      handleError("Please enter your email.");
      return;
    }
    try {
      const { data } = await axios.post(
        `http://localhost:4000/forgot-password`,
        { email }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
      handleError(errorMessage);
    }
  };

  return (
    <div style={styles.container}>
      <div className="form_container forgotpass_form">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={email}
            placeholder="Enter your email"
            onChange={handleOnChange}
          />
          <button type="submit">Submit</button>
          <span>
            Do you want to Login? <Link to="/login">Login</Link>
          </span>
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

          .forgotpass_form button {
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

          .forgotpass_form button:hover {
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

export default ForgotPassword;
