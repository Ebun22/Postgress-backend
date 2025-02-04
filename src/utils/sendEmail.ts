import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { GMAIL_PASSWORD, GMAIL_USER, JWT_SECRET } from "../secrets";



type EmailType = 'resetPassword' | 'OTPLogin' | 'sucessFullOrder' | 'cancelOrder';

export const emailSender = async (req: Request, email: string, subject: string, type: EmailType, token: number) => {

    const emailType = {
        resetPassword: `
        <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 8px; border: 1px solid #e4e4e7;" cellspacing="0" cellpadding="0" border="0">
                <tr>
                        <td align="center" >
                            <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
                                    <!-- Banner Section with 3D effect -->
                                <tr>
                                    <td style="position: relative;">
                                    <div style="
                                        background: url('https://res.cloudinary.com/didsdsc1z/image/upload/c_fill,g_auto,h_250,w_970/b_rgb:000000,e_gradient_fade,y_-0.50/v1737627573/ITERLEN_MART_LLC_TRANSPARENT-05_apg57q.png') no-repeat center center / cover;
                                        padding: 90px 20px;
                                        text-align: center;
                                        position: relative;
                                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                                    ">
                                
                                        <!-- Decorative elements for 3D effect -->
                                        <div style="
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        right: 0;
                                        height: 1px;
                                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                                        "></div>
                                    </div>
                                    </td>
                                </tr>
                                
    
                                <tr>
                                    <!-- Header Section -->
                                    <td style="padding: 10px 20px; text-align: center;">
                                        <h1 style="margin: 0 0 20px; color: #0C6D3A; font-family: Arial, sans-serif; font-weight: 900; font-size: 34px;">
                                            ARIMAX
                                        </h1>
                                    </td>
                                </tr>
    
                                <tr>
                                    <!-- Content Section -->
                                    <tr>
                                        <td style="padding: 10px 20px; text-align: center;">
                                            <p style="margin: 0 0 20px; color: #52525b; font-family: Arial, sans-serif; font-size: 16px;">
                                                To reset your password, proceed to the URL below on the password reset page:         
                                            </p>
                                            
                                            <p style="margin: 0 0 20px; color: #52525b; font-family: Arial, sans-serif; font-size: 16px;">
                                                For your security, please do not share this url with anyone. If you did not request this email, please contact our support team immediately.</p>
                                            
                                            <p style="margin: 0 0 30px; color: #52525b; font-family: Arial, sans-serif; font-size: 16px;">
                                            Your URL: 
                                            </p>
                                            
                                            <div style="margin-bottom: 30px; max-width: 300px;">
                                            <h2 style="margin: 0; color: #18181b; font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 2px;">
                                                ${req.protocol}s://${req.get('host')}${req.path}/v1/auth/reset-password/${token}
                                            </h2>
                                            </div>
                                            
                                            <p style="margin: 0 0 10px; color: #71717a; font-family: Arial, sans-serif; font-size: 14px;">
                                            This url expires in 10 minutes, after which url becomes invalid.
                                            </p>
                                            
                                            <p style="margin: 40px 0 0; color: #71717a; font-family: Arial, sans-serif; font-size: 14px;">
                                            Wasn't you? You can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
        `,
        OTPLogin: ` <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 8px; border: 1px solid #e4e4e7;" cellspacing="0" cellpadding="0" border="0">
                <tr>
                        <td align="center" >
                            <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;" cellspacing="0" cellpadding="0" border="0">
                                    <!-- Banner Section with 3D effect -->
                                <tr>
                                    <td style="position: relative;">
                                    <div style="
                                        background: url('https://res.cloudinary.com/didsdsc1z/image/upload/c_fill,g_auto,h_250,w_970/b_rgb:000000,e_gradient_fade,y_-0.50/v1737627573/ITERLEN_MART_LLC_TRANSPARENT-05_apg57q.png') no-repeat center center / cover;
                                        padding: 90px 20px;
                                        text-align: center;
                                        position: relative;
                                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                                    ">
                                
                                        <!-- Decorative elements for 3D effect -->
                                        <div style="
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        right: 0;
                                        height: 1px;
                                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                                        "></div>
                                    </div>
                                    </td>
                                </tr>
                                
    
                                <tr>
                                    <!-- Header Section -->
                                    <td style="padding: 10px 20px; text-align: center;">
                                        <h1 style="margin: 0 0 20px; color: #0C6D3A; font-family: Arial, sans-serif; font-weight: 900; font-size: 34px;">
                                            ARIMAX
                                        </h1>
                                    </td>
                                </tr>
    
                                <tr>
                                    <!-- Content Section -->
                                    <tr>
                                        <td style="padding: 10px 20px; text-align: center;">
                                            <p style="margin: 0 0 20px; color: #52525b; font-family: Arial, sans-serif; font-size: 16px;">
                                                To reset your password, proceed to use the verification token below on the password reset page
                                            </p>
                                            
                                            <p style="margin: 0 0 20px; color: #52525b; font-family: Arial, sans-serif; font-size: 16px;">
                                                For your security, please do not share this token with anyone. If you did not request this email, please contact our support team immediately.</p>
                                            
                                            <p style="margin: 0 0 30px; color: #52525b; font-family: Arial, sans-serif; font-size: 16px;">
                                            Your code is
                                            </p>
                                            
                                            <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 20px; margin: 0 auto 30px; max-width: 300px;">
                                            <h2 style="margin: 0; color: #18181b; font-family: Arial, sans-serif; font-size: 32px; letter-spacing: 2px;">
                                                ${token}
                                            </h2>
                                            </div>
                                            
                                            <p style="margin: 0 0 10px; color: #71717a; font-family: Arial, sans-serif; font-size: 14px;">
                                            This code expires in 10 minutes. Do not share this code with anyone.
                                            </p>
                                            
                                            <p style="margin: 40px 0 0; color: #71717a; font-family: Arial, sans-serif; font-size: 14px;">
                                            Wasn't you? You can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>`,
        sucessFullOrder: ``,
        cancelOrder: ``
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: '"Baddie at Arimax 👻" <maddison53@ethereal.email>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: `Hello, you clicked to reset your password. This is your reset Token. ${token}`, // plain text body
            html: emailType[type], // html body
        });
        
        console.log("Message sent: %s", info.messageId);
        if(info){
            return "sent";
        }
    } catch (err: unknown) {
        console.log("This is error why mail no send: ", err)
        const error = err as string
        throw new Error(error)
    }
}