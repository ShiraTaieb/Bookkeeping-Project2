const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  // הגדרת כותרות CORS לחיבור תקין
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  // טיפול בבקשת preflight של הדפדפן
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ווידוא שהבקשה היא מסוג POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, phone, email, message } = req.body || {};

  // בדיקת תקינות בסיסית של הנתונים
  if (!name || !phone || !email) {
    return res.status(400).json({ error: "יש למלא את כל שדות החובה" });
  }

  // הגדרת המנוע לשליחת מיילים
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // הגדרת תוכן המייל
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
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
          ${message || "ללא הודעה נוספת"}
        </blockquote>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "ההודעה נשלחה בהצלחה!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "אירעה שגיאה בשליחת האימייל" });
  }
}
