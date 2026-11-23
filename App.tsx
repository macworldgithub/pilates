import React, { useState } from 'react';
import { photos, products, studios } from './src/data/mockData';
import { Screen } from './src/types';
import { BottomNav, Button, Chip, Heading, Photo, ProductCard, SectionTitle, StudioCard, styles, TopBar, WorkoutCard } from './src/components/OrbitUI';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [tab, setTab] = useState<Screen>('discover');
  const [format, setFormat] = useState('Reformer');
  const [nearMe, setNearMe] = useState(true);
  const [interest, setInterest] = useState('Strength');
  const [bagCount, setBagCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [adminEntity, setAdminEntity] = useState<'studios' | 'instructors' | 'affiliations'>('studios');
  const [adminDraft, setAdminDraft] = useState(false);

  const goTab = (next: Screen) => {
    setTab(next);
    setScreen(next);
    setNotice('');
  };
  const back = () => {
    const backMap: Partial<Record<Screen, Screen>> = {
      studio: 'studios',
      instructor: 'studio',
      session: 'discover',
      product: 'shop',
      bag: 'shop',
      checkout: 'bag',
      order: 'discover',
      referral: 'you',
      admin: 'you',
    };
    setScreen(backMap[screen] || tab);
  };
  const addToBag = () => {
    setBagCount(count => count + quantity);
    setNotice('Added to your bag');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <ScrollView contentContainerStyle={styles.content}>
          <ImageBackground source={photos.hero} style={styles.onboardHero} imageStyle={styles.onboardImage}>
            <View style={styles.onboardShade} />
            <View style={styles.onboardCopy}><Text style={styles.onboardEyebrow}>YOUR PILATES WORLD</Text><Text style={styles.onboardTitle}>Find your next move.</Text><Text style={styles.onboardSub}>Fresh sessions. Studios you’ll love. Made for the way you move.</Text></View>
          </ImageBackground>
          <View style={styles.onboardBody}>
            <Text style={styles.sectionTitle}>Let’s make it yours</Text>
            <Text style={styles.label}>YOUR AREA</Text>
            <Pressable style={styles.locationField} onPress={() => setNearMe(!nearMe)}><Text style={styles.locationPin}>⌖</Text><Text style={styles.locationText}>{nearMe ? 'Use my current area' : 'Melbourne, VIC'}</Text><Text style={styles.locationChange}>Change</Text></Pressable>
            <Text style={[styles.label, styles.interestLabel]}>WHAT DO YOU LOVE?</Text>
            <View style={styles.chipRow}>{['Strength', 'Mobility', 'Mindfulness'].map(item => <Chip key={item} label={item} active={interest === item} onPress={() => setInterest(item)} />)}</View>
            <View style={[styles.chipRow, styles.interestFormats]}>{['Reformer', 'Mat Pilates'].map(item => <Chip key={item} label={item} active={format === item} onPress={() => setFormat(item)} />)}</View>
            <Button label="Build my Pilates world  →" onPress={() => { setTab('discover'); setScreen('discover'); }} />
            <Text style={styles.finePrint}>You can change your interests and location any time.</Text>
          </View>
        </ScrollView>;
      case 'discover':
        return <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>GOOD MORNING, AMELIA</Text>
          <Heading title="Find your next move." />
          <View style={styles.chipRow}><Chip label={nearMe ? 'Near me' : 'Melbourne'} active onPress={() => setNearMe(!nearMe)} /><Chip label="Reformer" active={format === 'Reformer'} onPress={() => setFormat('Reformer')} /><Chip label="Mat" active={format === 'Mat Pilates'} onPress={() => setFormat('Mat Pilates')} /><Chip label="Beginner" /><Chip label="☷" onPress={() => setNotice('Filters: format and distance are ready to explore.')} /></View>
          <StudioCard onPress={() => setScreen('studio')} />
          <SectionTitle title="Picked for you" action="See all" onPress={() => setScreen('session')} />
          <WorkoutCard onPress={() => setScreen('session')} />
          <Pressable onPress={() => setScreen('instructor')} style={styles.recommendCard}>
            <View style={styles.recommendIcon}><Text style={styles.recommendIconText}>✦</Text></View>
            <View style={styles.flex1}><Text style={styles.cardTitle}>Recommended by Mia Chen</Text><Text style={styles.meta}>Core Collective · Code MIA10 · Demo attribution</Text></View><Text style={styles.chevron}>›</Text>
          </Pressable>
          <SectionTitle title="Move with your local studios" action="Directory" onPress={() => goTab('studios')} />
          <Photo uri={photos.session} height={150} />
          <View style={styles.spacer10} />
          <Text style={styles.meta}>Discover new sessions from studio partners near you.</Text>
        </ScrollView>;
      case 'studios':
        return <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>STUDIO DIRECTORY</Text><Heading title="Find your studio." subtitle="Discover verified local Pilates spaces and the people who move with them." />
          <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Search studios, areas or instructors" placeholderTextColor="#9a9692" style={styles.searchInput} /></View>
          <View style={styles.chipRow}><Chip label={nearMe ? 'Near me · 10 km' : 'All areas'} active onPress={() => setNearMe(!nearMe)} /><Chip label="Reformer" active={format === 'Reformer'} onPress={() => setFormat('Reformer')} /><Chip label="Mat" active={format === 'Mat Pilates'} onPress={() => setFormat('Mat Pilates')} /></View>
          <Text style={styles.resultCount}>3 STUDIOS NEAR MELBOURNE</Text>
          <StudioCard onPress={() => setScreen('studio')} />
          {studios.slice(1).map((studio, index) => <Pressable key={studio.id} onPress={() => setScreen('studio')} style={styles.directoryRow}><Image source={index === 0 ? photos.studioSouthYarra : photos.studioRichmond} style={styles.studioThumb} /><View style={styles.flex1}><Text style={styles.cardTitle}>{studio.name}</Text><Text style={styles.meta}>{studio.area} · {studio.distance} · {studio.formats.join(' + ')}</Text><Text style={styles.inlineLink}>Open profile  ›</Text></View></Pressable>)}
          <View style={styles.mapCard}><Text style={styles.mapPin}>⌖</Text><Text style={styles.mapTitle}>Studios around you</Text><Text style={styles.meta}>A simple area preview · live maps are not connected</Text></View>
        </ScrollView>;
      case 'studio':
        return <ScrollView contentContainerStyle={styles.content}>
          <Photo uri={photos.studio} height={225} radius={0} />
          <View style={styles.profileTitle}><View style={styles.titleInline}><Text style={styles.headingSmall}>Core Collective</Text><Text style={styles.verified}> ✓ VERIFIED PARTNER</Text></View><Text style={styles.meta}>PRAHRAN · 1.2 KM AWAY</Text><View style={styles.chipRow}><Chip label="Reformer" active /><Chip label="Mat Pilates" /></View></View>
          <Text style={styles.bodyCopy}>A welcoming neighbourhood studio built around strong foundations, expert coaching and joyful movement.</Text>
          <View style={styles.infoBox}><Text style={styles.eyebrow}>VISIT THE STUDIO</Text><Text style={styles.bodyCopy}>12 Greville Street, Prahran VIC</Text><Text style={styles.inlineLink}>Open website  ↗</Text></View>
          <SectionTitle title="Meet your instructors" action="View all" onPress={() => setScreen('instructor')} />
          <Pressable onPress={() => setScreen('instructor')} style={styles.personRow}><Image source={photos.instructor} style={styles.personImage} /><View style={styles.flex1}><Text style={styles.cardTitle}>Mia Chen</Text><Text style={styles.meta}>Reformer · Studio-affiliated instructor</Text></View><Text style={styles.chevron}>›</Text></Pressable>
          <SectionTitle title="Selected for you" action="See sessions" onPress={() => setScreen('session')} /><WorkoutCard onPress={() => setScreen('session')} />
          <Button label="Visit Core Collective website  ↗" secondary onPress={() => setNotice('Demo link · external studio site')} />
        </ScrollView>;
      case 'instructor':
        return <ScrollView contentContainerStyle={styles.content}>
          <Image source={photos.instructor} style={styles.instructorHero} />
          <Text style={styles.eyebrow}>STUDIO-AFFILIATED INSTRUCTOR</Text><Heading title="Mia Chen" subtitle="Reformer specialist focused on strength, rehabilitation and joyful movement." />
          <Pressable onPress={() => setScreen('studio')} style={styles.affiliation}><View style={styles.affiliationMark}><Text style={styles.affiliationMarkText}>CC</Text></View><View style={styles.flex1}><Text style={styles.cardTitle}>Core Collective</Text><Text style={styles.meta}>Primary studio · Prahran</Text></View><Text style={styles.inlineLink}>Open profile  ›</Text></Pressable>
          <View style={styles.referralCard}><Text style={styles.eyebrow}>MIA’S STUDIO EDIT</Text><Text style={styles.cardTitle}>MoveActive recommendation code</Text><View style={styles.codeRow}><Text style={styles.code}>MIA10</Text><Text style={styles.meta}>Demo attribution · no commission calculation</Text></View></View>
          <SectionTitle title="Sessions curated by Mia" action="View all" onPress={() => setScreen('session')} /><WorkoutCard onPress={() => setScreen('session')} />
          <Pressable onPress={() => setScreen('session')} style={styles.simpleRow}><Text style={styles.cardTitle}>Full Body Mat Flow</Text><Text style={styles.meta}>20 min · All levels  ›</Text></Pressable>
          <Button label="View Mia’s studio edit  →" onPress={() => setScreen('referral')} />
        </ScrollView>;
      case 'session':
        return <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => setNotice('Preview session · video playback is simulated')}>
            <ImageBackground source={photos.session} style={styles.sessionHero} imageStyle={styles.sessionHeroImage}><View style={styles.bigPlay}><Text style={styles.playIcon}>▶</Text></View><View style={styles.duration}><Text style={styles.durationText}>◷ 15 min</Text></View></ImageBackground>
          </Pressable>
          <Text style={styles.eyebrow}>BEGINNER · 15 MIN</Text><Heading title="Reformer Reset" subtitle="A calm full-body sequence for the days you need to reset, reconnect and move well." />
          <Pressable onPress={() => setScreen('instructor')} style={styles.personRow}><Image source={photos.instructor} style={styles.personImageSmall} /><View style={styles.flex1}><Text style={styles.cardTitle}>Mia Chen</Text><Text style={styles.meta}>Core Collective · Verified</Text></View><Text style={styles.chevron}>›</Text></Pressable>
          <Button label="Start session  ▶" onPress={() => setNotice('Session preview · video playback is simulated')} />
          <View style={styles.editCard}><Text style={styles.eyebrow}>MOVEACTIVE EDIT</Text><Text style={styles.sectionTitle}>Shop Mia’s studio edit</Text><Text style={styles.meta}>2 MoveActive essentials tagged</Text><Pressable onPress={() => setScreen('product')} style={styles.tagProduct}><Image source={photos.socks} style={styles.tagImage} /><View style={styles.flex1}><Text style={styles.cardTitle}>Classic Grip Sock</Text><Text style={styles.meta}>$22.95 · Peony / Ivory</Text></View><Text style={styles.chevron}>›</Text></Pressable><Pressable onPress={() => setScreen('product')} style={styles.textLink}><Text style={styles.inlineLink}>View studio edit  →</Text></Pressable></View>
          <Pressable onPress={() => setScreen('referral')} style={styles.attribution}><Text style={styles.recommendIconText}>✦</Text><Text style={styles.meta}>Recommended by Mia Chen · Core Collective · Code MIA10</Text></Pressable>
        </ScrollView>;
      case 'shop':
        return <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>MOVEACTIVE STORE · D2C</Text><Heading title="Made for every move." subtitle="Studio favourites and thoughtful essentials for your practice." />
          <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Search grip socks, mats and equipment" placeholderTextColor="#9a9692" style={styles.searchInput} /></View>
          <View style={styles.chipRow}><Chip label="Grip socks" active /><Chip label="Mats" /><Chip label="Equipment" /></View>
          <Pressable onPress={() => setScreen('product')} style={styles.collectionHero}><Photo uri={photos.mat} height={150} /><View style={styles.collectionCopy}><Text style={styles.eyebrow}>MOVEACTIVE COLLECTION</Text><Text style={styles.sectionTitle}>The studio edit</Text><Text style={styles.meta}>Your next studio favourites · Explore the edit →</Text></View></Pressable>
          <SectionTitle title="The studio edit" action="View bag" onPress={() => setScreen('bag')} />
          <View style={styles.productGrid}>{products.map(product => <ProductCard key={product.id} title={product.name} price={product.price} uri={product.image} onPress={() => setScreen('product')} />)}</View>
          <Text style={styles.finePrint}>Prototype catalogue · product and stock details are sample data.</Text>
        </ScrollView>;
      case 'product':
        return <ScrollView contentContainerStyle={styles.content}>
          <Photo uri={photos.socks} height={300} />
          <Text style={styles.eyebrow}>GRIP SOCKS · CREW</Text><Heading title="Sweetie Candy Pink" subtitle="Crew grip socks designed to support your Pilates practice. Example product · price snapshot $22.95 AUD." />
          <Text style={styles.label}>CHOOSE YOUR SIZE</Text><View style={styles.chipRow}>{['S', 'M', 'L'].map(s => <Chip key={s} label={s} active={s === 'M'} />)}</View>
          <Text style={styles.meta}>Candy Pink · Availability to confirm</Text>
          <View style={styles.quantityRow}><Text style={styles.cardTitle}>Quantity</Text><View style={styles.stepper}><Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={styles.stepperText}>−</Text></Pressable><Text style={styles.qty}>{quantity}</Text><Pressable onPress={() => setQuantity(quantity + 1)}><Text style={styles.stepperText}>＋</Text></Pressable></View></View>
          <Button label="Add to bag · $22.95" onPress={addToBag} />
          <View style={styles.bundleCard}><Text style={styles.eyebrow}>BUILD YOUR STUDIO KIT</Text><Text style={styles.cardTitle}>Pilates Starter Bundle</Text><Text style={styles.meta}>Pair your grip socks with a studio mat · bundle concept</Text><Pressable onPress={() => setNotice('Bundle preview · sample products only')}><Text style={styles.inlineLink}>Explore bundle  →</Text></Pressable></View>
          <Pressable onPress={() => setScreen('referral')} style={styles.attribution}><Text style={styles.recommendIconText}>✦</Text><Text style={styles.meta}>Recommended by Mia Chen · Core Collective · Demo attribution</Text></Pressable>
        </ScrollView>;
      case 'bag':
        return <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>YOUR STUDIO ESSENTIALS</Text><Heading title="Your bag" subtitle="A little something for your next session." />
          {bagCount > 0 ? <View style={styles.cartItem}><Image source={photos.socks} style={styles.cartPhoto} /><View style={styles.flex1}><Text style={styles.cardTitle}>Crew Grip Socks · Sweetie Candy Pink</Text><Text style={styles.meta}>Size M · Candy Pink</Text><View style={styles.stepper}><Pressable onPress={() => setBagCount(Math.max(0, bagCount - 1))}><Text style={styles.stepperText}>−</Text></Pressable><Text style={styles.qty}>{bagCount}</Text><Pressable onPress={() => setBagCount(bagCount + 1)}><Text style={styles.stepperText}>＋</Text></Pressable></View></View><Text style={styles.cardTitle}>${(22.95 * bagCount).toFixed(2)}</Text></View> : <View style={styles.emptyBag}><Text style={styles.emptyIcon}>◇</Text><Text style={styles.cardTitle}>Your bag is taking a breather</Text><Text style={styles.meta}>Explore studio essentials picked for your practice.</Text><Button label="Explore the shop" onPress={() => goTab('shop')} /></View>}
          <View style={styles.codeBox}><Text style={styles.cardTitle}>Have a code?</Text><TextInput placeholder="Prototype discount code" placeholderTextColor="#9a9692" style={styles.codeInput} onChangeText={() => setNotice('Prototype code · not a live discount')} /><Text style={styles.finePrint}>Prototype code · Not a live discount</Text></View>
          <SectionTitle title="Order summary" />
          <View style={styles.summaryRow}><Text style={styles.meta}>Items subtotal</Text><Text style={styles.bodyCopy}>${(22.95 * bagCount).toFixed(2)}</Text></View><View style={styles.summaryRow}><Text style={styles.meta}>Delivery & tax</Text><Text style={styles.meta}>At checkout</Text></View><View style={styles.divider} /><View style={styles.summaryRow}><Text style={styles.cardTitle}>Subtotal</Text><Text style={styles.cardTitle}>${(22.95 * bagCount).toFixed(2)} AUD</Text></View>
          <Text style={styles.finePrint}>Shipping and tax calculated by Shopify in production.</Text>
          <Button label="Continue to secure checkout" onPress={() => setScreen(bagCount > 0 ? 'checkout' : 'shop')} /><Text style={styles.disclaimer}>Demo checkout · No payment is taken</Text>
          <Button label="Continue shopping" secondary onPress={() => goTab('shop')} />
        </ScrollView>;
      case 'checkout':
        return <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>PROTOTYPE · NO PAYMENT</Text><Heading title="One step closer." subtitle="Checkout is only a concept in this prototype." />
          <View style={styles.infoBox}><Text style={styles.sectionTitle}>Delivery details</Text>{['Email', 'Name', 'Address', 'Suburb', 'Postcode'].map(label => <TextInput key={label} placeholder={`Demo ${label.toLowerCase()}`} placeholderTextColor="#9a9692" style={styles.formInput} />)}<Text style={styles.finePrint}>Example form · No data is submitted</Text></View>
          <View style={styles.infoBox}><Text style={styles.sectionTitle}>Review your order</Text><View style={styles.summaryRow}><Text style={styles.meta}>Items subtotal</Text><Text style={styles.bodyCopy}>${(22.95 * bagCount).toFixed(2)}</Text></View><Text style={styles.finePrint}>Live shipping and tax to come from Shopify.</Text></View>
          <Text style={styles.bodyCopy}>The production app would hand off to approved Shopify checkout. Billing, shipping and payment integration remain to be confirmed.</Text>
          <Button label="Show demo confirmation" onPress={() => setScreen('order')} />
        </ScrollView>;
      case 'order':
        return <ScrollView contentContainerStyle={styles.content}><View style={styles.orderCheck}><Text style={styles.orderCheckText}>✓</Text></View><Heading title="Thanks for moving with us." subtitle="Demo order #MA-1042 · No purchase was placed" /><Text style={styles.bodyCopy}>Show order details, delivery updates and the studio or instructor who inspired this purchase.</Text><View style={styles.attribution}><Text style={styles.recommendIconText}>✦</Text><Text style={styles.meta}>Your studio connection · Mia Chen · Core Collective · Attribution concept</Text></View><Button label="Back to my Pilates world" onPress={() => goTab('discover')} /><Button label="Keep shopping" secondary onPress={() => goTab('shop')} /></ScrollView>;
      case 'you':
        return <ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>YOUR PILATES WORLD</Text><Heading title="Hi, Amelia." subtitle="Your practice, your pace." /><View style={styles.profileCard}><View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>A</Text></View><View style={styles.flex1}><Text style={styles.cardTitle}>Amelia Parker</Text><Text style={styles.meta}>Melbourne, VIC · Reformer · Strength</Text></View><Text style={styles.chevron}>›</Text></View><SectionTitle title="Your saved practice" /><View style={styles.menuCard}><Pressable onPress={() => setScreen('session')} style={styles.menuRow}><Text style={styles.menuIcon}>♡</Text><Text style={styles.flex1}>Saved sessions</Text><Text style={styles.chevron}>›</Text></Pressable><Pressable onPress={() => setScreen('studio')} style={styles.menuRow}><Text style={styles.menuIcon}>⌂</Text><Text style={styles.flex1}>Studios you follow</Text><Text style={styles.chevron}>›</Text></Pressable><Pressable onPress={() => setScreen('referral')} style={styles.menuRow}><Text style={styles.menuIcon}>✦</Text><Text style={styles.flex1}>Your studio connection</Text><Text style={styles.chevron}>›</Text></Pressable></View><SectionTitle title="Prototype tools" /><Button label="MoveActive admin preview" secondary onPress={() => setScreen('admin')} /><Text style={styles.finePrint}>Admin is a sample internal view. It is not connected to a backend.</Text></ScrollView>;
      case 'referral':
        return <ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>STUDIO CONNECTION</Text><Heading title="Good moves travel." subtitle="A simple look at how studio recommendations could be represented in the app." /><View style={styles.referralHero}><Text style={styles.referralStars}>✦</Text><Text style={styles.referralStudio}>CORE COLLECTIVE</Text><Text style={styles.referralCode}>MIA10</Text><Text style={styles.referralDesc}>Mia’s studio edit · unique demo link and code</Text></View><View style={styles.infoBox}><Text style={styles.sectionTitle}>Your recommendation</Text><Text style={styles.bodyCopy}>Shared by Mia Chen at Core Collective. This sample attribution shows which studio or instructor inspired a product discovery.</Text><View style={styles.divider} /><Text style={styles.meta}>Link: moveactive.app/r/mia-chen</Text><Text style={styles.meta}>Referral code: MIA10</Text></View><View style={styles.noteCard}><Text style={styles.noteTitle}>Demo attribution only</Text><Text style={styles.meta}>No live link tracking, commission calculation, or payouts are connected.</Text></View><Button label="Explore Mia’s session" onPress={() => setScreen('session')} /></ScrollView>;
      case 'admin':
        return <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>MOVEACTIVE · INTERNAL PREVIEW</Text>
          <Heading title="Partner admin" subtitle="A lightweight view of how MoveActive could manage studio and instructor records." />
          <View style={styles.adminTabs}>
            <Chip label="Studios · 12" active={adminEntity === 'studios'} onPress={() => { setAdminEntity('studios'); setAdminDraft(false); }} />
            <Chip label="Instructors · 28" active={adminEntity === 'instructors'} onPress={() => { setAdminEntity('instructors'); setAdminDraft(false); }} />
            <Chip label="Affiliations · 19" active={adminEntity === 'affiliations'} onPress={() => { setAdminEntity('affiliations'); setAdminDraft(false); }} />
          </View>
          <View style={styles.adminHeader}>
            <Text style={styles.sectionTitle}>{adminDraft ? `New ${adminEntity.slice(0, -1)} draft` : `${adminEntity[0].toUpperCase()}${adminEntity.slice(1)} records`}</Text>
            <Button label={adminDraft ? 'Cancel' : `＋ Add ${adminEntity.slice(0, -1)}`} small onPress={() => setAdminDraft(!adminDraft)} />
          </View>
          {adminEntity === 'studios' && !adminDraft && <Pressable onPress={() => setAdminDraft(true)} style={styles.adminRecord}>
            <Image source={photos.studio} style={styles.adminThumb} />
            <View style={styles.flex1}><Text style={styles.cardTitle}>Core Collective</Text><Text style={styles.meta}>Prahran · Verified · 2 instructors</Text><Text style={styles.inlineLink}>Edit studio  ›</Text></View>
            <Text style={styles.activeBadge}>ACTIVE</Text>
          </Pressable>}
          {adminEntity === 'instructors' && !adminDraft && <Pressable onPress={() => setScreen('instructor')} style={styles.adminRecord}>
            <Image source={photos.instructor} style={styles.personImageSmall} />
            <View style={styles.flex1}><Text style={styles.cardTitle}>Mia Chen</Text><Text style={styles.meta}>Reformer · Studio-affiliated · Core Collective</Text><Text style={styles.inlineLink}>Edit instructor  ›</Text></View>
            <Text style={styles.activeBadge}>ACTIVE</Text>
          </Pressable>}
          {adminEntity === 'affiliations' && !adminDraft && <Pressable onPress={() => setScreen('instructor')} style={styles.adminRecord}>
            <View style={styles.affiliationMark}><Text style={styles.affiliationMarkText}>CC</Text></View>
            <View style={styles.flex1}><Text style={styles.cardTitle}>Mia Chen  →  Core Collective</Text><Text style={styles.meta}>Studio-led affiliation · Primary studio</Text><Text style={styles.inlineLink}>Edit affiliation  ›</Text></View>
            <Text style={styles.activeBadge}>ACTIVE</Text>
          </Pressable>}
          {(adminDraft || adminEntity === 'studios') && <View style={styles.adminForm}>
            <Text style={styles.eyebrow}>{adminDraft ? 'CREATE / EDIT RECORD · SAMPLE' : 'QUICK EDIT · SAMPLE'}</Text>
            <TextInput key={`${adminEntity}-name-${adminDraft}`} defaultValue={adminEntity === 'instructors' ? 'Mia Chen' : adminEntity === 'affiliations' ? 'Mia Chen' : 'Core Collective'} placeholder={`Demo ${adminEntity.slice(0, -1)} name`} style={styles.formInput} />
            <TextInput key={`${adminEntity}-detail-${adminDraft}`} defaultValue={adminEntity === 'studios' ? 'Prahran, VIC' : adminEntity === 'instructors' ? 'Reformer · Pilates instructor' : 'Core Collective · Primary studio'} placeholder={adminEntity === 'studios' ? 'Area, city' : adminEntity === 'instructors' ? 'Specialty' : 'Select studio'} style={styles.formInput} />
            {adminEntity === 'studios' && <><Text style={styles.label}>FORMATS</Text><View style={styles.chipRow}><Chip label="Reformer" active /><Chip label="Mat" active /></View><Text style={[styles.label, styles.affiliatedLabel]}>AFFILIATED INSTRUCTORS</Text><Pressable onPress={() => setScreen('instructor')} style={styles.personRow}><Image source={photos.instructor} style={styles.personImageSmall} /><View style={styles.flex1}><Text style={styles.cardTitle}>Mia Chen</Text><Text style={styles.meta}>Studio-led affiliation · Active</Text></View><Text style={styles.chevron}>›</Text></Pressable></>}
            {adminEntity === 'instructors' && <View style={styles.noteCard}><Text style={styles.noteTitle}>Listing model</Text><Text style={styles.meta}>Studio-tagged instructors are studio-led. Independent listings need MoveActive approval.</Text></View>}
            {adminEntity === 'affiliations' && <View style={styles.noteCard}><Text style={styles.noteTitle}>Studio-led by default</Text><Text style={styles.meta}>Studios add instructors to their affiliation list. Independent affiliation requests require MoveActive approval.</Text></View>}
            <Button label="Save sample changes" onPress={() => { setAdminDraft(false); setNotice('Saved locally for this demo'); }} />
          </View>}
          <View style={styles.noteCard}><Text style={styles.noteTitle}>Sample admin only</Text><Text style={styles.meta}>Changes stay local to this demo. Independent instructors need MoveActive approval; studio participation stays visible.</Text></View>
        </ScrollView>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
        <StatusBar barStyle="dark-content" />
        {screen !== 'onboarding' && <TopBar screen={screen} onBack={back} onYou={() => goTab('you')} />}
        <View style={styles.screen}>{renderScreen()}</View>
        {screen !== 'onboarding' && screen !== 'checkout' && screen !== 'order' && screen !== 'admin' && screen !== 'referral' && <BottomNav screen={screen} bagCount={bagCount} onSelect={goTab} />}
        {!!notice && <Pressable style={styles.toast} onPress={() => setNotice('')}><Text style={styles.toastText}>{notice}  ×</Text></Pressable>}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}



export default App;
