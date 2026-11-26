// Photos and short films for the site.
//
// The photos are in src/assets/photos/ (p01.jpg to p59.jpg). To add a photo,
// put the file there and add a line to `library` below.
// For a short film loop, put an MP4 (5 to 8 seconds, no sound, less than
// 2 MB) in public/films/ and set `video: '/films/name.mp4'`. The photo shows
// first and when motion is off.
import type { ImageMetadata } from 'astro';

export interface Media {
  image: ImageMetadata;
  alt: string;
  /** A short field note under the photo: place, date, camera. */
  note?: string;
  /** The day the photo was taken (YYYY-MM-DD), if known. */
  date?: string;
  video?: string;
  placeholder?: boolean;
}

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });
const p: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.replace('.jpg', ''), mod.default]),
);

// All photos. "note" is the month and year when the photo has a date.
const library: Media[] = [
  { image: p['p01'], alt: "Selfie on a terrace above red roofs and a lake.", note: "", date: "" },
  { image: p['p02'], alt: "At a food counter with drinks and snacks.", note: "November 2022", date: "2022-11-23" },
  { image: p['p03'], alt: "Selfie on a stone balcony.", note: "November 2022", date: "2022-11-23" },
  { image: p['p04'], alt: "On a snowy trail with a golden dog.", note: "March 2026", date: "2026-03-08" },
  { image: p['p05'], alt: "In rain jackets above white sea cliffs.", note: "September 2026", date: "2026-09-30" },
  { image: p['p06'], alt: "A hug in front of a Christmas tree.", note: "", date: "" },
  { image: p['p07'], alt: "Arms up under a wooden arch in the mountains.", note: "July 2025", date: "2025-07-07" },
  { image: p['p08'], alt: "Selfie under a blue sky.", note: "October 2022", date: "2022-10-21" },
  { image: p['p09'], alt: "At a hockey game at Magness Arena.", note: "December 2022", date: "2022-12-03" },
  { image: p['p10'], alt: "Dressed up under a garden arbor of flowers.", note: "September 2025", date: "2025-09-06" },
  { image: p['p11'], alt: "In Civil War uniforms beside a tent.", note: "", date: "" },
  { image: p['p12'], alt: "Selfie on a rock above a river valley.", note: "July 2025", date: "2025-07-04" },
  { image: p['p13'], alt: "Selfie at sunset in front of green peaks.", note: "July 2026", date: "2026-07-13" },
  { image: p['p14'], alt: "A kiss on the cheek at dusk.", note: "", date: "" },
  { image: p['p15'], alt: "Selfie in the desert at sunset.", note: "June 2023", date: "2023-06-24" },
  { image: p['p16'], alt: "In costume in a bathroom mirror.", note: "", date: "" },
  { image: p['p17'], alt: "Dressed up in light blue.", note: "", date: "" },
  { image: p['p18'], alt: "Selfie at night.", note: "", date: "" },
  { image: p['p19'], alt: "Selfie on a desert road at sunset.", note: "November 2022", date: "2022-11-23" },
  { image: p['p20'], alt: "In Civil War uniforms, close up.", note: "", date: "" },
  { image: p['p21'], alt: "Selfie in golden light by bare trees.", note: "December 2025", date: "2025-12-21" },
  { image: p['p22'], alt: "At a costume party.", note: "", date: "" },
  { image: p['p23'], alt: "Under string lights at night.", note: "", date: "" },
  { image: p['p24'], alt: "On a hilltop terrace above green valleys.", note: "July 2025", date: "2025-07-11" },
  { image: p['p25'], alt: "At a Renaissance festival.", note: "August 2025", date: "2025-08-03" },
  { image: p['p26'], alt: "In costume in a hallway.", note: "", date: "" },
  { image: p['p27'], alt: "A kiss at sunset by a river.", note: "July 2026", date: "2026-07-13" },
  { image: p['p28'], alt: "In a red room with walls of bottles.", note: "July 2026", date: "2026-07-17" },
  { image: p['p29'], alt: "In a garden, in a cherry dress.", note: "June 2023", date: "2023-06-01" },
  { image: p['p30'], alt: "A black and white photo booth picture.", note: "", date: "" },
  { image: p['p31'], alt: "Selfie on a city street.", note: "July 2025", date: "2025-07-14" },
  { image: p['p32'], alt: "With a black and white cat.", note: "October 2025", date: "2025-10-22" },
  { image: p['p33'], alt: "Race medals in the snow by a lake pavilion.", note: "November 2022", date: "2022-11-19" },
  { image: p['p34'], alt: "On the couch with a big golden dog.", note: "April 2026", date: "2026-04-29" },
  { image: p['p35'], alt: "Dressed up on a street with palm trees.", note: "February 2026", date: "2026-02-21" },
  { image: p['p36'], alt: "Just engaged: the ring, in the mountains.", note: "July 2025", date: "2025-07-10" },
  { image: p['p37'], alt: "By a waterfall above a stone bridge.", note: "October 2026", date: "2026-10-08" },
  { image: p['p38'], alt: "Selfie by a lake.", note: "", date: "" },
  { image: p['p39'], alt: "Hiking below rock towers.", note: "July 2025", date: "2025-07-09" },
  { image: p['p40'], alt: "At a party.", note: "April 2025", date: "2025-04-19" },
  { image: p['p41'], alt: "Dressed up in a room with a harp.", note: "October 2026", date: "2026-10-01" },
  { image: p['p42'], alt: "In front of a wall of plants.", note: "", date: "" },
  { image: p['p43'], alt: "Selfie below a tall sculpture in a city.", note: "July 2026", date: "2026-07-17" },
  { image: p['p44'], alt: "Dressed up on a sunny terrace.", note: "September 2026", date: "2026-09-25" },
  { image: p['p45'], alt: "Selfie in evening clothes.", note: "September 2025", date: "2025-09-06" },
  { image: p['p46'], alt: "In climbing gear on a cliff.", note: "", date: "" },
  { image: p['p47'], alt: "Selfie in a big crowd at Red Rocks.", note: "", date: "" },
  { image: p['p48'], alt: "In climbing helmets.", note: "", date: "" },
  { image: p['p49'], alt: "Selfie at the airport.", note: "", date: "" },
  { image: p['p50'], alt: "Selfie on a hike with a long view.", note: "October 2026", date: "2026-10-17" },
  { image: p['p51'], alt: "On a bridge over the Grand Canal in Venice.", note: "", date: "" },
  { image: p['p52'], alt: "Selfie by a plaza.", note: "July 2026", date: "2026-07-12" },
  { image: p['p53'], alt: "In bike helmets.", note: "", date: "" },
  { image: p['p54'], alt: "In front of the Alamo.", note: "January 2023", date: "2023-01-12" },
  { image: p['p55'], alt: "Selfie at night by the river walk.", note: "", date: "" },
  { image: p['p56'], alt: "With mountain bikes on the car.", note: "February 2023", date: "2023-02-11" },
  { image: p['p57'], alt: "A mirror selfie.", note: "", date: "" },
  { image: p['p58'], alt: "A kiss on the dance floor.", note: "November 2022", date: "2022-11-06" },
  { image: p['p59'], alt: "Dancing in a busy hall.", note: "November 2022", date: "2022-11-06" },
];
export const byNumber = (n: number) => library[n - 1];

export const hero: Media = { ...byNumber(12), note: 'July 2025' };

// One photo for each milestone in the story timeline on the home page, in the same order as
// `story` in wedding.ts. Use null for a milestone with no photo.
export const storyPhotos: (Media | null)[] = [null, 8, 6, 36, 34, 10].map((n) => (n ? byNumber(n) : null));

// Every photo, newest first. Photos with no date go at the end.
export const gallery: Media[] = [...library].sort((a, b) => (b.date || '0').localeCompare(a.date || '0'));
