const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const router = express.Router();
router.use(bodyParser.json());

router.post('/send-email', (req, res) => {
  const { name, description, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, 
      pass: process.env.EMAIL_PASSWORD 
    }
  });

  const mailOptions = {
    from: process.env.EMAIL, 
    to: process.env.TO_EMAIL,
    subject: 'New Message from Contact Form',
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${description}</p>
    `
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});

module.exports = router;
