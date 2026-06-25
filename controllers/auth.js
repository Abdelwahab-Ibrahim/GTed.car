const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');

module.exports = {
    //            ---------------------- Register ------------------------
    register: async (req, res) => {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newuser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword
            });
            await newuser.save();
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message + ' Server error' });
        }
    },

    //            ---------------------- Login ------------------------
    login: async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(401).json({ message: 'User not found' });
        }
        const passwordMatches = await bcrypt.compare(password, findUser.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const accessToken = jwt.sign(
            { userId: findUser._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '40s' }
        );

        const refreshToken = jwt.sign(
            { userId: findUser._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        findUser.refreshToken = refreshToken;
        await findUser.save();

        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    },

    //            ---------------------- Logout ------------------------
    logout: async (req, res) => {
        const refreshToken = req.cookies.jwt;
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.clearCookie('jwt');
        res.status(200).json({ message: 'logged out' });
    },

    //            ---------------------- Refresh ------------------------
    refresh: async (req, res) => {
        try {
            const token = req.cookies.jwt;
            if (!token) {
                return res.sendStatus(401);
            }

            const findUser = await User.findOne({ refreshToken: token });
            if (!findUser) {
                return res.sendStatus(403);
            }

            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            const accessToken = jwt.sign(
                { userId: decoded.userId },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '40s' }
            );

            return res.status(200).json({ accessToken });
        } catch (error) {
            return res.status(403).json({ message: 'invalid or expired refresh token' });
        }
    }
};  