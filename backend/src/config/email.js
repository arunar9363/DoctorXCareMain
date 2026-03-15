import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // Gmail App Password
  }
})

export const sendOTPEmail = async (toEmail, otp, name) => {
  await transporter.sendMail({
    from: `"DoctorXCare" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset OTP — DoctorXCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2 style="color: #0ea5e9;">DoctorXCare</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>Your OTP for password reset is:</p>
        <h1 style="letter-spacing: 8px; color: #0ea5e9;">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `
  })
}

export default transporter