import sendgrid from '@sendgrid/mail';
import keys from '../constants/keys';
sendgrid.setApiKey(keys.SENDGRID_API_KEY);

const sendMail = async (to: string, subject: string, text: string) => {
  const message = {
    to,
    from: 'bot@wohnungsbot.de',
    subject,
    text
  };
  await sendgrid.send(message);
};

export default sendMail;
