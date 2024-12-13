const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const ParseInt = require('body-parser');
const Buyer = require('../../models/Buyer'); // Replace with your user model

const requestPasswordResetHandler = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const buyer = await Buyer.findOne({ email });
        if (!buyer) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const token = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.RESET_TOKEN_EXPIRATION,
        });

        // Send reset email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                buyer: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const resetUrl = `${req.protocol}://${req.get('host')}/v1/resetPassword/reset-password/${token}`;

        await transporter.sendMail({
            from: `"Support Team" <${process.env.SMTP_USER}>`,
            to: buyer.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>`,
        });

        res.status(200).json({ message: 'Reset email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const resetPasswordHandler = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Find user by ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};



module.exports = {
    requestPasswordResetHandler,
    resetPasswordHandler,

}