import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASSWORD,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"Snapcart" ${process.env.MAILER_EMAIL}`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log(error);
  }
};
