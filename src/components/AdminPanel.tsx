import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import type { Affiliation, Instructor, Studio } from '../api/types';
import { artwork } from '../data/artwork';
import { Button, Chip, Heading, styles } from './OrbitUI';

type Kind = 'studios' | 'instructors' | 'affiliations';
type Props = { task: (work: () => Promise<void>) => void; busy: boolean; onChanged: () => Promise<void> };
export function AdminPanel({ task, busy, onChanged }: Props) {
  useEffect(() => () => api.clearAdminToken(), []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [kind, setKind] = useState<Kind>('studios');
  const [studios, setStudios] = useState<Studio[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [editing, setEditing] = useState<Studio | Instructor | null | undefined>();
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Melbourne');
  const [latitude, setLatitude] = useState('-37.84');
  const [longitude, setLongitude] = useState('144.98');
  const [website, setWebsite] = useState('https://example.com/studio');
  const [studioId, setStudioId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [formats, setFormats] = useState(['reformer', 'mat']);
  async function load() {
    const [s, i, a] = await Promise.all([api.adminList<Studio>('studios'), api.adminList<Instructor>('instructors'), api.adminList<Affiliation>('affiliations')]);
    setStudios(s.data); setInstructors(i.data); setAffiliations(a.data);
  }
  const unlock = () => task(async () => {
    try { await api.adminLogin(username.trim(), password); await load(); setAuthorized(true); setPassword(''); }
    catch (error) { api.clearAdminToken(); throw error; }
  });
  const edit = (record: Studio | Instructor | null) => {
    setEditing(record); setName(record?.name ?? ''); setDetail(record ? ('bio' in record ? record.bio : record.description) : '');
    if (record && 'address' in record) {
      setAddress(record.address); setCity(record.city); setLatitude(String(record.latitude)); setLongitude(String(record.longitude)); setWebsite(record.websiteUrl); setFormats(record.formats);
    } else { setAddress(''); setCity('Melbourne'); setLatitude('-37.84'); setLongitude('144.98'); setWebsite('https://example.com/studio'); setFormats(['reformer', 'mat']); }
  };
  const save = () => task(async () => {
    if (kind === 'studios') {
      await api.adminSave(kind, editing ? { name, description: detail, address, city, latitude: Number(latitude), longitude: Number(longitude), websiteUrl: website, formats } : {
        name, description: detail, address, city, latitude: Number(latitude), longitude: Number(longitude), websiteUrl: website, bookingUrl: website,
        country: 'AU', formats, partnerType: 'partner', published: true, imageUrl: 'https://placehold.co/800x600?text=Studio',
      }, editing?.id);
    } else if (kind === 'instructors') {
      await api.adminSave(kind, editing ? { name, bio: detail } : { name, bio: detail, imageUrl: 'https://placehold.co/600x600?text=Instructor', independent: false, approvalStatus: 'approved', published: true }, editing?.id);
    }
    await load(); await onChanged(); setEditing(undefined);
  });
  const field = (label: string, value: string, update: (s: string) => void) => <View key={label}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={update} style={styles.formInput} autoCapitalize="none" /></View>;
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>MOVEACTIVE · INTERNAL</Text><Heading title="Partner admin" subtitle="Manage studio records, instructors and studio-led affiliations." />
    {!authorized ? <View style={styles.infoBox}>
      <Text style={styles.bodyCopy}>Log in to manage studio and instructor records.</Text>
      <TextInput accessibilityLabel="Admin username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} placeholder="Username" style={styles.formInput} />
      <TextInput accessibilityLabel="Admin password" secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} placeholder="Password" style={styles.formInput} />
      <Button label="Log in" disabled={busy || !username.trim() || !password} onPress={unlock} />
    </View> : <>
      <View style={styles.chipRow}>{(['studios', 'instructors', 'affiliations'] as Kind[]).map(k => <Chip key={k} label={`${k} · ${k === 'studios' ? studios.length : k === 'instructors' ? instructors.length : affiliations.length}`} active={kind === k} onPress={() => { setKind(k); setEditing(undefined); }} />)}</View>
      {kind === 'affiliations' ? <>
        {affiliations.map(a => <View key={a.id} style={styles.infoBox}><Text style={styles.cardTitle}>{instructors.find(i => i.id === a.instructorId)?.name ?? a.instructorId} → {studios.find(s => s.id === a.studioId)?.name ?? a.studioId}</Text><Button small secondary label="Remove affiliation" disabled={busy} onPress={() => task(async () => { await api.adminRemoveAffiliation(a.studioId, a.instructorId); await load(); await onChanged(); })} /></View>)}
        <Text style={styles.sectionTitle}>Link an instructor to a studio</Text>
        <Text style={styles.label}>STUDIO</Text><View style={styles.chipRow}>{studios.map(s => <Chip key={s.id} label={s.name} active={studioId === s.id} onPress={() => setStudioId(s.id)} />)}</View>
        <Text style={styles.label}>INSTRUCTOR</Text><View style={styles.chipRow}>{instructors.map(i => <Chip key={i.id} label={i.name} active={instructorId === i.id} onPress={() => setInstructorId(i.id)} />)}</View>
        <Button label="Save affiliation" disabled={busy || !studioId || !instructorId} onPress={() => task(async () => { await api.adminAffiliation(studioId, instructorId); await load(); await onChanged(); })} />
      </> : <>
        <Button label={`Add ${kind === 'studios' ? 'studio' : 'instructor'}`} secondary disabled={busy} onPress={() => edit(null)} />
        {editing === undefined ? (kind === 'studios' ? studios : instructors).map(record => <View key={record.id} style={styles.infoBox}><Image source={artwork(record)} style={styles.adminThumb} /><Text style={styles.cardTitle}>{record.name}</Text><Text style={styles.meta}>{record.published ? 'Published' : 'Archived / draft'}</Text><Button small label="Edit record" onPress={() => edit(record)} /></View>) : <View style={styles.adminForm}>
          {field('Name', name, setName)}{field(kind === 'studios' ? 'Description' : 'Bio', detail, setDetail)}
          {kind === 'studios' && <>{field('Address', address, setAddress)}{field('City', city, setCity)}{field('Latitude', latitude, setLatitude)}{field('Longitude', longitude, setLongitude)}{field('Website URL', website, setWebsite)}<View style={styles.chipRow}>{['reformer', 'mat'].map(f => <Chip key={f} label={f} active={formats.includes(f)} onPress={() => setFormats(old => old.includes(f) ? old.filter(x => x !== f) : [...old, f])} />)}</View></>}
          {kind === 'instructors' && <Text style={styles.finePrint}>New instructors are studio-led. Add an affiliation to make their published profile discoverable.</Text>}
          <Button label="Save changes" disabled={busy || !name.trim() || !detail.trim()} onPress={save} /><Button secondary label="Cancel" disabled={busy} onPress={() => setEditing(undefined)} />
        </View>}
      </>}
      <Button secondary label="Log out" disabled={busy} onPress={() => task(async () => { await api.adminLogout(); setAuthorized(false); setUsername(''); setPassword(''); setEditing(undefined); })} />
    </>}
  </ScrollView>;
}
