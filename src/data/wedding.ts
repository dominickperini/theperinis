// All wedding facts live here. Change a value in this file and every page
// uses the new value. Text in [square brackets] is a placeholder: replace it.

export const wedding = {
  couple: { first: 'Dominick', second: 'Sarah', lastName: 'Perini' },
  date: 'Sunday, September 5, 2027',
  dateISO: '2027-09-05T16:00:00-06:00', // Change the time when the ceremony time is known.
  city: 'Indian Hills, Colorado',
  venue: {
    name: 'Dunafon Castle',
    address: '24020 SH-74, Indian Hills, CO 80454',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dunafon+Castle+24020+SH-74+Indian+Hills+CO+80454',
  },
  rsvpDeadline: '[RSVP deadline]', // Example: 'May 1, 2027'
  contactEmail: '[contact email]',
  hashtag: '', // Example: '#ThePerinis'
};

// Our milestones, oldest first. To add a travel story, copy one block and put it
// in the correct place by date. "text" can be empty.
export const story = [
  { title: 'We met', date: 'October 7, 2022', text: '' },
  { title: 'We started dating', date: 'October 21, 2022', text: '' },
  { title: 'We moved into our house in Broomfield', date: 'Thanksgiving 2024', text: '' },
  { title: 'We got engaged', date: 'July 10, 2025', text: '' },
  { title: 'We adopted our dog, Sapporo', date: 'January 6, 2026', text: '' },
  { title: 'We get married', date: 'September 5, 2027', text: 'At Dunafon Castle. We hope to see you there!' },
];

export const schedule = [
  {
    day: 'Saturday, September 4, 2027',
    events: [
      {
        time: '[Time]',
        name: 'Welcome drinks',
        place: '[Place]',
        details: 'All guests are welcome. [Remove this event if you do not have one.]',
      },
    ],
  },
  {
    day: 'Sunday, September 5, 2027',
    events: [
      { time: '[Time]', name: 'Ceremony', place: 'Dunafon Castle', details: 'Please arrive 20 minutes early.' },
      { time: '[Time]', name: 'Cocktail hour', place: 'Dunafon Castle', details: '' },
      { time: '[Time]', name: 'Dinner and dancing', place: 'Dunafon Castle', details: '' },
      { time: '[Time]', name: 'Last dance', place: '', details: '' },
    ],
  },
];

export const travel = {
  airports: [
    { name: '[Nearest airport (code)]', note: '[Distance or drive time to the venue]' },
  ],
  hotels: [
    {
      name: '[Hotel name]',
      address: '[Hotel address]',
      note: 'We have a room block. Use the code [CODE]. Book before [date].',
      url: '',
    },
  ],
  gettingAround: '[Tell guests about parking, shuttles, or ride share.]',
  thingsToDo: [
    '[A place to eat]',
    '[A place to visit]',
  ],
};

export const registry = {
  intro:
    'Your presence at our wedding is the best gift. If you want to give a gift, you can find our registry here.',
  links: [
    { name: '[Store name]', url: '' },
  ],
};

export const faq = [
  { q: 'What is the dress code?', a: '[Dress code, for example: Cocktail attire.]' },
  { q: 'Can I bring a guest?', a: 'Your invitation shows the number of seats that we saved for you. Please RSVP only for these seats.' },
  { q: 'Are children welcome?', a: '[Yes or no, and any details.]' },
  { q: 'Is the venue indoors or outdoors?', a: '[Indoors, outdoors, or both. Tell guests what shoes to wear.]' },
  { q: 'Is there parking at the venue?', a: '[Parking details.]' },
  { q: 'When must I RSVP?', a: `Please RSVP before ${wedding.rsvpDeadline}.` },
  { q: 'Who do I contact with questions?', a: `Send an email to ${wedding.contactEmail}.` },
];

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/story', label: 'Our Story' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/travel', label: 'Travel' },
  { href: '/registry', label: 'Registry' },
  { href: '/faq', label: 'FAQ' },
  { href: '/rsvp', label: 'RSVP' },
];
