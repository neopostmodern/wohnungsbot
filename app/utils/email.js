// @flow

import sendgrid from '@sendgrid/mail';
import utf8 from 'utf8';
import { SENDGRID_API_KEY } from '../constants/keys';

sendgrid.setApiKey(SENDGRID_API_KEY);

const sendMail = async (to: string, subject: string, text: string) => {
  const message = {
    to,
    from: 'bot@wohnung.neopostmodern.com',
    subject: utf8.encode(subject),
    text: utf8.encode(text)
  };

  await sendgrid.send(message);
};

export default sendMail;
