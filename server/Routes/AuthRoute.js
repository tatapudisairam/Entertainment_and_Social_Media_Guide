const { Signup, Login, ForgotPassword, ResetPassword } = require('../Controllers/AuthController');
const { userVerification } = require('../Middlewares/AuthMiddleware');
const router = require('express').Router();

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);
router.post('/', userVerification);

module.exports = router;
