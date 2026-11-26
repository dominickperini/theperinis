// The electronic save-the-date: one text or email for each party, with the
// party's own link to the address form. We send it from our own phone or email
// app (the site does not send messages), so each guest gets a personal note.
import { wedding } from '../data/wedding';
import type { Party } from './guests';

const SITE = 'https://theperinis.net';
const names = `${wedding.couple.first} and ${wedding.couple.second}`;
const place = `${wedding.venue.name} in ${wedding.city}`;

/** The party's own link. It opens the address form with their name already selected. */
export const addressLink = (p: Party, origin = SITE) => `${origin}/wedding/address?code=${p.code}`;

export const subject = `Save the date: ${wedding.couple.first} & ${wedding.couple.second}, September 5, 2027`;

/** The text message: short, one link (phones show a preview picture for it). */
export const textMessage = (p: Party, origin = SITE) =>
  `Save the date! ${names} are getting married on ${wedding.date}, at ${place}. ` +
  `Please send us your mailing address for the invitation: ${addressLink(p, origin)}`;

/** The email. */
export const emailMessage = (p: Party, origin = SITE) =>
  [
    `Hi ${p.name},`,
    '',
    `Save the date! We are getting married on ${wedding.date}, at ${place}.`,
    '',
    'A printed invitation will follow. Please tell us where to send it (it takes about one minute):',
    addressLink(p, origin),
    '',
    'We cannot wait to celebrate with you!',
    '',
    names,
  ].join('\n');

/** Opens the Messages app with the text ready to send. Works on iPhone and Android. */
export const smsHref = (p: Party, origin = SITE) =>
  `sms:${p.phone ?? ''}?&body=${encodeURIComponent(textMessage(p, origin))}`;

/** Opens the email app with the email ready to send. */
export const mailtoHref = (p: Party, origin = SITE) =>
  `mailto:${encodeURIComponent(p.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailMessage(p, origin))}`;
