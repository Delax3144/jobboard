import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

mailTransporter.verify((error) => {
  if (error) {
    console.error(
      "Nodemailer connection failed:",
      error.message
    );
    return;
  }

  console.log("Nodemailer connected successfully.");
});