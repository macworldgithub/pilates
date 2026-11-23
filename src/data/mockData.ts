import { ImageSourcePropType } from 'react-native';

export const photos: Record<string, ImageSourcePropType | undefined> = {
  hero: require('../../assets/images/lifestyle/onboarding-hero.jpg'),
  session: require('../../assets/images/lifestyle/reformer-reset.jpg'),
  studio: require('../../assets/images/studios/core-collective.jpg'),
  studioSouthYarra: require('../../assets/images/studios/pilates-room.jpg'),
  studioRichmond: require('../../assets/images/studios/form-flow.jpg'),
  instructor: require('../../assets/images/instructors/mia-chen.jpg'),
  socks: require('../../assets/images/products/grip-socks-pink.png'),
  socksBlue: require('../../assets/images/products/grip-socks-blue.jpg'),
  mat: require('../../assets/images/products/yoga-mat-espresso.png'),
  bundle: require('../../assets/images/products/pilates-starter-bundle.jpg'),
};

export const studios = [
  { id: 'core-collective', name: 'Core Collective', area: 'Prahran', distance: '1.2 km', formats: ['Reformer', 'Mat Pilates'], verified: true, instructorIds: ['mia-chen'] },
  { id: 'pilates-room', name: 'The Pilates Room', area: 'South Yarra', distance: '2.8 km', formats: ['Reformer', 'Mat Pilates'], verified: true, instructorIds: [] },
  { id: 'form-flow', name: 'Form & Flow Studio', area: 'Richmond', distance: '4.1 km', formats: ['Mat Pilates'], verified: true, instructorIds: [] },
];

export const instructors = [
  { id: 'mia-chen', name: 'Mia Chen', studioId: 'core-collective', specialty: 'Reformer', approval: 'Studio-affiliated' },
];

export const products = [
  { id: 'grip-socks-pink', name: 'Crew Grip Socks · Sweetie Candy Pink', price: '$22.95', image: photos.socks },
  { id: 'grip-socks-blue', name: 'Crew Grip Socks · Donut Ice Blue', price: '$22.95', image: photos.socksBlue },
  { id: 'yoga-mat-espresso', name: 'Microfibre Yoga Mat · Check Espresso', price: '$109.00', image: photos.mat },
  { id: 'starter-bundle', name: 'Pilates Starter Bundle', price: '$129.00', image: photos.bundle },
];
