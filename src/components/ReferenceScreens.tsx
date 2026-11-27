import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AppConfig, Product, Studio, Workout } from '../api/types';
import { money } from '../api/client';
import { artwork } from '../data/artwork';
import { OrbitImage } from './OrbitImage';
import { BagIcon, Button, Chip, Heading, RightArrowIcon, styles } from './OrbitUI';
import { fallbackProduct, fallbackStudio } from '../data/fallbackData';

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

export function ProductTagScreen({ workout, busy, event, onProduct, onAdd, onKeepExploring, onMap, onStudio }: {
  workout: Workout; busy: boolean; event?: AppConfig['eventConcept'];
  onProduct: (id: string) => void; onAdd: (product: Product, variantId: string) => void;
  onKeepExploring: () => void; onMap: (studio: Studio) => void; onStudio: (id: string) => void;
}) {
  const items = workout.products?.length ? workout.products : [fallbackProduct];
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [variantId, setVariantId] = useState('');
  const selected = items.find(p => p.id === selectedId) ?? items[0];
  const variant = selected?.variants.find(v => v.id === variantId) ?? selected?.variants.find(v => v.available) ?? selected?.variants[0];
  const instructor = workout.instructors?.[0];
  const studioName = workout.studio?.name ?? 'Core Collective';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* 1. Eyebrow */}
      <Text style={local.tagEyebrow}>WORN IN THIS SESSION</Text>

      {/* 2. Heading */}
      <Heading title={instructor ? `${instructor.name.split(' ')[0]}’s Pilates studio` : 'Mia’s Pilates studio'} />

      {/* 3. Product Card */}
      {selected ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${selected.title}`}
          onPress={() => onProduct(selected.id)}
          style={local.productCardBox}
        >
          <OrbitImage source={artwork(selected)} style={local.productCardThumb} resizeMode="contain" />
          <View style={styles.flex1}>
            <Text style={local.productEyebrow}>MOVEACTIVE EDIT</Text>
            <Text style={local.productTitleText} numberOfLines={1}>
              {selected.title}
            </Text>
            <Text style={local.productMetaText}>
              {money(variant?.price, selected.currency)} · {variant?.title ?? 'Peony / Ivory'}
            </Text>
          </View>
          <BagIcon />
        </Pressable>
      ) : (
        <Text style={styles.bodyCopy}>No products are tagged in this session yet.</Text>
      )}

      {/* 4. Supporting text */}
      <Text style={local.supportingCopy}>
        Your purchase supports the instructor who recommended this edit.
      </Text>

      {/* 5. ADD TO BAG Pink Button */}
      <Pressable
        accessibilityRole="button"
        disabled={busy || !variant?.available}
        onPress={() => { if (variant && selected) { onAdd(selected, variant.id); } }}
        style={[local.pinkPillButton, (busy || !variant?.available) && styles.buttonDisabled]}
      >
        <Text style={local.pinkPillText}>
          {`ADD TO BAG · ${money(variant?.price, selected?.currency ?? 'AUD')}`}
        </Text>
        <View style={local.pinkPillArrow}>
          <RightArrowIcon color="#202020" />
        </View>
      </Pressable>

      {/* 6. KEEP EXPLORING White Button */}
      <Pressable
        accessibilityRole="button"
        onPress={onKeepExploring}
        style={local.whitePillButton}
      >
        <Text style={local.whitePillText}>KEEP EXPLORING</Text>
        <View style={local.whitePillArrow}>
          <RightArrowIcon color="#202020" />
        </View>
      </Pressable>

      {/* 7. Map Preview Card */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open map for ${studioName}`}
        onPress={() => onMap(workout.studio ?? fallbackStudio)}
        style={local.mapCardBox}
      >
        <View style={local.roadOne} />
        <View style={local.roadTwo} />
        {/* Pin 1 (purple/pink) */}
        <View style={local.pinOne}>
          <Text style={local.pinGlyphPurple}>📍</Text>
        </View>
        {/* Pin 2 (dark) */}
        <View style={local.pinTwo}>
          <Text style={local.pinGlyphDark}>⌖</Text>
        </View>
        {/* Map Preview pill badge */}
        <View style={local.mapBadge}>
          <Text style={local.mapBadgeIcon}>⌖</Text>
          <Text style={local.mapBadgeText}>Map preview</Text>
        </View>
      </Pressable>

      {/* 8. Event Concept Card */}
      {event && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Event concept details"
          onPress={() => onStudio(workout.studioId || event.studioId)}
          style={local.eventCardBox}
        >
          <View style={local.dateTileBox}>
            <Text style={local.dateWeekday}>{event.weekday ?? 'SAT'}</Text>
            <Text style={local.dateDay}>{event.day ?? '24'}</Text>
          </View>
          <View style={styles.flex1}>
            <Text style={local.eventEyebrow}>EVENT CONCEPT</Text>
            <Text style={local.eventTitle} numberOfLines={1}>{event.title ?? 'Reformer fundamentals workshop'}</Text>
            <Text style={local.eventMeta} numberOfLines={1}>
              Saturday · {studioName} · External booking
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    </ScrollView>
  );
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

  tagEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.3, color: '#8d8883', marginTop: 4, marginBottom: 4 },
  productCardBox: { backgroundColor: '#f2ede4', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  productCardThumb: { width: 68, height: 68, borderRadius: 10, backgroundColor: '#ffffff', marginRight: 12 },
  productEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.1, color: '#8d8883' },
  productTitleText: { fontSize: 14, fontWeight: '700', color: '#202020', marginTop: 3 },
  productMetaText: { fontSize: 11, color: '#77736f', marginTop: 3 },
  supportingCopy: { fontSize: 12, lineHeight: 18, color: '#77736f', marginBottom: 16 },
  pinkPillButton: { backgroundColor: '#eddde5', height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 10 },
  pinkPillText: { fontSize: 12, fontWeight: '700', color: '#202020', letterSpacing: 0.5 },
  pinkPillArrow: { position: 'absolute', right: 20, width: 18, height: 20, justifyContent: 'center', alignItems: 'center' },
  whitePillButton: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#202020', height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 16 },
  whitePillText: { fontSize: 12, fontWeight: '700', color: '#202020', letterSpacing: 0.5 },
  whitePillArrow: { position: 'absolute', right: 20, width: 18, height: 20, justifyContent: 'center', alignItems: 'center' },

  mapCardBox: { height: 185, borderRadius: 18, overflow: 'hidden', backgroundColor: '#e7e3db', position: 'relative', marginBottom: 14 },
  roadOne: { position: 'absolute', height: 26, width: '150%', backgroundColor: '#ffffff', top: 50, left: -40, transform: [{ rotate: '-24deg' }] },
  roadTwo: { position: 'absolute', height: 26, width: '150%', backgroundColor: '#ffffff', top: 72, left: -40, transform: [{ rotate: '48deg' }] },
  pinOne: { position: 'absolute', top: 54, left: '26%', width: 34, height: 34, borderRadius: 17, backgroundColor: '#eadfe7', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff', elevation: 2 },
  pinGlyphPurple: { fontSize: 14 },
  pinTwo: { position: 'absolute', top: 108, right: '28%', width: 34, height: 34, borderRadius: 17, backgroundColor: '#202020', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff', elevation: 2 },
  pinGlyphDark: { fontSize: 14, color: '#ffffff' },
  mapBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: '#ffffff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6, elevation: 2 },
  mapBadgeIcon: { fontSize: 12, color: '#202020' },
  mapBadgeText: { fontSize: 11, fontWeight: '700', color: '#202020' },

  eventCardBox: { backgroundColor: '#f2ede4', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dateTileBox: { width: 48, height: 54, borderRadius: 8, borderWidth: 1, borderColor: '#ded8d0', backgroundColor: '#faf7f2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dateWeekday: { fontSize: 9, fontWeight: '600', color: '#77736f' },
  dateDay: { fontSize: 22, fontWeight: '700', color: '#202020', lineHeight: 26 },
  eventEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, color: '#8d8883' },
  eventTitle: { fontSize: 13, fontWeight: '700', color: '#202020', marginTop: 2 },
  eventMeta: { fontSize: 10, color: '#77736f', marginTop: 2 },
});
