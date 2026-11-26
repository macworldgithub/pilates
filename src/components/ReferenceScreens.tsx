import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AppConfig, Product, Studio, Workout } from '../api/types';
import { money } from '../api/client';
import { artwork } from '../data/artwork';
import { OrbitImage } from './OrbitImage';
import { Button, Chip, Heading, styles } from './OrbitUI';

export function ProductGallery({ product }: { product: Product }) {
  const photos = [...new Set([product.imageUrl, ...(product.imageUrls ?? [])].filter(Boolean))];
  const [selected, setSelected] = useState(0);
  const [detail, setDetail] = useState(false);
  return <View>
    <OrbitImage accessibilityLabel={`${product.title}${detail ? ' detail' : ''}`} source={artwork({ imageUrl: photos[selected] })} style={local.productHero} resizeMode={detail ? 'cover' : 'contain'} />
    <View style={styles.chipRow}>
      {photos.map((url, index) => <Pressable key={url} accessibilityRole="button" accessibilityLabel={`Product photo ${index + 1}`} accessibilityState={{ selected: selected === index && !detail }} onPress={() => { setSelected(index); setDetail(false); }} style={[local.thumbnail, selected === index && !detail && local.selected]}><OrbitImage source={artwork({ imageUrl: url })} style={local.thumbImage} resizeMode="contain" /></Pressable>)}
      <Chip label={detail ? 'Full image' : 'View detail'} active={detail} onPress={() => setDetail(!detail)} />
    </View>
  </View>;
}

export function DeliveryPreview() {
  const [values, setValues] = useState<Record<string, string>>({});
  const fields = ['Email address', 'Full name', 'Street address'];
  const input = (label: string) => <TextInput
    key={label}
    accessibilityLabel={label}
    placeholder={label}
    placeholderTextColor="#8d8883"
    value={values[label] ?? ''}
    onChangeText={value => setValues(old => ({ ...old, [label]: value }))}
    keyboardType={label === 'Email address' ? 'email-address' : label === 'Postcode' ? 'number-pad' : 'default'}
    autoCapitalize={label === 'Email address' ? 'none' : 'words'}
    autoCorrect={false}
    maxLength={label === 'Postcode' ? 10 : 200}
    style={[local.deliveryInput, (label === 'Suburb' || label === 'Postcode') && local.deliveryAddressInput]}
  />;
  return <View style={local.deliveryCard}>
    <View style={local.deliveryHeading}><Text style={local.deliveryIcon}>▣</Text><Text style={local.deliveryTitle}>Delivery details</Text></View>
    {fields.map(input)}
    <View style={local.deliveryAddressRow}>{input('Suburb')}{input('Postcode')}</View>
    <Text style={local.deliveryFinePrint}>Example form. No data is submitted.</Text>
  </View>;
}

export function MembershipScreen({ onExplore }: { onExplore: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>MEMBERSHIP · PRICING TO CONFIRM</Text><Heading title="More ways to move." />
    <View style={local.membershipCard}><Text style={styles.label}>MOVEACTIVE+</Text><Text style={local.membershipTitle}>Your premium{ '\n' }Pilates membership</Text><Text style={styles.meta}>Premium sessions · Member benefits · Trial to confirm</Text></View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={local.faq}><Text style={styles.bodyCopy}>What happens after the trial?</Text><Text style={styles.chevron}>{expanded ? '−' : '⌄'}</Text></Pressable>
    {expanded && <Text style={styles.bodyCopy}>Trial length, pricing and member benefits are still to be confirmed. Explore the sample sessions now; no subscription or automatic charge is created.</Text>}
    <Button label="Explore premium sessions" onPress={onExplore} />
  </ScrollView>;
}

function MapPreview({ studio, onOpen }: { studio: Studio; onOpen: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open map for ${studio.name}`} onPress={onOpen} style={local.map}>
    <View style={local.roadOne} /><View style={local.roadTwo} />
    <View style={local.mapPin}><Text style={local.pinText}>⌖</Text></View><View style={local.mapCaption}><Text style={styles.cardTitle}>{studio.name}</Text><Text style={styles.meta}>Map preview · Tap for directions</Text></View>
  </Pressable>;
}

export function ProductTagScreen({ workout, busy, event, onProduct, onAdd, onKeepExploring, onMap, onStudio }: {
  workout: Workout; busy: boolean; event?: AppConfig['eventConcept'];
  onProduct: (id: string) => void; onAdd: (product: Product, variantId: string) => void;
  onKeepExploring: () => void; onMap: (studio: Studio) => void; onStudio: (id: string) => void;
}) {
  const items = workout.products ?? [];
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [variantId, setVariantId] = useState('');
  const [eventOpen, setEventOpen] = useState(false);
  const selected = items.find(p => p.id === selectedId) ?? items[0];
  const variant = selected?.variants.find(v => v.id === variantId) ?? selected?.variants.find(v => v.available);
  const instructor = workout.instructors?.[0];
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>WORN IN THIS SESSION</Text><Heading title={instructor ? `${instructor.name.split(' ')[0]}’s Pilates studio` : 'Your studio edit'} />
    {items.length > 1 && <View style={styles.chipRow}>{items.map(p => <Chip key={p.id} label={p.collection.replace(/-/g, ' ')} active={selected?.id === p.id} onPress={() => { setSelectedId(p.id); setVariantId(''); }} />)}</View>}
    {selected ? <>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${selected.title}`} onPress={() => onProduct(selected.id)} style={local.tagCard}>
        <OrbitImage source={artwork(selected)} style={local.tagPhoto} resizeMode="contain" /><View style={styles.flex1}><Text style={styles.label}>MOVEACTIVE EDIT</Text><Text style={styles.cardTitle}>{selected.title}</Text><Text style={styles.meta}>{money(variant?.price, selected.currency)} · View product ›</Text></View><Text style={styles.chevron}>♧</Text>
      </Pressable>
      <Text style={styles.bodyCopy}>Discover the edit recommended by {instructor?.name ?? 'your studio'}.</Text>
      <View style={styles.chipRow}>{selected.variants.map(v => <Chip key={v.id} label={`${v.title}${v.available ? '' : ' · Unavailable'}`} active={variant?.id === v.id} onPress={() => setVariantId(v.id)} />)}</View>
      <View style={local.pinkButton}><Button secondary tone="pink" label={`Add to bag · ${money(variant?.price, selected.currency)}`} disabled={busy || !variant?.available} onPress={() => { if (variant) { onAdd(selected, variant.id); } }} /></View>
    </> : <Text style={styles.bodyCopy}>No products are tagged in this session yet.</Text>}
    <Button secondary label="Keep exploring" onPress={onKeepExploring} />
    {workout.studio && <MapPreview studio={workout.studio} onOpen={() => onMap(workout.studio!)} />}
    {event && event.studioId === workout.studioId && <View style={local.eventCard}>
      <Pressable accessibilityRole="button" accessibilityLabel="Reformer workshop details" accessibilityState={{ expanded: eventOpen }} onPress={() => setEventOpen(!eventOpen)} style={local.eventRow}>
        <View style={local.dateTile}><Text style={styles.meta}>{event.weekday}</Text><Text style={local.day}>{event.day}</Text></View><View style={styles.flex1}><Text style={styles.label}>EVENT CONCEPT</Text><Text style={styles.cardTitle}>{event.title}</Text><Text style={styles.meta}>Example event · External booking</Text></View><Text style={styles.chevron}>{eventOpen ? '−' : '›'}</Text>
      </Pressable>
      {eventOpen && <><Text style={styles.bodyCopy}>A sample workshop at {workout.studio?.name ?? 'your studio'}. Confirm dates, availability and bookings directly with the studio.</Text><Button secondary label="View workshop studio" onPress={() => onStudio(workout.studioId)} /></>}
    </View>}
  </ScrollView>;
}

