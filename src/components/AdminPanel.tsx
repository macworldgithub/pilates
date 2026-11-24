import { OrbitImage } from './OrbitImage';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import type { Affiliation, Instructor, Studio } from '../api/types';
import { artwork } from '../data/artwork';
import { Button, Chip, Heading, styles } from './OrbitUI';

type Kind = 'studios' | 'instructors' | 'affiliations';
type Props = { task: (work: () => Promise<void>) => void; busy: boolean; onChanged: () => Promise<void>; onLogout: () => void; onPreview: () => void; onError: (reason: unknown) => void };
export function AdminPanel({ task, busy: actionBusy, onChanged, onLogout, onPreview, onError }: Props) {
  const [loading, setLoading] = useState(true);
  const busy = actionBusy || loading;
  const [kind, setKind] = useState<Kind>('studios');
  const [studios, setStudios] = useState<Studio[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [editing, setEditing] = useState<Studio | Instructor | null | undefined>();
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [independent, setIndependent] = useState(false);
  const [approval, setApproval] = useState('approved');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Melbourne');
  const [country, setCountry] = useState('AU');
  const [latitude, setLatitude] = useState('-37.84');
  const [longitude, setLongitude] = useState('144.98');
  const [website, setWebsite] = useState('');
  const [booking, setBooking] = useState('');
  const [partnerType, setPartnerType] = useState('partner');
  const [studioId, setStudioId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [formats, setFormats] = useState(['reformer', 'mat']);
  async function load() {
    const [s, i, a] = await Promise.all([api.adminList<Studio>('studios'), api.adminList<Instructor>('instructors'), api.adminList<Affiliation>('affiliations')]);
    setStudios(s.data); setInstructors(i.data); setAffiliations(a.data);
  }
  useEffect(() => {
    let active = true;
    load().catch(reason => { if (active) { onError(reason); } }).finally(() => { if (active) { setLoading(false); } });
    return () => { active = false; };
  }, [onError]);
  const edit = (record: Studio | Instructor | null) => {
    setEditing(record); setName(record?.name ?? ''); setDetail(record ? ('bio' in record ? record.bio : record.description) : '');
    setImageUrl(record?.imageUrl ?? ''); setPublished(record?.published ?? true);
    setIndependent(record && 'independent' in record ? record.independent : false);
    setApproval(record && 'approvalStatus' in record ? record.approvalStatus : 'approved');
    if (record && 'address' in record) {
      setAddress(record.address); setCity(record.city); setCountry(record.country); setLatitude(String(record.latitude)); setLongitude(String(record.longitude));
      setWebsite(record.websiteUrl); setBooking(record.bookingUrl); setPartnerType(record.partnerType); setFormats(record.formats);
    } else {
      setAddress(''); setCity('Melbourne'); setCountry('AU'); setLatitude('-37.84'); setLongitude('144.98');
      setWebsite(''); setBooking(''); setPartnerType('partner'); setFormats(['reformer', 'mat']);
    }
  };
  const save = () => task(async () => {
    const shared = { name: name.trim(), imageUrl: imageUrl.trim(), published };
    if (kind === 'studios') {
      const lat = Number(latitude), lng = Number(longitude);
      if (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        throw new Error('Enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      }
      await api.adminSave(kind, { ...shared, description: detail.trim(), address: address.trim(), city: city.trim(), country: country.trim().toUpperCase(),
        latitude: lat, longitude: lng, websiteUrl: website.trim(), bookingUrl: booking.trim(), formats, partnerType }, editing?.id);
    } else if (kind === 'instructors') {
      await api.adminSave(kind, { ...shared, bio: detail.trim(), independent, approvalStatus: approval }, editing?.id);
    }
    await load(); await onChanged(); setEditing(undefined);
  });
  const field = (label: string, value: string, update: (s: string) => void, maxLength = 200) => <View key={label}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={update} maxLength={maxLength} style={styles.formInput} autoCapitalize="none" autoCorrect={false} /></View>;
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>MOVEACTIVE · INTERNAL</Text><Heading title="Partner admin" subtitle="Manage studio records, instructors and studio-led affiliations." />
    <Button secondary label="Refresh admin records" disabled={busy} onPress={() => task(load)} />
    <View style={styles.chipRow}>{(['studios', 'instructors', 'affiliations'] as Kind[]).map(k => <Chip key={k} label={`${k} · ${k === 'studios' ? studios.length : k === 'instructors' ? instructors.length : affiliations.length}`} active={kind === k} onPress={() => { setKind(k); setEditing(undefined); }} />)}</View>
    {kind === 'affiliations' ? <>
      {affiliations.map(a => <View key={a.id} style={styles.infoBox}><Text style={styles.cardTitle}>{instructors.find(i => i.id === a.instructorId)?.name ?? a.instructorId} → {studios.find(s => s.id === a.studioId)?.name ?? a.studioId}</Text><Button small secondary label="Remove affiliation" disabled={busy} onPress={() => task(async () => { await api.adminRemoveAffiliation(a.studioId, a.instructorId); await load(); await onChanged(); })} /></View>)}
      <Text style={styles.sectionTitle}>Link an instructor to a studio</Text>
      <Text style={styles.label}>STUDIO</Text><View style={styles.chipRow}>{studios.map(s => <Chip key={s.id} label={s.name} active={studioId === s.id} onPress={() => setStudioId(s.id)} />)}</View>
      <Text style={styles.label}>INSTRUCTOR</Text><View style={styles.chipRow}>{instructors.map(i => <Chip key={i.id} label={i.name} active={instructorId === i.id} onPress={() => setInstructorId(i.id)} />)}</View>
      <Button label="Save affiliation" disabled={busy || !studioId || !instructorId} onPress={() => task(async () => { await api.adminAffiliation(studioId, instructorId); await load(); await onChanged(); setStudioId(''); setInstructorId(''); })} />
    </> : <>
      <Button label={`Add ${kind === 'studios' ? 'studio' : 'instructor'}`} secondary disabled={busy} onPress={() => edit(null)} />
      {editing === undefined ? (kind === 'studios' ? studios : instructors).map(record => <View key={record.id} style={styles.infoBox}><OrbitImage source={artwork(record)} style={styles.adminThumb} /><Text style={styles.cardTitle}>{record.name}</Text><Text style={styles.meta}>{record.published ? 'Published' : 'Archived / draft'}</Text><Button small label="Edit record" disabled={busy} onPress={() => edit(record)} /></View>) : <View style={styles.adminForm}>
        {field('Name', name, setName)}{field(kind === 'studios' ? 'Description' : 'Bio', detail, setDetail, 5000)}{field('Image URL or backend media path', imageUrl, setImageUrl, 2048)}
        <Chip label={published ? 'Published' : 'Draft / archived'} active={published} onPress={() => setPublished(!published)} />
        {kind === 'studios' && <>
          {field('Address', address, setAddress, 300)}{field('City', city, setCity, 100)}{field('Country code', country, setCountry, 2)}
          {field('Latitude', latitude, setLatitude)}{field('Longitude', longitude, setLongitude)}{field('Website URL', website, setWebsite, 2048)}{field('Booking URL', booking, setBooking, 2048)}
          <Text style={styles.label}>FORMATS</Text><View style={styles.chipRow}>{['reformer', 'mat'].map(f => <Chip key={f} label={f} active={formats.includes(f)} onPress={() => setFormats(old => old.includes(f) ? old.filter(x => x !== f) : [...old, f])} />)}</View>
          <Text style={styles.label}>PARTNER TYPE</Text><View style={styles.chipRow}>{['partner', 'stockist', 'listed'].map(value => <Chip key={value} label={value} active={partnerType === value} onPress={() => setPartnerType(value)} />)}</View>
        </>}
        {kind === 'instructors' && <>
          <View style={styles.chipRow}><Chip label="Studio-led" active={!independent} onPress={() => setIndependent(false)} /><Chip label="Independent" active={independent} onPress={() => setIndependent(true)} /></View>
          {independent && <><Text style={styles.label}>MOVEACTIVE APPROVAL</Text><View style={styles.chipRow}>{['pending', 'approved', 'rejected'].map(value => <Chip key={value} label={value} active={approval === value} onPress={() => setApproval(value)} />)}</View></>}
          <Text style={styles.finePrint}>{independent ? 'Independent profiles require MoveActive approval before public discovery.' : 'Add a studio affiliation to make a published studio-led instructor discoverable.'}</Text>
        </>}
        <Button label="Save changes" disabled={busy || !name.trim() || !detail.trim() || !imageUrl.trim() || (kind === 'studios' && (!address.trim() || !city.trim() || !country.trim() || !website.trim() || !booking.trim() || !formats.length))} onPress={save} /><Button secondary label="Cancel" disabled={busy} onPress={() => setEditing(undefined)} />
      </View>}
    </>}
    <Button secondary label="Preview consumer app" disabled={busy} onPress={onPreview} />
    <Button secondary label="Log out" disabled={busy} onPress={onLogout} />
  </ScrollView>;
}
