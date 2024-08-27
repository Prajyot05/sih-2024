import {User} from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

import {generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js';
import { sendResetPasswordEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js';

export const signup = async (req, res) => {
    const {email, password, name} = req.body;
    try {
        // Check if all fields are entered
        if(!email || !password || !name){
            throw new Error("All fields are required!"); // Catch gets called with error message being the string in parenthesis
        }

        // Check if user already exists
        const userAlreadyExists = await User.findOne({email});
        console.log("User already exists: ", userAlreadyExists);
        if(userAlreadyExists){
            return res.status(400).json({success: false, message: "User already exists"});
        }

        // Generate new user
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
        });
        await user.save();

        // JWT
        generateTokenAndSetCookie(res, user._id);

        // Mailtrap
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created Successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        });

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } 
    catch (error) {
        console.log("Error in verifyEmail", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        // Check whether credentials are correct
        if(!user || !isPasswordValid){
            return res.status(400).json({success: false, message: "Invalid Credentials"});
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        console.log(`Error in login function: ${error}`);
        return res.status(400).json({success: false, message: "Invalid Credentials"});
    }
}

export const logout = async (req, res) => {
    res.clearCookie("jwtToken");
    res.status(200).json({success: true, message: "Logged Out Successfully"});
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }
        // Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour long
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        sendResetPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email"
        });
    } catch (error) {
        console.log(`Error in forgotPassword: ${error}`);
        res.status(400).json({
            success: true,
            message: error.message
        });
    }
}

export const resetPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        });

        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Update Password
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        sendResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        })
    } catch (error) {
        console.log(`Error in resetPassword: ${error}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        res.status(200).json({success: true, user});
    } catch (error) {
        console.log(`Error in checkAuth: ${error}`);
        res.status(400).json({success: false, message: error.message});
    }
}