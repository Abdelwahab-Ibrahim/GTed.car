const express = require('express');
const router = express.Router();

const user = require('../controllers/user');
const verifyJWT = require('../middleware/verifyJWT');
const uploadAvatar = require('../middleware/uploadAvatar');


router.patch('/avatar',
    verifyJWT,
    uploadAvatar.single('avatar'),
    user.updateAvatar);

router.patch('/profile', verifyJWT, user.updateProfile);
router.get('/getMe', verifyJWT, user.getMe);

module.exports = router;