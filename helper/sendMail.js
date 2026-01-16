const nodemailer = require('nodemailer');

module.exports.sendMail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD 
    },
    tls: {
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

  // Sử dụng try...catch để await kết quả
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent thành công: ' + info.response);
    return info;
  } catch (error) {
    console.log("Lỗi gửi mail cụ thể:", error);
    throw error; // Quăng lỗi ra để hàm gọi nó có thể xử lý (ví dụ trả về 500)
  }
};