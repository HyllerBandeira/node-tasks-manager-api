const sgMail = require('@sendgrid/mail');
const sendGridApi = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridApi);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hyller.bandeira@gmail.com',
        subject: 'Welcome to the APP!',
        text: `Welcome to the app, ${name}. Let me know how you get along with this app.`
    });
};

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hyller.bandeira@gmail.com',
        subject: 'We gonna miss you.',
        text: `${name}, we wanna tank to stay with us. And we would like to know the reason that you are leaving us, please reply this email, explaining the reason.`
    });
};

module.exports = { 
    sendWelcomeEmail,
    sendGoodbyeEmail
}