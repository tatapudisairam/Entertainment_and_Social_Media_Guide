import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import InputField from "../../components/InputField";
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    password: "",
    confirmPassword: "",
  });
  const { password, confirmPassword } = inputValue;

  useEffect(() => {
  }, [token]);

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
    if (!password || !confirmPassword) {
      handleError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      handleError("Passwords do not match.");
      return;
    }
    try {
      const { data } = await axios.post(
        `http://localhost:4000/reset-password`,
        { token, password }
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
      <div className="form_container resetpass_form">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="New Password"
            type="password"
            name="password"
            value={password}
            placeholder="Enter your new password"
            onChange={handleOnChange}
          />
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            placeholder="Confirm your new password"
            onChange={handleOnChange}
          />
          <button type="submit">Submit</button>
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

          .resetpass_form button {
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

          .resetpass_form button:hover {
            background-color: #0056b3;
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

export default ResetPassword;
