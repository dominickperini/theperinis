// All wedding facts live here. Change a value in this file and every page
// uses the new value. Text in [square brackets] is a placeholder: replace it.

export const wedding = {
  couple: { first: 'Dominick', second: 'Sarah', lastName: 'Perini' },
  date: '[Wedding date]', // Example: 'Saturday, June 12, 2027'
  dateISO: '', // Example: '2027-06-12T16:00:00-04:00'. Set it to show a countdown.
  city: '[City, State]',
  venue: {
    name: '[Venue name]',
    address: '[Venue street address, City, State ZIP]',
    mapUrl: '', // A Google Maps or Apple Maps link
  },
  rsvpDeadline: '[RSVP deadline]', // Example: 'May 1, 2027'
  contactEmail: '[contact email]',
  hashtag: '', // Example: '#ThePerinis'
};

export const story = [
  {
    title: 'How we met',
    date: '[Year]',
    text: '[Tell the story of how you met. Two or three short sentences are enough.]',
  },
  {
    title: 'Our first date',
    date: '[Year]',
    text: '[Where did you go? What happened?]',
  },
  {
    title: 'The proposal',
    date: '[Year]',
    text: '[Tell the story of the proposal.]',
  },
];

export const schedule = [
  {
    day: '[Day before the wedding]',
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
    day: '[Wedding day]',
    events: [
      { time: '[Time]', name: 'Ceremony', place: '[Place]', details: 'Please arrive 20 minutes early.' },
      { time: '[Time]', name: 'Cocktail hour', place: '[Place]', details: '' },
      { time: '[Time]', name: 'Dinner and dancing', place: '[Place]', details: '' },
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
  { q: 'Can I bring a guest?', a: 'Your invitation shows the names of all invited guests. Please RSVP only for these names.' },
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
