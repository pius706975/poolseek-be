import {
    MAILER_HOST,
    MAILER_PORT,
    MAILER_EMAIL,
    MAILER_PASSWORD,
    MAILER_SENDER_NAME,
} from '@/config';
import nodemailer from 'nodemailer';

const sendEmail = async (
    recipient: string,
    subject: string,
    header: string,
    text1: string,
    text2: string,
    text3: string,
    footerText: string,
    year: string,
): Promise<nodemailer.SentMessageInfo> => {
    try {
        const transporter = nodemailer.createTransport({
            host: MAILER_HOST,
            port: parseInt(MAILER_PORT || '587', 10),
            secure: MAILER_PORT === '465',
            auth: {
                user: MAILER_EMAIL,
                pass: MAILER_PASSWORD,
            },
        });

        const mailOptions = {
            from: MAILER_SENDER_NAME,
            to: recipient,
            subject,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Notification</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f8f9fa;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }
                        .header {
                            background-color: #007bff;
                            color: white;
                            text-align: center;
                            padding: 20px;
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 20px;
                            text-align: left;
                            line-height: 1.6;
                        }
                        .content p {
                            margin: 10px 0;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 20px;
                            margin-top: 20px;
                            background-color: #007bff;
                            color: white;
                            text-decoration: none;
                            font-weight: bold;
                            border-radius: 5px;
                        }
                        .footer {
                            text-align: center;
                            padding: 15px;
                            font-size: 12px;
                            color: #666;
                            background-color: #f1f1f1;
                            border-top: 1px solid #ddd;
                        }
                        .footer a {
                            color: #007bff;
                            text-decoration: none;
                        }
                        .footer a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            ${header}
                        </div>
                        <div class="content">
                            <p>${text1}</p>
                            <p>${text2}</p>
                            <p>${text3}</p>
                        </div>
                        <div class="footer">
                            <p>${footerText}</p>
                            <p>© ${year} <a href="#">Stack Seek</a>. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                `,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default sendEmail;
