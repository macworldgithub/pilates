# Prototype image assets

These are source copies of the prototype artwork. At runtime the app loads image URLs returned by the backend, served from `pilates-backend/public/images` under `/media/images/`. The Pilates studio and instructor photos are illustrative sample imagery, not MoveActive partner content or the actual person represented by the sample instructor profile. Product images come from MoveActive's public product listings.

```text
assets/images/
  lifestyle/
    onboarding-hero.jpg
    reformer-reset.jpg
  studios/
    core-collective.jpg
    pilates-room.jpg
    form-flow.jpg
  instructors/
    mia-chen.jpg
  products/
    grip-socks-pink.png
    grip-socks-blue.jpg
    yoga-mat-espresso.png
    pilates-starter-bundle.jpg
```

The backend packages **10 image files**. Replace its copies with approved brand or studio imagery, retaining filenames or updating the seeded image URLs. `src/data/artwork.ts` resolves backend URLs; `src/components/OrbitImage.tsx` provides failed-image retry UI. Seeded v1 records also use this illustrative artwork.

## Image sources

- Pilates lifestyle and studio imagery: [Unsplash reformer photo](https://unsplash.com/photos/a-woman-is-doing-exercises-on-a-rowing-machine-0xn-8kRWOhE), [Unsplash reformer photo](https://unsplash.com/photos/woman-does-pilates-on-a-reformer-machine-Ii2qS9qUVhU), and [Unsplash reformer photo](https://unsplash.com/es/fotos/mujer-esta-haciendo-pilates-en-una-maquina-reformer--XuG2BfYIVE).
- Instructor portrait used as a placeholder: [R&R Physio Pilates](https://www.rrphysiopilates.com/about-us).
- Product photos: [pink grip socks](https://moveactive.com.au/products/classic-low-rise-grip-socks-power-in-pairs-pink), [blue grip socks](https://moveactive.co.uk/products/classic-low-rise-grip-socks-powder-blue), [Espresso yoga mat](https://moveactive.com.au/products/microfibre-yoga-mat-espresso), and [Pilates Ultimate Set](https://moveactive.com.au/products/pilates-ultimate-set-soft-pink).
