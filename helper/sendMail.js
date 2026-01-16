const nodemailer = require('nodemailer');

module.exports.sendMail = (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Sử dụng SSL cho cổng 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Bắt buộc phải là App Password (16 ký tự)
    },
    tls: {
      // Giúp vượt qua một số rào cản về chứng chỉ trên môi trường server
      rejectUnauthorized: false
    }
  });

  console.log("User:", process.env.EMAIL_USER);
  console.log("Pass:", process.env.EMAIL_PASSWORD ? "Loaded" : "Missing");
  console.log("Sending to:", email);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: html
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log("Lỗi gửi mail:", error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};