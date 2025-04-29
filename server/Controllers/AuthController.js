const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

module.exports.Signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(409).json({ message: "Username already exists. Use another one." });
    }

    const user = await User.create({ email, password, username });
    const token = createSecretToken(user._id);
    
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    res.status(201).json({ 
      message: "User signed up successfully", 
      success: true, 
      userId: user._id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email is not registered.' });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    res.status(200).json({ 
      message: "User logged in successfully", 
      success: true, 
      userId: user._id // Return user ID
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

module.exports.ForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "No user found with this email" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the following link to reset your password: 
    http://localhost:3000/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.status(500).json({ message: "Error sending email", success: false });
    }
    res.status(200).json({ message: "Password reset link sent to your email", success: true });
  });
};

module.exports.ResetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = password; 
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been reset successfully", success: true, userId: user._id }); // Return user ID
};
