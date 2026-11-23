import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { instructors, photos, studios } from '../data/mockData';
import { Screen } from '../types';

const C = {
  ink: '#202020',
  muted: '#77736f',
  line: '#ece8e5',
  paper: '#ffffff',
  canvas: '#faf9f7',
  coral: '#ef8e83',
  coralPale: '#fff0ed',
  sage: '#e9efea',
};

const Button = ({ label, onPress, secondary = false, small = false }: { label: string; onPress: () => void; secondary?: boolean; small?: boolean }) => (
  <Pressable onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary, small && styles.buttonSmall]}>
    <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText, small && styles.buttonTextSmall]}>{label}</Text>
  </Pressable>
);

const Chip = ({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

const Heading = ({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) => (
  <View style={styles.headingWrap}>
    {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
    <Text style={styles.heading}>{title}</Text>
    {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const Photo = ({ uri, height = 190, radius = 18 }: { uri: ImageSourcePropType | undefined; height?: number; radius?: number }) => (
  <Image source={uri} style={[styles.photo, { height, borderRadius: radius }]} resizeMode="cover" />
);

const SectionTitle = ({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) => (
  <View style={styles.sectionTitleRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {!!action && <Pressable onPress={onPress}><Text style={styles.link}>{action}</Text></Pressable>}
  </View>
);

const StudioCard = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.studioCard}>
    <Image source={photos.studio} style={styles.studioThumb} />
    <View style={styles.flex1}>
      <View style={styles.titleInline}><Text style={styles.cardTitle}>{studios[0].name}</Text><Text style={styles.verified}> ✓</Text></View>
      <Text style={styles.meta}>{studios[0].area} · {studios[0].distance} · Verified partner</Text>
      <Text style={styles.inlineLink}>Open profile  ›</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

const WorkoutCard = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.workoutCard}>
    <View>
      <Image source={photos.session} style={styles.workoutPhoto} />
      <View style={styles.play}><Text style={styles.playIcon}>▶</Text></View>
      <View style={styles.duration}><Text style={styles.durationText}>◷ 15 min</Text></View>
    </View>
    <View style={styles.workoutText}>
      <Text style={styles.cardTitle}>15-minute Reformer Reset</Text>
      <Text style={styles.meta}>With {instructors[0].name} · Beginner</Text>
    </View>
  </Pressable>
);

const ProductCard = ({ title, price, uri, onPress }: { title: string; price: string; uri: ImageSourcePropType | undefined; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.productCard}>
    <Image source={uri} style={styles.productPhoto} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.meta}>{price} AUD</Text>
  </Pressable>
);

const TopBar = ({ screen, onBack, onYou }: { screen: Screen; onBack: () => void; onYou: () => void }) => (
  <View style={styles.topBar}>
    {screen !== 'discover' && screen !== 'studios' && screen !== 'shop' && screen !== 'you' ? (
      <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹</Text></Pressable>
    ) : <View style={styles.brandMark}><Text style={styles.brandMarkText}>M</Text></View>}
    <Text style={styles.brand}>Move<Text style={styles.brandLight}>Active</Text></Text>
    <Pressable onPress={onYou} style={styles.avatar}><Text style={styles.avatarText}>A</Text></Pressable>
  </View>
);

const BottomNav = ({ screen, bagCount, onSelect }: { screen: Screen; bagCount: number; onSelect: (screen: Screen) => void }) => (
  <View style={styles.bottomNav}>
    {([
      ['discover', '⌖', 'Discover'],
      ['studios', '⌂', 'Studios'],
      ['shop', '◇', 'Shop'],
      ['you', '○', 'You'],
    ] as [Screen, string, string][]).map(([id, icon, name]) => (
      <Pressable key={id} onPress={() => onSelect(id)} style={styles.navItem}>
        <Text style={[styles.navIcon, screen === id && styles.navActive]}>{icon}{id === 'shop' && bagCount > 0 ? ` ${bagCount}` : ''}</Text>
        <Text style={[styles.navLabel, screen === id && styles.navActive]}>{name}</Text>
      </Pressable>
    ))}
  </View>
);


export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  screen: { flex: 1, backgroundColor: C.paper },
  flex1: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 28 },
  topBar: { height: 58, borderBottomWidth: 1, borderBottomColor: '#f2f0ee', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.paper },
  brandMark: { width: 26 },
  brandMarkText: { color: C.coral, fontSize: 20, fontWeight: '700' },
  brand: { position: 'absolute', left: 54, color: C.ink, fontSize: 20, letterSpacing: -1.1, fontWeight: '600' },
  brandLight: { fontWeight: '300' },
  avatar: { height: 29, width: 29, borderRadius: 15, backgroundColor: '#e8f0f3', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#394b53', fontWeight: '600', fontSize: 12 },
  backButton: { width: 30 }, backText: { fontSize: 34, lineHeight: 34, color: C.ink },
  bottomNav: { height: 65, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: C.paper, paddingBottom: 4 },
  navItem: { alignItems: 'center', minWidth: 60 }, navIcon: { fontSize: 20, color: '#8c8986', height: 25 }, navLabel: { fontSize: 10, color: '#8c8986', marginTop: 1 }, navActive: { color: C.ink, fontWeight: '700' },
  headingWrap: { marginTop: 7, marginBottom: 16 }, eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, color: '#8d8883', marginBottom: 7 }, heading: { fontSize: 31, lineHeight: 36, letterSpacing: -1.4, fontWeight: '400', color: C.ink }, headingSmall: { fontSize: 25, fontWeight: '600', color: C.ink, letterSpacing: -0.7 }, subtitle: { fontSize: 13, lineHeight: 20, color: C.muted, marginTop: 7 },
  chipRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginBottom: 14 }, chip: { minHeight: 31, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: '#e8e4e1', justifyContent: 'center', backgroundColor: C.paper }, chipActive: { backgroundColor: C.ink, borderColor: C.ink }, chipText: { color: '#5d5955', fontSize: 10, fontWeight: '500' }, chipTextActive: { color: C.paper },
  studioCard: { minHeight: 88, borderColor: '#f1d0cb', borderWidth: 1, borderRadius: 15, backgroundColor: C.paper, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 19 }, studioThumb: { width: 62, height: 62, borderRadius: 10, backgroundColor: C.sage }, titleInline: { flexDirection: 'row', alignItems: 'center' }, cardTitle: { color: C.ink, fontSize: 13, fontWeight: '600', lineHeight: 18 }, verified: { color: '#588174', fontSize: 9, fontWeight: '700' }, meta: { color: C.muted, fontSize: 10, lineHeight: 16 }, inlineLink: { color: C.ink, fontSize: 10, fontWeight: '600', marginTop: 5 }, chevron: { color: '#65615d', fontSize: 22, paddingHorizontal: 5 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11, marginTop: 7 }, sectionTitle: { fontSize: 17, fontWeight: '600', color: C.ink, letterSpacing: -0.3 }, link: { fontSize: 11, color: C.ink, fontWeight: '600' }, workoutCard: { borderWidth: 1, borderColor: C.line, borderRadius: 16, overflow: 'hidden', marginBottom: 14, backgroundColor: C.paper }, workoutPhoto: { height: 175, width: '100%', backgroundColor: C.sage }, workoutText: { padding: 12 }, play: { position: 'absolute', left: 13, bottom: 13, backgroundColor: 'rgba(255,255,255,0.94)', height: 31, width: 31, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, playIcon: { color: C.ink, fontSize: 11 }, duration: { position: 'absolute', right: 11, bottom: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(32,32,32,0.75)' }, durationText: { color: C.paper, fontSize: 9 }, recommendCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: '#fcf8f5', marginBottom: 18 }, recommendIcon: { height: 31, width: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: C.coralPale }, recommendIconText: { color: C.coral, fontSize: 16 },
  button: { height: 50, backgroundColor: C.ink, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 6 }, buttonSecondary: { backgroundColor: C.paper, borderWidth: 1, borderColor: '#d9d4d0' }, buttonSmall: { height: 34, paddingHorizontal: 14, borderRadius: 18, marginTop: 0, marginBottom: 0 }, buttonText: { color: C.paper, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }, buttonSecondaryText: { color: C.ink }, buttonTextSmall: { fontSize: 9 },
  searchBox: { height: 45, borderRadius: 13, borderWidth: 1, borderColor: C.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 12 }, searchIcon: { color: '#88837e', fontSize: 22, marginRight: 7 }, searchInput: { flex: 1, paddingVertical: 0, color: C.ink, fontSize: 11 }, resultCount: { color: '#96908b', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginVertical: 7 }, directoryRow: { borderTopWidth: 1, borderColor: C.line, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }, mapCard: { marginTop: 17, height: 135, borderRadius: 18, backgroundColor: '#edf1ed', justifyContent: 'center', alignItems: 'center' }, mapPin: { fontSize: 27, color: '#6c8373' }, mapTitle: { fontSize: 13, color: C.ink, fontWeight: '600', marginTop: 5 },
  profileTitle: { paddingTop: 17, paddingBottom: 5 }, bodyCopy: { color: '#625e5a', fontSize: 12, lineHeight: 19, marginVertical: 9 }, infoBox: { borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 15, marginVertical: 10 }, personRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f1eeeb' }, personImage: { width: 49, height: 49, borderRadius: 25, backgroundColor: C.sage }, personImageSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.sage },
  instructorHero: { width: '100%', height: 285, borderRadius: 18, marginBottom: 21, backgroundColor: C.sage }, affiliation: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.canvas, borderRadius: 14, padding: 11, marginBottom: 14 }, affiliationMark: { width: 39, height: 39, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0ebe8' }, affiliationMarkText: { color: '#587174', fontSize: 13, fontWeight: '700' }, referralCard: { backgroundColor: '#fcf5f2', borderRadius: 17, padding: 16, marginBottom: 20 }, codeRow: { marginTop: 9 }, code: { fontSize: 23, fontWeight: '700', letterSpacing: 3, color: C.ink }, simpleRow: { borderBottomWidth: 1, borderColor: C.line, paddingVertical: 14 },
  sessionHero: { height: 230, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }, sessionHeroImage: { borderRadius: 20 }, bigPlay: { height: 57, width: 57, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.93)', alignItems: 'center', justifyContent: 'center' }, editCard: { borderRadius: 17, backgroundColor: C.canvas, padding: 14, marginTop: 12 }, tagProduct: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.paper, borderRadius: 12, padding: 8, marginTop: 11 }, tagImage: { width: 52, height: 52, borderRadius: 9, backgroundColor: C.sage }, textLink: { paddingTop: 10 }, attribution: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: 14, backgroundColor: '#fcf8f5', marginVertical: 14 },
  collectionHero: { borderRadius: 18, overflow: 'hidden', backgroundColor: C.canvas, marginBottom: 20 }, collectionCopy: { paddingHorizontal: 13, paddingVertical: 12 }, productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, productCard: { width: '48.3%', marginBottom: 16 }, productPhoto: { width: '100%', height: 145, borderRadius: 14, backgroundColor: C.sage, marginBottom: 8 },
  label: { color: '#8d8883', fontSize: 9, fontWeight: '700', letterSpacing: 1.1, marginBottom: 9 }, quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }, stepper: { height: 33, borderRadius: 18, borderWidth: 1, borderColor: C.line, flexDirection: 'row', alignItems: 'center', gap: 17, paddingHorizontal: 9 }, stepperText: { color: C.ink, fontSize: 16 }, qty: { fontSize: 12, color: C.ink }, bundleCard: { backgroundColor: C.canvas, borderRadius: 16, padding: 14, marginTop: 17 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 14, borderBottomWidth: 1, borderColor: C.line }, cartPhoto: { height: 74, width: 74, borderRadius: 13, backgroundColor: C.sage }, codeBox: { borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 13, marginVertical: 16 }, codeInput: { borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, height: 42, marginTop: 10, color: C.ink, fontSize: 11 }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }, divider: { height: 1, backgroundColor: C.line, marginVertical: 8 }, disclaimer: { textAlign: 'center', color: C.muted, fontSize: 9, marginBottom: 8 }, emptyBag: { alignItems: 'center', paddingVertical: 27 }, emptyIcon: { fontSize: 38, color: C.coral, marginBottom: 10 }, finePrint: { color: '#96908b', fontSize: 9, lineHeight: 14, marginTop: 7 }, formInput: { borderWidth: 1, borderColor: C.line, borderRadius: 10, minHeight: 43, paddingHorizontal: 12, marginTop: 9, color: C.ink, fontSize: 11 }, orderCheck: { height: 60, width: 60, borderRadius: 30, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, orderCheckText: { fontSize: 28, color: '#587b68' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 12, marginVertical: 7 }, largeAvatar: { width: 51, height: 51, borderRadius: 26, backgroundColor: '#e8f0f3', alignItems: 'center', justifyContent: 'center' }, largeAvatarText: { fontSize: 20, color: '#394b53' }, menuCard: { borderWidth: 1, borderColor: C.line, borderRadius: 15, paddingHorizontal: 13, marginBottom: 20 }, menuRow: { minHeight: 49, borderBottomWidth: 1, borderColor: '#f1eeeb', flexDirection: 'row', alignItems: 'center', gap: 11 }, menuIcon: { width: 25, fontSize: 17, color: C.coral, textAlign: 'center' },
  referralHero: { alignItems: 'center', justifyContent: 'center', borderRadius: 20, height: 205, backgroundColor: '#faeeea', marginBottom: 14 }, referralStars: { fontSize: 24, color: C.coral }, referralStudio: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: C.muted, marginTop: 8 }, referralCode: { fontSize: 34, fontWeight: '700', letterSpacing: 5, color: C.ink, marginVertical: 7 }, referralDesc: { fontSize: 10, color: C.muted }, noteCard: { padding: 14, backgroundColor: '#f5f2ed', borderRadius: 14, marginVertical: 11 }, noteTitle: { fontSize: 11, color: C.ink, fontWeight: '700', marginBottom: 4 },
  adminTabs: { flexDirection: 'row', gap: 6, marginBottom: 15 }, adminHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, adminRecord: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 9 }, adminThumb: { width: 53, height: 53, borderRadius: 10 }, activeBadge: { fontSize: 8, color: '#4d7964', fontWeight: '700', backgroundColor: '#e8f1e9', paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9 }, adminForm: { borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 13, marginTop: 13 }, affiliatedLabel: { marginTop: 14 },
  photo: { width: '100%', backgroundColor: C.sage }, onboardHero: { height: 270, justifyContent: 'flex-end', overflow: 'hidden' }, onboardImage: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }, onboardShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(16,18,18,0.32)' }, onboardCopy: { paddingHorizontal: 23, paddingBottom: 24 }, onboardEyebrow: { color: '#fff', fontSize: 9, letterSpacing: 1.4, fontWeight: '700', marginBottom: 8 }, onboardTitle: { fontSize: 34, lineHeight: 38, color: '#fff', fontWeight: '400', letterSpacing: -1.4, maxWidth: 260 }, onboardSub: { color: '#fff', fontSize: 12, lineHeight: 18, marginTop: 8, maxWidth: 290 }, onboardBody: { paddingHorizontal: 20, paddingTop: 22 }, interestLabel: { marginTop: 25 }, interestFormats: { marginTop: 9 }, spacer10: { height: 10 }, locationField: { borderWidth: 1, borderColor: C.line, borderRadius: 13, paddingHorizontal: 12, height: 47, flexDirection: 'row', alignItems: 'center', gap: 9 }, locationPin: { color: C.coral, fontSize: 19 }, locationText: { flex: 1, color: C.ink, fontSize: 11 }, locationChange: { color: C.muted, fontSize: 10 },
  toast: { position: 'absolute', left: 24, right: 24, bottom: 76, borderRadius: 13, backgroundColor: C.ink, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' }, toastText: { color: C.paper, fontSize: 11, fontWeight: '600' },
});

export { Button, Chip, Heading, Photo, SectionTitle, StudioCard, WorkoutCard, ProductCard, TopBar, BottomNav, C };
