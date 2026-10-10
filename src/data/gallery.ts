/**
 * My World gallery. Photos live in src/assets/photos (web copies only —
 * originals are never committed). Astro optimises them at build time.
 * Captions describe what is visible; locations are added only when confirmed.
 */
import type { ImageMetadata } from 'astro';

import heroStudioBike from '../assets/photos/hero-studio-bike.jpg';
import bikesField from '../assets/photos/bikes-field.jpg';
import bikesArmsCrossed from '../assets/photos/bikes-arms-crossed.jpg';
import creativeMono from '../assets/photos/creative-deva-monochrome.jpg';
import portraitSeaside from '../assets/photos/portrait-seaside.jpg';
import portraitOlive from '../assets/photos/portrait-olive-shirt.jpg';
import portraitNight from '../assets/photos/portrait-night-garden.jpg';
import heritageWide from '../assets/photos/heritage-wide.jpg';
import heritagePortrait from '../assets/photos/heritage-portrait.jpg';
import travelTerrace from '../assets/photos/travel-terrace.jpg';
import travelSunrise from '../assets/photos/travel-hills-sunrise.jpg';
import travelRidge from '../assets/photos/travel-hills-ridge.jpg';

export type GalleryCategory = 'Bikes' | 'Travel' | 'Portraits' | 'Creative';

export interface Photo {
  id: string;
  src: ImageMetadata;
  alt: string;
  caption: string;
  category: GalleryCategory;
  published: boolean;
}

export const photos = {
  heroStudioBike,
  portraitSeaside,
  portraitOlive,
  portraitNight,
  heritagePortrait,
};

export const gallery: Photo[] = [
  { id: 'studio-bike', src: heroStudioBike, category: 'Bikes', published: true,
    alt: 'Dhanush seated on a motorcycle in a bright studio, one hand on the handlebar.',
    caption: 'Studio session' },
  { id: 'bikes-field', src: bikesField, category: 'Bikes', published: true,
    alt: 'Dhanush standing behind two motorcycles parked in tall grass, palm trees behind.',
    caption: 'Out on two wheels' },
  { id: 'bikes-arms-crossed', src: bikesArmsCrossed, category: 'Bikes', published: true,
    alt: 'Dhanush with arms crossed beside a row of motorcycles in a green field.',
    caption: 'Ride day' },
  { id: 'hills-sunrise', src: travelSunrise, category: 'Travel', published: true,
    alt: 'Dhanush in a white shirt looking out over misty hills at sunrise.',
    caption: 'First light over the hills' },
  { id: 'hills-ridge', src: travelRidge, category: 'Travel', published: true,
    alt: 'Dhanush smiling on a grassy ridge with blue mountains in the distance.',
    caption: 'On the ridge' },
  { id: 'terrace', src: travelTerrace, category: 'Travel', published: true,
    alt: 'Dhanush in a jacket and sunglasses on a terrace surrounded by palm trees.',
    caption: 'Between the palms' },
  { id: 'heritage-wide', src: heritageWide, category: 'Travel', published: true,
    alt: 'Dhanush leaning against a carved stone pillar under a striped canopy.',
    caption: 'Carved stone and shade' },
  { id: 'seaside', src: portraitSeaside, category: 'Portraits', published: true,
    alt: 'Dhanush in a white shirt and sunglasses by the sea, a ship blurred behind him.',
    caption: 'By the sea' },
  { id: 'heritage-portrait', src: heritagePortrait, category: 'Portraits', published: true,
    alt: 'Dhanush in an olive shirt and white trousers adjusting his sunglasses beside a pillar.',
    caption: 'Olive and stone' },
  { id: 'olive-shirt', src: portraitOlive, category: 'Portraits', published: true,
    alt: 'Close portrait of Dhanush in an olive shirt, lowering his sunglasses.',
    caption: 'Up close' },
  { id: 'night-garden', src: portraitNight, category: 'Portraits', published: true,
    alt: 'Dhanush in a light shirt at night among illuminated banana leaves.',
    caption: 'Night garden' },
  { id: 'deva-monochrome', src: creativeMono, category: 'Creative', published: true,
    alt: 'Black-and-white editorial portrait of Dhanush beside the word DEVA in spaced letters.',
    caption: 'DEVA — monochrome editorial' },
];

export const publishedGallery = gallery.filter((p) => p.published);
export const galleryCategories = [...new Set(publishedGallery.map((p) => p.category))];
