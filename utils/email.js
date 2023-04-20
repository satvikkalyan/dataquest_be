const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const router = express.Router();
router.use(bodyParser.json());

router.post('/send-email', (req, res) => {
  const { name, description, email } = req.body;

  // Create a transporter object to send the email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'satvikkalyan99@gmail.com', // Replace with your own email address
      pass: '' // Replace with your own email password
    }
  });

  // Define the email options
  const mailOptions = {
    from: 'satvikkalyan99@gmail.com',
    to: 'satvikkalyan@gmail.com',
    subject: 'New Message from Contact Form',
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${description}</p>
    `
  };

  // Send the email
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
