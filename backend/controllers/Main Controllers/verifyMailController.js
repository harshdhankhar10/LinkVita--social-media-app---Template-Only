import User from "../../models/userModel.js";
import {sendMail} from "../../helper/mailHelper.js";

let otps = {};
let otp = Math.floor(100000 + Math.random() * 900000);

export const sendVerificationEmail = async (req, res) => {
    try {
        const {email} = req.body;
        if(!email){
            return res.status(400).json({success: false, message: "Please provide your email"});
        }

        const user = await User.findOne({email});
        const fullName = user?.fullName;

        const mailOptions = {
            to: email,
            subject: "Verify Your Email Address | LinkVita",
            htmlContent: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your LinkVita Account</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.5;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .header {
            padding: 40px 20px;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            text-align: center;
            position: relative;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, 
                rgba(236, 72, 153, 0.6) 0%, 
                rgba(139, 92, 246, 0.6) 50%, 
                rgba(236, 72, 153, 0.6) 100%);
        }

        .logo-text {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(to right, #fff, #e2e8f0);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            display: inline-block;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }

        .header-title {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 500;
        }

        .content {
            padding: 40px;
            background-color: white;
        }

        .greeting {
            margin-bottom: 32px;
        }

        .greeting-name {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 12px;
        }

        .greeting-text {
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
        }

        .verification-box {
            background: #f8fafc;
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
        }

        .verification-label {
            color: #64748b;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
            display: block;
        }

        .verification-code {
            font-size: 40px;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #7c3aed;
            background: white;
            padding: 12px 24px;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin-bottom: 8px;
            font-family: 'Courier New', monospace;
        }

        .expiry-note {
            color: #94a3b8;
            font-size: 14px;
            font-weight: 500;
        }

        .button-container {
            margin: 32px 0;
            text-align: center;
        }

        .verify-button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            color: white;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);
            transition: all 0.2s ease;
        }

        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
        }

        .security-note {
            background: #fff1f2;
            border-left: 4px solid #fda4af;
            padding: 16px;
            border-radius: 0 8px 8px 0;
            margin-top: 32px;
        }

        .security-note-title {
            color: #881337;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .security-note-text {
            color: #9f1239;
            font-size: 14px;
            line-height: 1.5;
        }

        .footer {
            padding: 24px;
            text-align: center;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
        }

        .footer-links {
            margin-top: 16px;
            display: flex;
            justify-content: center;
            gap: 24px;
        }

        .footer-link {
            color: #7c3aed;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .footer-link:hover {
            color: #6d28d9;
            text-decoration: underline;
        }

        .footer-contact {
            margin-top: 16px;
        }

        .footer-contact a {
            color: #7c3aed;
            text-decoration: none;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-text">LinkVita</div>
            <h1 class="header-title">Verify Your Email</h1>
            <p class="header-subtitle">Let's get you started with LinkVita</p>
        </div>

        <div class="content">
            <div class="greeting">
                <h2 class="greeting-name">Hello ${fullName},</h2>
                <p class="greeting-text">
                    Thank you for joining LinkVita! To complete your registration and secure your account, 
                    please verify your email address using the verification code below.
                </p>
            </div>

            <div class="verification-box">
                <span class="verification-label">Your Verification Code</span>
                <div class="verification-code">${otp}</div>
                <p class="expiry-note">This code expires in 10 minutes</p>
            </div>

           

            <div class="security-note">
                <h3 class="security-note-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#881337" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Security Notice
                </h3>
                <p class="security-note-text">
                    Never share this code with anyone. LinkVita will never ask you for your verification code.
                    If you didn't request this, please ignore this email or contact support.
                </p>
            </div>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} LinkVita. All rights reserved.</p>
            
            <div class="footer-links">
                <a href="#" class="footer-link">Help Center</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
            </div>
            
            <div class="footer-contact">
                <p>Need help? <a href="mailto:support@linkvita.com">Contact our support team</a></p>
            </div>
        </div>
    </div>
</body>
</html>
            `
        };

        await sendMail(mailOptions);

        otps[email] = otp;

        return res.status(200).json({success: true, message: "OTP sent successfully"});

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

export const verifyEmail = async (req, res) => {
    try {

        const {email, otp} = req.body;

        const user = await User.findOne({email});

        if(!email || !otp){
            return res.status(400).json({success: false, message: "Please provide your email and OTP"});
        }
        

        if (otps[email] && otps[email].toString() === otp.toString()) {
            user.isVerified = true;
            await user.save();
            delete otps[email];
            return res.status(200).json({success: true, message: "Email verified successfully"});
        } else {
            return res.status(400).json({success: false, message: "Invalid OTP"});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}