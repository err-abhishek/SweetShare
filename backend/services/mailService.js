import nodemailer from "nodemailer";

const sendMail = async ({ from, to, subject, text, html }) => {
  try {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.MAIL_USER, // SMTP username
        pass: process.env.MAIL_PASSWORD, // SMTP password
      },
    });

    // Send mail with the defined transport object
    await transporter.sendMail({
      from: `SweetShare <${from}>`, // sender address
      to: to, // list of receivers
      subject: subject, // subject line
      text: text, // plain text body
      html: html, // HTML body
    });
  } catch (error) {
    console.log("Error sending email:", err);
    console.error("Error sending email: ", error);
  }
};

export default sendMail;
