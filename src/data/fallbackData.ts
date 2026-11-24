import type { AppConfig, Format, Instructor, Offer, Product, Referral, Studio, Workout } from '../api/types';

export const fallbackConfig: AppConfig = {
  heroImageUrl: '/media/images/lifestyle/onboarding-hero.jpg',
  shopHeroImageUrl: '/media/images/products/yoga-mat-espresso.png',
  areas: [
    { area: 'Melbourne, VIC', latitude: -37.84, longitude: 144.98 },
    { area: 'South Yarra, VIC', latitude: -37.839, longitude: 144.993 },
    { area: 'Prahran, VIC', latitude: -37.8493, longitude: 144.9905 },
    { area: 'Richmond, VIC', latitude: -37.819, longitude: 145.0 },
  ],
  interestOptions: [
    { label: 'Strength', value: 'strength' },
    { label: 'Mobility', value: 'mobility' },
    { label: 'Mindfulness', value: 'relaxation' },
  ],
  formats: ['reformer', 'mat'] as Format[],
  eventConcept: { studioId: 'core-collective', title: 'Reformer fundamentals workshop', weekday: 'SAT', day: '24' },
};

export const fallbackInstructor: Instructor = {
  id: 'instructor-mia',
  name: 'Mia Chen',
  bio: 'Senior Pilates instructor specializing in dynamic reformer and core restoration.',
  imageUrl: '/media/images/instructors/mia-chen.jpg',
  independent: false,
  approvalStatus: 'approved',
  published: true,
  studios: [],
  workouts: [],
  referrals: [{ code: 'MIA-MOVE', deepLink: 'orbit://referral/MIA-MOVE' }],
};

export const fallbackStudio: Studio = {
  id: 'the-pilates-room',
  name: 'The Pilates Room',
  description: 'Boutique reformer and mat Pilates studio with mindful movement.',
  imageUrl: '/media/images/studios/pilates-room.jpg',
  city: 'Melbourne',
  country: 'AU',
  address: 'Sample studio, South Yarra VIC',
  latitude: -37.839,
  longitude: 144.993,
  distanceKm: 1.06,
  formats: ['reformer', 'mat'],
  partnerType: 'partner',
  websiteUrl: 'https://example.com/the-pilates-room',
  bookingUrl: 'https://example.com/the-pilates-room/book',
  instructors: [fallbackInstructor],
  workouts: [],
  referrals: [{ code: 'PILATESROOM10', deepLink: 'orbit://referral/PILATESROOM10' }],
  published: true,
};

export const fallbackProduct: Product = {
  id: 'grip-socks-pink',
  title: 'Crew Grip Socks · Sweetie Candy Pink',
  description: 'Breathable organic cotton grip socks with custom honeycomb sole.',
  imageUrl: '/media/images/products/grip-socks-pink.png',
  imageUrls: [
    '/media/images/products/grip-socks-pink.png',
    '/media/images/products/grip-socks-blue.jpg',
  ],
  collection: 'grip-socks',
  tags: ['pilates', 'socks', 'essentials'],
  currency: 'AUD',
  variants: [
    { id: 'pink-s', title: 'Small / Pink', price: 2200, available: true },
    { id: 'pink-m', title: 'Medium / Pink', price: 2200, available: true },
    { id: 'pink-l', title: 'Large / Pink', price: 2200, available: false },
  ],
  bundleProductIds: [],
  published: true,
};

export const fallbackStarterBundle: Product = {
  id: 'product-bundle',
  title: 'MoveActive Starter Equipment Bundle',
  description: 'Essential kit including premium grip socks and Pilates core ball.',
  imageUrl: '/media/images/products/pilates-starter-bundle.jpg',
  collection: 'bundles',
  tags: ['bundles', 'equipment'],
  currency: 'AUD',
  variants: [
    { id: 'bundle-sage', title: 'Sage / All-in-one', price: 4900, available: true },
  ],
  bundleProductIds: ['grip-socks-pink'],
  published: true,
};

export const fallbackWorkout: Workout = {
  id: 'reformer-reset-15',
  title: '15-minute Reformer Reset',
  description: 'A focused, energizing reformer session to lengthen and activate your core.',
  format: 'reformer',
  level: 'beginner',
  durationMinutes: 15,
  studioId: fallbackStudio.id,
  instructorIds: [fallbackInstructor.id],
  productIds: [fallbackProduct.id],
  imageUrl: '/media/images/lifestyle/reformer-reset.jpg',
  products: [fallbackProduct],
  instructors: [fallbackInstructor],
  studio: fallbackStudio,
  publishedAt: '2026-11-20T08:00:00Z',
};

// Cross-link
fallbackStudio.workouts = [fallbackWorkout];
fallbackInstructor.studios = [fallbackStudio];
fallbackInstructor.workouts = [fallbackWorkout];

export const fallbackStudios: Studio[] = [fallbackStudio];
export const fallbackWorkouts: Workout[] = [fallbackWorkout];
export const fallbackProducts: Product[] = [fallbackProduct, fallbackStarterBundle];
export const fallbackOffers: Offer[] = [
  {
    id: 'offer-welcome',
    title: 'Introductory Reformer Pack',
    description: '3 classes for $60 for new Movers.',
    studio: { id: fallbackStudio.id, name: fallbackStudio.name },
    distanceKm: 1.06,
  },
];
export const fallbackReferrals: Referral[] = [
  {
    code: 'MIA-MOVE',
    deepLink: 'orbit://referral/MIA-MOVE',
    owner: { id: fallbackInstructor.id, name: fallbackInstructor.name },
    ownerType: 'instructor',
    ownerId: fallbackInstructor.id,
    commissionsEnabled: false,
  },
  {
    code: 'PILATESROOM10',
    deepLink: 'orbit://referral/PILATESROOM10',
    owner: { id: fallbackStudio.id, name: fallbackStudio.name },
    ownerType: 'studio',
    ownerId: fallbackStudio.id,
    commissionsEnabled: false,
  },
];
