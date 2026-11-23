import { DeliveryPreview, MembershipScreen, ProductGallery, ProductTagScreen } from './src/components/ReferenceScreens';
import { OrbitImage } from './src/components/OrbitImage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { api, ApiError, money } from './src/api/client';
import type { AppConfig, Area, Cart, CartItem, CheckoutInput, Format, Instructor, Offer, Order, Product, Quote, Referral, Session, Studio, Workout } from './src/api/types';
import { artwork } from './src/data/artwork';
import { BottomNav, Button, Chip, Heading, Photo, ProductCard, SectionTitle, styles, TopBar } from './src/components/OrbitUI';
import { StudioCard, WorkoutCard } from './src/components/OrbitCards';
import { AdminPanel } from './src/components/AdminPanel';
import type { Screen } from './src/types';

const emptyCart: Cart = { items: [], subtotal: 0, currency: null, checkoutReady: false, revision: 0 };

function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [tab, setTab] = useState<Screen>('discover');
  const [session, setSession] = useState<Session>();
  const [format, setFormat] = useState<Format>('reformer');
  const [level, setLevel] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [nearMe, setNearMe] = useState(true);
  const [interest, setInterest] = useState('');
  const [area, setArea] = useState<Area>();
  const [config, setConfig] = useState<AppConfig>();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [search, setSearch] = useState('');
  const [collection, setCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [studio, setStudio] = useState<Studio>();
  const [instructor, setInstructor] = useState<Instructor>();
  const [workout, setWorkout] = useState<Workout>();
  const [product, setProduct] = useState<Product>();
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [discountCode, setDiscountCode] = useState('');
  const [fulfillment, setFulfillment] = useState<CheckoutInput['fulfillment']>('delivery');
  const [quote, setQuote] = useState<Quote>();
  const [order, setOrder] = useState<Order>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [referral, setReferral] = useState<Referral>();
  const [staffUsername, setStaffUsername] = useState('staff');
  const [staffPassword, setStaffPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(0);
  const [booting, setBooting] = useState(true);
  const actionLock = useRef(false);
  const checkoutKey = useRef<string | undefined>(undefined);
  const checkoutBody = useRef<CheckoutInput | undefined>(undefined);
  const listVersion = useRef(0);
  const navigationHistory = useRef<Screen[]>([]);
  const busy = booting || pending > 0;
  const sessionId = session?.id;
  const invalidateLists = useCallback(() => { listVersion.current++; }, []);
  const bagCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const reportError = useCallback((reason: unknown) => {
    setError(reason instanceof Error ? reason.message : 'Something went wrong. Please retry.');
    if (reason instanceof ApiError && reason.status === 401) {
      setNotice('Your session or admin access expired. Retry connecting.');
    }
  }, []);
  const task = useCallback((work: () => Promise<void>) => {
    if (actionLock.current) { return; }
    actionLock.current = true; setPending(n => n + 1); setError(''); setNotice('');
    work().catch(reportError).finally(() => { actionLock.current = false; setPending(n => n - 1); });
  }, [reportError]);

  const bootstrap = useCallback(async () => {
    setBooting(true); setError('');
    try {
      const restored = await api.initialize();
      const [bag, history, groups, settings, connections] = await Promise.all([api.cart(), api.orders(), api.collections(), api.config(), api.referrals()]);
      setConfig(settings); setReferrals(connections.data); setArea(settings.areas[0]);
      setSession(restored); setCart(bag); setOrders(history.data); setCollections(groups.data);
      if (restored.profile.latitude !== undefined && restored.profile.longitude !== undefined) {
        setArea({ area: restored.profile.area ?? 'Selected area', latitude: restored.profile.latitude, longitude: restored.profile.longitude });
      }
      if (restored.profile.formats?.[0]) { setFormat(restored.profile.formats[0]); }
      setInterest(restored.profile.interests?.[0] ?? settings.interestOptions[0]?.value ?? '');
      if (restored.profile.onboardingComplete) { setScreen('discover'); setTab('discover'); }
    } catch (reason) { reportError(reason); }
    finally { setBooting(false); }
  }, [reportError]);
  useEffect(() => { bootstrap(); }, [bootstrap]);

  const reload = useCallback(async () => {
    const version = ++listVersion.current;
    const location = session?.profile.latitude !== undefined ? { latitude: session.profile.latitude, longitude: session.profile.longitude! } : area;
    if (!location) { return; }
    const geoQuery = nearMe ? { latitude: location.latitude, longitude: location.longitude, radiusKm: 10, sort: 'nearest' } : {};
    const [s, w, p, o, connections] = await Promise.all([
      api.studios({ limit: 100, format, ...geoQuery, search: screen === 'studios' || screen === 'discover' ? search : undefined }),
      api.workouts({ limit: 100, format, level, search: screen === 'discover' || screen === 'move' ? search : undefined }),
      api.products({ limit: 100, collection, search: screen === 'shop' ? search : undefined }),
      api.offers(nearMe ? { latitude: location.latitude, longitude: location.longitude } : {}),
      api.referrals(),
    ]);
    if (version === listVersion.current) { setStudios(s.data); setWorkouts(w.data); setProducts(p.data); setOffers(o.data); setReferrals(connections.data); }
  }, [format, level, nearMe, search, collection, session?.profile.latitude, session?.profile.longitude, screen, area]);
  useEffect(() => {
    if (!sessionId) { return; }
    const timer = setTimeout(() => {
      setPending(n => n + 1);
      reload().catch(reportError).finally(() => setPending(n => n - 1));
    }, 250);
    return () => { clearTimeout(timer); invalidateLists(); };
  }, [sessionId, reload, reportError, invalidateLists]);

  const navigate = (next: Screen) => { navigationHistory.current.push(screen); setScreen(next); };
  const goTab = (next: Screen) => { navigationHistory.current = []; setTab(next); setScreen(next); setSearch(''); setNotice(''); setFiltersOpen(false); };
  const back = () => {
    const previous = navigationHistory.current.pop();
    if (previous) { setScreen(previous); return; }
    const destinations: Partial<Record<Screen, Screen>> = { studio: 'studios', instructor: studio ? 'studio' : 'discover', session: 'discover', product: 'shop', bag: 'shop', checkout: 'bag', order: 'you', productTag: 'session', membership: 'you', referral: 'you', admin: 'you', staffLogin: session?.profile.onboardingComplete ? 'you' : 'onboarding' };
    setScreen(screen === 'session' ? (tab === 'move' ? 'move' : 'discover') : destinations[screen] ?? tab);
  };
  const openStudio = (id: string) => task(async () => { const next = await api.studio(id); setStudio(next); navigate('studio'); api.event('studio_opened', id); });
  const openInstructor = (id: string) => task(async () => { setInstructor(await api.instructor(id)); navigate('instructor'); });
  const openWorkout = (id: string) => task(async () => { setWorkout(await api.workout(id)); navigate('session'); api.event('workout_opened', id); });
  const openProduct = (id: string) => task(async () => {
    const next = await api.product(id); setProduct(next); setVariantId(next.variants.find(v => v.available)?.id ?? next.variants[0]?.id ?? ''); setQuantity(1); navigate('product'); api.event('product_opened', id);
  });
  const openReferral = (code: string) => task(async () => { setReferral(await api.referral(code)); navigate('referral'); api.event('referral_opened', code); });
  const openWebsite = (url: string, id: string) => task(async () => { await Linking.openURL(url); api.event('booking_link_opened', id); });
  const invalidateCheckout = () => { setDiscountApplied(false); checkoutKey.current = undefined; checkoutBody.current = undefined; setQuote(undefined); };
  const changeCart = (item: CartItem, next: number) => task(async () => {
    setCart(next < 1 ? await api.removeItem(item.productId, item.variantId) : await api.putItem(item.productId, item.variantId, next)); invalidateCheckout();
  });
  const checkoutInput = (): CheckoutInput => {
    const code = discountCode.trim().toUpperCase();
    if (code && code !== 'WELCOME15' && code !== 'SEASON10') { throw new Error('Use WELCOME15 or SEASON10 for a demo discount. Referral codes are applied from Studio connection.'); }
    return { fulfillment, source: 'app', ...(code ? { discountCode: code } : {}) } as CheckoutInput;
  };
  const prepareCheckout = () => task(async () => {
    const input = checkoutInput(); const nextQuote = await api.quote(input); setQuote(nextQuote);
    if (JSON.stringify(checkoutBody.current) !== JSON.stringify(input)) { checkoutKey.current = undefined; }
    checkoutBody.current = input; navigate('checkout');
  });
  const confirmOrder = () => task(async () => {
    if (!checkoutBody.current) { throw new Error('Review your bag before checkout.'); }
    checkoutKey.current ??= `app-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    const confirmed = await api.checkout(checkoutBody.current, checkoutKey.current);
    setOrder(confirmed); setOrders(old => [confirmed, ...old.filter(o => o.id !== confirmed.id)]); setCart(emptyCart); navigationHistory.current = []; setScreen('order');
    checkoutKey.current = undefined; checkoutBody.current = undefined; setQuote(undefined);
  });
  const openMap = (value: Studio) => task(async () => { await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${value.latitude},${value.longitude}`); });
  const addTaggedProduct = (value: Product, selectedId: string) => task(async () => {
    const previous = cart.items.find(item => item.productId === value.id && item.variantId === selectedId)?.quantity ?? 0;
    if (previous >= 99) { throw new Error('A variant can have at most 99 items in the bag.'); }
    const connection = referrals.find(r => r.ownerType === 'instructor' && workout?.instructorIds.includes(r.ownerId));
    if (connection) { await api.applyReferral(connection.code); setSession(old => old ? { ...old, referralCode: connection.code } : old); }
    setCart(await api.putItem(value.id, selectedId, previous + 1)); invalidateCheckout(); navigate('bag');
  });
  const applyDiscount = () => task(async () => { const next = await api.quote(checkoutInput()); setQuote(next); setDiscountApplied(true); setNotice('Demo discount applied'); });
  const primaryStudio = studios[0];
  const primaryWorkout = workouts[0];
  const selectedVariant = product?.variants.find(v => v.id === variantId);
  const noResults = (message: string) => <View style={styles.infoBox}><Text style={styles.bodyCopy}>{message}</Text></View>;
  const workoutCards = (items: Workout[]) => items.length ? items.map(w => <WorkoutCard key={w.id} workout={w} onPress={() => openWorkout(w.id)} />) : noResults('No published sessions match these filters.');
  const productCards = (items: Product[]) => <View style={styles.productGrid}>{items.map(p => <ProductCard key={p.id} title={p.title} price={money(p.variants.length ? Math.min(...p.variants.map(v => v.price)) : null, p.currency)} uri={artwork(p)} onPress={() => openProduct(p.id)} />)}</View>;
  const summary = (value: Quote) => <View style={styles.infoBox}>
    <Text style={styles.sectionTitle}>Order summary</Text>
    {([['Items subtotal', value.subtotal], ['Demo discount', -value.discount], ['Delivery', value.shipping], ['Total', value.total]] as [string, number][]).map(([label, amount]) => <View key={label} style={styles.summaryRow}><Text style={styles.bodyCopy}>{label}</Text><Text style={styles.cardTitle}>{money(amount, value.currency)}</Text></View>)}
    {!!value.attribution && <Text style={styles.meta}>Studio connection: {value.attribution.code}</Text>}
  </View>;

  const renderScreen = () => {
    switch (screen) {
      case 'staffLogin': return <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MOVEACTIVE · INTERNAL PLAYTEST</Text>
        <Heading title="Staff sign in" subtitle="Use the shared staff account to access the prototype." />
        <View style={styles.infoBox}><Text style={styles.cardTitle}>Shared demo credentials</Text><Text style={styles.meta}>Username: staff</Text><Text style={styles.meta}>Password: OrbitStaff123!</Text></View>
        <TextInput accessibilityLabel="Staff username" value={staffUsername} onChangeText={setStaffUsername} autoCapitalize="none" autoCorrect={false} placeholder="Username" style={styles.formInput} />
        <TextInput accessibilityLabel="Staff password" value={staffPassword} onChangeText={setStaffPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} placeholder="Password" style={styles.formInput} />
        <Button label="Sign in as staff" disabled={busy || !staffUsername.trim() || !staffPassword} onPress={() => task(async () => {
          const signedIn = await api.staffLogin(staffUsername.trim(), staffPassword);
          setSession(signedIn); setStaffPassword('');
          if (signedIn.profile.onboardingComplete) { setScreen('discover'); setTab('discover'); }
          else { setScreen('onboarding'); }
        })} />
        <Button secondary label="Continue as guest" disabled={busy} onPress={() => setScreen('onboarding')} />
      </ScrollView>;
      case 'onboarding': return <ScrollView contentContainerStyle={styles.content}>
        <OrbitImage source={artwork({ imageUrl: config?.heroImageUrl })} style={styles.onboardHero} imageStyle={styles.onboardImage}><View style={styles.onboardShade} /><View style={styles.onboardCopy}><Text style={styles.onboardEyebrow}>YOUR PILATES WORLD</Text><Text style={styles.onboardTitle}>Find your next move.</Text><Text style={styles.onboardSub}>Fresh sessions. Studios you’ll love. Made for the way you move.</Text></View></OrbitImage>
        <View style={styles.onboardBody}><Text style={styles.sectionTitle}>Let’s make it yours</Text><Text style={styles.label}>YOUR AREA</Text><View style={styles.locationField}><Text style={styles.locationText}>{area?.area}</Text></View><View style={styles.chipRow}>{(config?.areas ?? []).map(a => <Chip key={a.area} label={a.area} active={area?.area === a.area} onPress={() => setArea(a)} />)}</View><Text style={styles.finePrint}>Choose a sample area for internal playtesting. Device location is not requested.</Text>
          <Text style={[styles.label, styles.interestLabel]}>WHAT DO YOU LOVE?</Text><View style={styles.chipRow}>{(config?.interestOptions ?? []).map(i => <Chip key={i.value} label={i.label} active={interest === i.value} onPress={() => setInterest(i.value)} />)}</View>
          <View style={styles.chipRow}>{(config?.formats ?? []).map(f => <Chip key={f} label={f === 'mat' ? 'Mat Pilates' : 'Reformer'} active={format === f} onPress={() => setFormat(f)} />)}</View>
          <Button label="Build my Pilates world →" disabled={busy || !session || !area || !interest} onPress={() => task(async () => { setSession(await api.profile({ ...area, interests: [interest], formats: [format], onboardingComplete: true })); setScreen('discover'); setTab('discover'); })} />
          <Button secondary label="Internal staff sign in" disabled={busy || !session} onPress={() => setScreen('staffLogin')} />
        </View>
      </ScrollView>;
      case 'discover': return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>GOOD MORNING, MOVER</Text><Heading title="Find your next move." />
        <View style={styles.chipRow}><Chip label="Near me" active={nearMe} onPress={() => setNearMe(!nearMe)} />{(config?.formats ?? []).map(f => <Chip key={f} label={f === 'reformer' ? 'Reformer' : 'Mat'} active={format === f} onPress={() => setFormat(f)} />)}<Chip label="Beginner" active={level === 'beginner'} onPress={() => setLevel(level ? '' : 'beginner')} /><Chip label="Filters ☷" active={filtersOpen} onPress={() => setFiltersOpen(!filtersOpen)} /></View>
        {filtersOpen && <View style={styles.infoBox}><Text style={styles.label}>SESSION LEVEL</Text><View style={styles.chipRow}>{['', 'beginner', 'intermediate', 'advanced'].map(value => <Chip key={value} label={value || 'All levels'} active={level === value} onPress={() => setLevel(value)} />)}</View><Button secondary small label="Browse studio directory" onPress={() => goTab('studios')} /></View>}
        {(search.trim() ? studios : studios.slice(0, 1)).map(value => <StudioCard key={value.id} studio={value} onPress={() => openStudio(value.id)} />)}
        {workoutCards(search.trim() ? workouts : workouts.slice(0, 1))}
        {!!primaryWorkout?.instructors?.[0] && <Pressable accessibilityRole="button" onPress={() => openInstructor(primaryWorkout.instructors![0].id)} style={styles.recommendCard}><Text style={styles.cardTitle}>✓ Recommended by {primaryWorkout.instructors[0].name}</Text><Text style={styles.meta}>{primaryWorkout.studio?.name} · Studio connection</Text></Pressable>}
        <TextInput accessibilityLabel="Search studios, classes, instructors" value={search} onChangeText={setSearch} placeholder="Search studios, classes, instructors" maxLength={100} style={styles.formInput} />
        <SectionTitle title="Your Pilates world" action="Studio directory" onPress={() => goTab('studios')} />
        <Button secondary label="Explore all sessions" onPress={() => goTab('move')} />
        {offers.map(o => <Pressable key={o.id} style={styles.recommendCard} onPress={() => openStudio(o.studio.id)}><View style={styles.flex1}><Text style={styles.cardTitle}>{o.title}</Text><Text style={styles.meta}>{o.studio.name} · {o.distanceKm} km · {o.description}</Text></View></Pressable>)}
      </ScrollView>;
      case 'move': return <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MOVE WITH US</Text><Heading title="Make time to move." subtitle="Find a session for your practice, your pace and your day." />
        <TextInput accessibilityLabel="Search sessions" value={search} onChangeText={setSearch} placeholder="Search sessions or instructors" maxLength={100} style={styles.formInput} />
        <View style={styles.chipRow}>{(config?.formats ?? []).map(f => <Chip key={f} label={f === 'reformer' ? 'Reformer' : 'Mat Pilates'} active={format === f} onPress={() => setFormat(f)} />)}<Chip label="Beginner" active={level === 'beginner'} onPress={() => setLevel(level ? '' : 'beginner')} /></View>
        {workoutCards(workouts)}<Button secondary label="Explore premium membership" onPress={() => navigate('membership')} />
      </ScrollView>;
      case 'membership': return <MembershipScreen onExplore={() => goTab('move')} />;
      case 'productTag': return workout && <ProductTagScreen key={workout.id} workout={workout} busy={busy} event={config?.eventConcept} onProduct={openProduct} onAdd={addTaggedProduct} onKeepExploring={back} onMap={openMap} onStudio={openStudio} />;
      case 'studios': return <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>STUDIO DIRECTORY</Text><Heading title="Find your studio." subtitle="Discover local Pilates spaces and the people who move with them." />
        <TextInput accessibilityLabel="Search studios" value={search} onChangeText={setSearch} placeholder="Search studio name or area" style={styles.formInput} />
        <View style={styles.chipRow}><Chip label={nearMe ? `${session?.profile.area ?? 'Melbourne'} · 10 km` : 'All areas'} active={nearMe} onPress={() => setNearMe(!nearMe)} />{(config?.formats ?? []).map(f => <Chip key={f} label={f} active={format === f} onPress={() => setFormat(f)} />)}</View>
        <Text style={styles.resultCount}>{studios.length} MATCHING STUDIOS</Text>{studios.map(s => <StudioCard key={s.id} studio={s} onPress={() => openStudio(s.id)} />)}{!studios.length && noResults('No studios match your search. Try another format or all areas.')}
      </ScrollView>;
      case 'studio': return studio && <ScrollView contentContainerStyle={styles.content}>
        <Photo uri={artwork(studio)} height={225} radius={0} /><Heading title={studio.name} subtitle={studio.address} /><View style={styles.chipRow}>{studio.formats.map(f => <Chip key={f} label={f} active />)}</View>
        <Text style={styles.bodyCopy}>{studio.description}</Text><Text style={styles.meta}>{studio.partnerType === 'listed' ? 'Studio listing' : 'Studio partner / stockist'}</Text>
        <Button label="Visit studio website ↗" secondary onPress={() => openWebsite(studio.websiteUrl, studio.id)} /><Button label="Open studio booking site ↗" secondary onPress={() => openWebsite(studio.bookingUrl, studio.id)} />
        <SectionTitle title="Meet your instructors" />{studio.instructors?.map(i => <Pressable key={i.id} onPress={() => openInstructor(i.id)} style={styles.personRow}><OrbitImage source={artwork(i)} style={styles.personImage} /><Text style={styles.cardTitle}>{i.name}</Text><Text style={styles.chevron}>›</Text></Pressable>)}{!studio.instructors?.length && <Text style={styles.meta}>No published instructors yet.</Text>}
        <SectionTitle title="Selected for you" />{workoutCards(studio.workouts ?? [])}
        {studio.referrals?.map(r => <Button key={r.code} secondary label={`Studio connection · ${r.code}`} onPress={() => openReferral(r.code)} />)}
      </ScrollView>;
      case 'instructor': return instructor && <ScrollView contentContainerStyle={styles.content}>
        <OrbitImage source={artwork(instructor)} style={styles.instructorHero} /><Text style={styles.eyebrow}>{instructor.independent ? 'MOVEACTIVE APPROVED' : 'STUDIO-AFFILIATED INSTRUCTOR'}</Text><Heading title={instructor.name} subtitle={instructor.bio} />
        {instructor.studios?.map(s => <StudioCard key={s.id} studio={s} onPress={() => openStudio(s.id)} />)}
        {instructor.referrals?.map(r => <Pressable key={r.code} onPress={() => openReferral(r.code)} style={styles.referralCard}><Text style={styles.cardTitle}>MoveActive recommendation code</Text><Text style={styles.code}>{r.code}</Text><Text style={styles.meta}>Demo attribution · no commissions</Text></Pressable>)}
        <SectionTitle title={`Sessions with ${instructor.name}`} />{workoutCards(instructor.workouts ?? [])}
      </ScrollView>;
      case 'session': return workout && <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => setNotice('Video preview is simulated in this prototype.')}><OrbitImage source={artwork(workout)} style={styles.sessionHero} imageStyle={styles.sessionHeroImage}><View style={styles.bigPlay}><Text style={styles.playIcon}>▶</Text></View></OrbitImage></Pressable>
        <Text style={styles.eyebrow}>{workout.level.toUpperCase()} · {workout.durationMinutes} MIN · {workout.format.toUpperCase()}</Text><Heading title={workout.title} subtitle={workout.description} />
        {workout.instructors?.map(i => <Pressable key={i.id} onPress={() => openInstructor(i.id)} style={styles.personRow}><OrbitImage source={artwork(i)} style={styles.personImageSmall} /><Text style={styles.cardTitle}>{i.name}</Text></Pressable>)}
        {!!workout.studio && <Button secondary label={workout.studio.name} onPress={() => openStudio(workout.studioId)} />}
        <Button label="Start session ▶" onPress={() => setNotice('Session playback is simulated.')} />
        {!!workout.products?.[0] && <Pressable accessibilityRole="button" accessibilityLabel="Shop this studio edit" onPress={() => navigate('productTag')} style={styles.editCard}><Text style={styles.label}>MOVEACTIVE EDIT</Text><View style={styles.tagProduct}><OrbitImage source={artwork(workout.products[0])} style={styles.tagImage} /><View style={styles.flex1}><Text style={styles.cardTitle}>Shop this studio edit</Text><Text style={styles.meta}>{workout.products[0].title}</Text></View><Text style={styles.chevron}>›</Text></View></Pressable>}
        <SectionTitle title="More ways to move" />{workoutCards(workouts.filter(value => value.id !== workout.id))}
      </ScrollView>;
      case 'shop': return <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MOVEACTIVE STORE · D2C</Text><Heading title="Made for every move." subtitle="Studio favourites and thoughtful essentials for your practice." />
        <TextInput accessibilityLabel="Search products" value={search} onChangeText={setSearch} placeholder="Search grip socks, mats and equipment" style={styles.formInput} />
        <View style={styles.chipRow}><Chip label="All" active={!collection} onPress={() => setCollection('')} />{collections.map(c => <Chip key={c} label={c.replace(/-/g, ' ')} active={collection === c} onPress={() => setCollection(c)} />)}</View>
        <View style={styles.collectionHero}><Photo uri={artwork({ imageUrl: config?.shopHeroImageUrl })} height={150} /><View style={styles.collectionCopy}><Text style={styles.sectionTitle}>The studio edit</Text><Text style={styles.meta}>Your next studio favourites</Text></View></View>
        <SectionTitle title="The studio edit" action={`View bag (${bagCount})`} onPress={() => navigate('bag')} />{productCards(products)}{!products.length && noResults('No products match your search or collection.')}
        <Text style={styles.finePrint}>Sample catalog and availability · no live inventory.</Text>
      </ScrollView>;
      case 'product': return product && <ScrollView contentContainerStyle={styles.content}>
        <ProductGallery key={product.id} product={product} /><Text style={styles.eyebrow}>{product.collection.toUpperCase()}</Text><Heading title={product.title} subtitle={product.description} />
        <Text style={styles.label}>CHOOSE YOUR VARIANT</Text><View style={styles.chipRow}>{product.variants.map(v => <Chip key={v.id} label={`${v.title}${v.available ? '' : ' · Unavailable'}`} active={variantId === v.id} onPress={() => setVariantId(v.id)} />)}</View>
        <Text style={styles.cardTitle}>{money(selectedVariant?.price, product.currency)}</Text>
        <View style={styles.quantityRow}><Text style={styles.cardTitle}>Quantity</Text><View style={styles.stepper}><Pressable onPress={() => setQuantity(n => Math.max(1, n - 1))}><Text style={styles.stepperText}>−</Text></Pressable><Text style={styles.qty}>{quantity}</Text><Pressable onPress={() => setQuantity(n => Math.min(99, n + 1))}><Text style={styles.stepperText}>＋</Text></Pressable></View></View>
        <Button label={`Add to bag · ${money(selectedVariant ? selectedVariant.price * quantity : null, product.currency)}`} disabled={busy || !selectedVariant?.available} onPress={() => task(async () => {
          const previous = cart.items.find(i => i.productId === product.id && i.variantId === variantId)?.quantity ?? 0;
          if (previous + quantity > 99) { throw new Error('A variant can have at most 99 items in the bag.'); }
          setCart(await api.putItem(product.id, variantId, previous + quantity)); invalidateCheckout(); setNotice('Added to your bag');
        })} /><Button secondary label={`View bag (${bagCount})`} onPress={() => navigate('bag')} />
        {!!product.bundleProducts?.length && <><SectionTitle title="Included in this bundle" />{productCards(product.bundleProducts)}</>}
        {products.filter(p => p.bundleProductIds.includes(product.id)).map(p => <Button key={p.id} secondary label={`Explore ${p.title}`} onPress={() => openProduct(p.id)} />)}
      </ScrollView>;
      case 'bag': return <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>YOUR STUDIO ESSENTIALS</Text><Heading title="Your bag" subtitle="A little something for your next session." />
        {cart.items.map(item => <View key={`${item.productId}/${item.variantId}`} style={styles.cartItem}><OrbitImage source={artwork({ id: item.productId, imageUrl: item.imageUrl })} style={styles.cartPhoto} /><View style={styles.flex1}><Text style={styles.cardTitle}>{item.productTitle}</Text><Text style={styles.meta}>{item.variantTitle}{item.available ? '' : ' · Unavailable'}</Text><View style={styles.stepper}><Pressable disabled={busy} onPress={() => changeCart(item, item.quantity - 1)}><Text style={styles.stepperText}>−</Text></Pressable><Text style={styles.qty}>{item.quantity}</Text><Pressable disabled={busy || item.quantity === 99 || !item.available} onPress={() => changeCart(item, item.quantity + 1)}><Text style={styles.stepperText}>＋</Text></Pressable></View><Pressable disabled={busy} onPress={() => changeCart(item, 0)}><Text style={styles.inlineLink}>Remove</Text></Pressable></View><Text style={styles.meta}>{money(item.lineTotal, item.currency ?? 'AUD')}</Text></View>)}
        {!cart.items.length && noResults('Your bag is taking a breather. Explore studio essentials picked for your practice.')}
        <View style={styles.codeBox}><Text style={styles.cardTitle}>Have a demo discount?</Text><TextInput accessibilityLabel="Discount code" value={discountCode} onChangeText={value => { setDiscountCode(value); invalidateCheckout(); }} autoCapitalize="characters" placeholder="WELCOME15 or SEASON10" style={styles.codeInput} /><Button small secondary label="Apply code" disabled={busy || !cart.checkoutReady || !discountCode.trim()} onPress={applyDiscount} /><Text style={styles.finePrint}>Referral codes are applied from Studio connection. They do not provide a discount.</Text></View>
        <Text style={styles.label}>FULFILLMENT</Text><View style={styles.chipRow}>{(['delivery', 'warehouse-collect'] as const).map(f => <Chip key={f} label={f === 'delivery' ? 'Delivery' : 'Warehouse collection'} active={fulfillment === f} onPress={() => { setFulfillment(f); invalidateCheckout(); }} />)}</View>
        {discountApplied && quote ? summary(quote) : <View style={styles.infoBox}><Text style={styles.sectionTitle}>Order summary</Text><View style={styles.summaryRow}><Text style={styles.bodyCopy}>Items subtotal</Text><Text style={styles.cardTitle}>{money(cart.subtotal, cart.currency ?? 'AUD')}</Text></View><View style={styles.summaryRow}><Text style={styles.bodyCopy}>Delivery & tax</Text><Text style={styles.meta}>At checkout</Text></View></View>}
        <Button label="Review demo checkout" disabled={busy || !cart.checkoutReady} onPress={prepareCheckout} /><Text style={styles.disclaimer}>Demo only · No payment is taken</Text><Button secondary label="Continue shopping" onPress={() => goTab('shop')} />
      </ScrollView>;
      case 'checkout': return quote && <ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>PROTOTYPE · NO PAYMENT</Text><Heading title="One step closer." />{fulfillment === 'delivery' && <DeliveryPreview />}{summary(quote)}<Text style={styles.bodyCopy}>{quote.notice}</Text><Text style={styles.meta}>{fulfillment === 'warehouse-collect' ? 'Collection is warehouse-based. No studio pickup.' : 'The production app would hand off to approved Shopify checkout. Shipping, billing and payments remain to be confirmed.'}</Text><Button label="Confirm demo order" disabled={busy} onPress={confirmOrder} /></ScrollView>;
      case 'order': return order && <ScrollView contentContainerStyle={styles.content}><View style={styles.confirmationHero}><View style={styles.orderCheck}><Text style={styles.orderCheckText}>✓</Text></View><Heading title="Thanks for moving with us." subtitle={`Demo order ${order.id} · No purchase was placed`} /></View><Text style={styles.bodyCopy}>Demo confirmed · No charge or fulfillment.</Text>{summary(order)}{!!order.attribution && <View style={styles.recommendCard}><Text style={styles.cardTitle}>✓ Your studio connection</Text><Text style={styles.meta}>{referrals.find(r => r.code === order.attribution?.code)?.owner.name ?? order.attribution.code} · Attribution concept</Text></View>}{order.items.map(item => <View key={`${item.productId}/${item.variantId}`} style={styles.simpleRow}><Text style={styles.cardTitle}>{item.productTitle} × {item.quantity}</Text><Text style={styles.meta}>{money(item.lineTotal, order.currency)}</Text></View>)}<Button label="Back to my Pilates world" onPress={() => goTab('discover')} /><Button secondary label="Keep shopping" onPress={() => goTab('shop')} /></ScrollView>;
      case 'you': return <ScrollView contentContainerStyle={styles.content}>
        <Heading title="Your Pilates world." subtitle="Your practice, your pace." /><View style={styles.profileCard}><View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>M</Text></View><View style={styles.flex1}><Text style={styles.cardTitle}>{session?.accountType === 'staff' ? 'Internal staff account' : 'Your demo profile'}</Text><Text style={styles.meta}>{session?.profile.area} · {session?.profile.formats?.join(', ')} · {session?.profile.interests?.join(', ')}</Text></View></View>
        <SectionTitle title="Internal staff access" />
        {session?.accountType === 'staff'
          ? <Button secondary label="Sign out of staff account" disabled={busy} onPress={() => task(async () => { setSession(await api.staffLogout()); setNotice('Signed out of the staff account.'); })} />
          : <Button secondary label="Staff sign in" disabled={busy} onPress={() => setScreen('staffLogin')} />}
        <Button secondary label="Explore premium membership" onPress={() => navigate('membership')} />
        <Button secondary label="Update my interests" onPress={() => setScreen('onboarding')} />
        {!!primaryWorkout && <Button secondary label="Explore sessions" onPress={() => openWorkout(primaryWorkout.id)} />}
        {!!primaryStudio && <Button secondary label="Your local studio" onPress={() => openStudio(primaryStudio.id)} />}
        <SectionTitle title="Studio connections" />{referrals.map(r => <Button key={r.code} secondary label={`${r.owner.name} · ${r.code}`} onPress={() => openReferral(r.code)} />)}{!referrals.length && <Text style={styles.meta}>No studio connections available.</Text>}
        <SectionTitle title="Your demo orders" />{orders.map(o => <Pressable key={o.id} style={styles.simpleRow} onPress={() => { setOrder(o); setScreen('order'); }}><Text style={styles.cardTitle}>{o.id}</Text><Text style={styles.meta}>{money(o.total, o.currency)} · {o.status}</Text></Pressable>)}{!orders.length && <Text style={styles.meta}>No demo orders yet.</Text>}
        <SectionTitle title="Prototype tools" /><Button secondary label="MoveActive admin" onPress={() => setScreen('admin')} />
      </ScrollView>;
      case 'referral': return referral && <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>STUDIO CONNECTION</Text><Heading title="Good moves travel." subtitle="Studio and instructor recommendations for your practice." />
        <View style={styles.referralHero}><Text style={styles.referralStars}>✦</Text><Text style={styles.referralStudio}>{referral.owner.name.toUpperCase()}</Text><Text style={styles.referralCode}>{referral.code}</Text></View>
        <View style={styles.infoBox}><Text style={styles.sectionTitle}>Your recommendation</Text><Text style={styles.bodyCopy}>Shared by {referral.owner.name}.</Text><Text style={styles.meta}>Link: {referral.deepLink}</Text><Text style={styles.meta}>Referral code: {referral.code}</Text></View>
        <Text style={styles.finePrint}>Demo attribution only. No commissions or payouts.</Text><Button label="Apply studio connection" disabled={busy} onPress={() => task(async () => { await api.applyReferral(referral.code); setSession(old => old ? { ...old, referralCode: referral.code } : old); invalidateCheckout(); setNotice('Studio connection applied to your next demo order.'); })} />
        <Button secondary label={`View ${referral.owner.name}`} onPress={() => referral.ownerType === 'studio' ? openStudio(referral.ownerId) : openInstructor(referral.ownerId)} />
      </ScrollView>;
      case 'admin': return <AdminPanel task={task} busy={busy} onChanged={reload} />;
      default: return null;
    }
  };
  return <SafeAreaProvider><SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
    <StatusBar barStyle="dark-content" />{screen !== 'onboarding' && <TopBar screen={screen} onBack={back} onYou={() => goTab('you')} />}
    {busy && <View accessibilityRole="progressbar" style={styles.chipRow}><ActivityIndicator /><Text style={styles.meta}>Connecting to your Pilates world…</Text></View>}
    {!!error && <View accessibilityRole="alert" style={styles.noteCard}><Text style={styles.noteTitle}>{error}</Text><Button small secondary label={session ? 'Refresh' : 'Retry connection'} onPress={() => { if (!session || error.includes('expired')) { bootstrap(); } else { task(reload); } }} /></View>}
    <View key={screen} style={styles.screen}>{renderScreen()}</View>
    {['discover', 'move', 'studios', 'shop', 'you'].includes(screen) && <BottomNav screen={tab === 'studios' ? 'discover' : tab} bagCount={bagCount} onSelect={goTab} />}
    {!!notice && <Pressable style={styles.toast} onPress={() => setNotice('')}><Text style={styles.toastText}>{notice} ×</Text></Pressable>}
  </SafeAreaView></SafeAreaProvider>;
}
export default App;