const local = StyleSheet.create({
  deliveryCard: { backgroundColor: '#f5f5f4', borderRadius: 13, padding: 12, marginBottom: 10 },
  deliveryHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 },
  deliveryIcon: { color: '#202020', fontSize: 12 }, deliveryTitle: { color: '#202020', fontSize: 11, fontWeight: '500' },
  deliveryInput: { height: 39, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e4e2df', borderRadius: 5, paddingHorizontal: 9, paddingVertical: 0, marginTop: 5, color: '#202020', fontSize: 10 },
  deliveryAddressRow: { flexDirection: 'row', gap: 5 }, deliveryAddressInput: { flex: 1 },
  deliveryFinePrint: { color: '#96908b', fontSize: 8, lineHeight: 12, marginTop: 7 },
  productHero: { width: '100%', height: 300, borderRadius: 12, marginBottom: 10, backgroundColor: '#f5f2ed' },
  thumbnail: { borderWidth: 1, borderColor: '#e6e1da', padding: 3, borderRadius: 7 }, selected: { borderColor: '#202020' }, thumbImage: { width: 45, height: 45, borderRadius: 4 },
  membershipCard: { backgroundColor: '#dfecf2', borderRadius: 16, padding: 22, minHeight: 175, justifyContent: 'center' }, membershipTitle: { fontSize: 27, fontWeight: '700', color: '#202020', letterSpacing: -1, marginBottom: 10 },
  faq: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ece8e5', paddingVertical: 13, marginVertical: 16 },
  tagCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#eeeadf', padding: 12, borderRadius: 12, marginBottom: 16 }, tagPhoto: { width: 70, height: 88, borderRadius: 8 },
  pinkButton: { backgroundColor: '#efdae5', borderRadius: 30, marginTop: 12, marginBottom: 6 },
  map: { height: 170, overflow: 'hidden', backgroundColor: '#e7e4dc', borderRadius: 12, marginTop: 5, marginBottom: 12 },
  roadOne: { position: 'absolute', height: 16, width: '140%', backgroundColor: '#fff', top: 60, left: -20, transform: [{ rotate: '-20deg' }] }, roadTwo: { position: 'absolute', height: 16, width: '140%', backgroundColor: '#fff', top: 65, left: -20, transform: [{ rotate: '54deg' }] },
  mapPin: { position: 'absolute', right: '24%', top: 65, backgroundColor: '#202020', borderRadius: 20, padding: 6 }, pinText: { color: '#fff', fontSize: 24 }, mapCaption: { position: 'absolute', bottom: 9, left: 9, backgroundColor: '#ffffffeb', padding: 7, borderRadius: 7 },
  eventCard: { backgroundColor: '#f7f2ee', borderRadius: 12, padding: 12 }, eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, dateTile: { borderWidth: 1, borderColor: '#ded8d1', borderRadius: 5, width: 46, padding: 6, alignItems: 'center' }, day: { color: '#202020', fontSize: 25 },
});
