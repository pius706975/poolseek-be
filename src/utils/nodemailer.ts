import {
    MAILER_HOST,
    MAILER_PORT,
    MAILER_EMAIL,
    MAILER_PASSWORD,
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
            from: process.env.MAILER_EMAIL,
            to: recipient,
            subject,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #4CAF50;
                        padding: 10px;
                        text-align: center;
                        color: #ffffff;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }
                    .content {
                        padding: 20px;
                        color: #333333;
                        text-align: center;
                    }
                    .footer {
                        text-align: center;
                        padding: 10px;
                        color: #777777;
                        font-size: 12px;
                    }
                    a {
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${header}</h1>
                    </div>
                    <div class="content">
                        <p>${text1}</p>
                        <p>${text2}</p>
                        <p>${text3}</p>
                    </div>
                    <div class="footer">
                        <p>${footerText}</p>
                        <p>© ${year} <a href="#">Ticky</a>. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>`,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default sendEmail;