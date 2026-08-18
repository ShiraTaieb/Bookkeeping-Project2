require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// הרשאות גישה והמרת נתונים ל-JSON
app.use(cors());
app.use(express.json());

// הגדרת החיבור לשרת המיילים של גוגל
// הגדרת המנוע לשליחת מיילים
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // עוקף את השגיאה של תעודת אבטחה מקומית/סינון רשת בסביבת הפיתוח
      rejectUnauthorized: false,
    },
  });

// נקודת הקצה (Endpoint) שמקבלת את הפרטים מהטופס
app.post('/api/contact', async (req, res) => {
  const { name, phone, email, message } = req.body;

  // בדיקת תקינות בסיסית של הנתונים
  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'יש למלא את כל שדות החובה' });
  }

  // הגדרת תוכן המייל שישלח אלייך
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // השליחה היא אל תיבת הדואר שלך
    replyTo: email, // אפשרות להשיב ישירות למייל של הלקוח
    subject: `פנייה חדשה מהטופס באתר: ${name}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>התקבלה פנייה חדשה מהאתר!</h2>
        <hr />
        <p><strong>שם מלא:</strong> ${name}</p>
        <p><strong>מספר טלפון:</strong> ${phone}</p>
        <p><strong>כתובת אימייל:</strong> ${email}</p>
        <p><strong>הודעה:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-right: 3px solid #ccc;">
          ${message || 'ללא הודעה נוספת'}
        </blockquote>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'ההודעה נשלחה בהצלחה!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'אירעה שגיאה בשליחת האימייל' });
  }
});

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});