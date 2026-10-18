// Photos and short films for the site.
//
// All images here are PLACEHOLDERS (drawn foothill scenes). To use your own:
// 1. Put the photo in src/assets/photos/ (full size JPG is fine).
// 2. Import it below and put it in place of a placeholder.
// 3. For a short film loop, put an MP4 (5 to 8 seconds, no sound, less than
//    2 MB) in public/films/ and set `video: '/films/name.mp4'`. The photo
//    shows first and when motion is off.
import type { ImageMetadata } from 'astro';
import foothillsDawn from '../assets/placeholder/foothills-dawn.jpg';
import pinesMist from '../assets/placeholder/pines-mist.jpg';
import ridgeGold from '../assets/placeholder/ridge-gold.jpg';
import valleySoft from '../assets/placeholder/valley-soft.jpg';
import duskBlue from '../assets/placeholder/dusk-blue.jpg';
import meadowMoss from '../assets/placeholder/meadow-moss.jpg';
import granite from '../assets/placeholder/granite.jpg';

export interface Media {
  image: ImageMetadata;
  alt: string;
  /** A short field note under the photo: place, date, camera. */
  note?: string;
  video?: string;
  placeholder?: boolean;
}

export const hero: Media = {
  image: foothillsDawn,
  alt: 'Foothills at dawn, in layers of mist.',
  note: 'Foothills at dawn',
  placeholder: true,
};

// Photos for the "Field notes" section on the home page, in order.
export const fieldNotes: Media[] = [
  { image: pinesMist, alt: 'Pine trees in mist.', note: 'Pines in the mist', placeholder: true },
  { image: granite, alt: 'Close view of granite.', note: 'Granite', placeholder: true },
  { image: ridgeGold, alt: 'Mountain ridges at golden hour.', note: 'Golden hour', placeholder: true },
  { image: meadowMoss, alt: 'A green meadow with a line of pines.', note: 'The meadow', placeholder: true },
  { image: duskBlue, alt: 'Ridges and pines at dusk.', note: 'Dusk', placeholder: true },
];

// One photo for each milestone on the Our Story page, in the same order as
// `story` in wedding.ts. If there are more milestones than photos, the
// photos repeat.
export const storyPhotos: Media[] = [
  { image: valleySoft, alt: 'A soft green valley.', placeholder: true },
  { image: pinesMist, alt: 'Pine trees in mist.', placeholder: true },
  { image: meadowMoss, alt: 'A green meadow with a line of pines.', placeholder: true },
  { image: ridgeGold, alt: 'Mountain ridges at golden hour.', placeholder: true },
  { image: duskBlue, alt: 'Ridges and pines at dusk.', placeholder: true },
  { image: foothillsDawn, alt: 'Foothills at dawn.', placeholder: true },
];
