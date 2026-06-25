const mongoose = require('mongoose');
const User = require('../models/User');
const fsPromises = require('fs').promises;
const path = require('path');
module.exports = {

    //            ---------------------- Update Avatar ------------------------

    updateAvatar: async (req, res) => {
        const userid = req.userid;
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const oldAvatar = user.avatar;
        const avatarFileName = req.file.filename;
        user.avatar = avatarFileName;
        try {
            await user.save();
        } catch (error) {
            return res.status(500).json({ message: error.message + ' Server error' });
        }
        if (oldAvatar) {
            const avatarpath = path.join(__dirname, '../uploads/avatars', oldAvatar);
            await fsPromises.unlink(avatarpath).catch(() => {});
        }
        res.status(200).json({
            message: 'Avatar updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar ? `/uploads/avatars/${user.avatar}`
                    : null
            }
        });

    },

    //            ---------------------- Update Profile ------------------------

    updateProfile: async (req, res) => {
        const userid = req.userid;
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { firstName, lastName, email } = req.body;
        if (email && email !== user.email) {
            const checkEmail = await User.findOne({ email });
            if (checkEmail) {
                return res.status(409).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        if (firstName) {
            user.firstName = firstName;
        }
        if (lastName) {
            user.lastName = lastName;
        }

        await user.save();

        res.status(200).json({
            message: 'profile updated',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar ? `/uploads/avatars/${user.avatar}`
                    : null
            }
        });

    },

    //            ---------------------- GetMe ------------------------

    getMe: async (req, res) => {
        const user = await User.findById(req.userid).select("-password -refreshToken");

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar ? `/uploads/avatars/${user.avatar}`
                    : null
            }
        });
    }
};