import { OrbitImage } from './OrbitImage';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Studio, Workout } from '../api/types';
import { artwork } from '../data/artwork';
import { styles } from './OrbitUI';

export function StudioCard({ studio, onPress }: { studio: Studio; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.studioCard}>
    <OrbitImage source={artwork(studio)} style={styles.studioThumb} />
    <View style={styles.flex1}>
      <Text style={styles.cardTitle}>{studio.name}{studio.partnerType === 'partner' ? ' ✓' : ''}</Text>
      <Text style={styles.meta}>{studio.address}{studio.distanceKm !== undefined ? ` · ${studio.distanceKm} km` : ''}</Text>
      <Text style={styles.inlineLink}>Open profile ›</Text>
    </View><Text style={styles.chevron}>›</Text>
  </Pressable>;
}
export function WorkoutCard({ workout, onPress }: { workout: Workout; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.workoutCard}>
    <View><OrbitImage source={artwork(workout)} style={styles.workoutPhoto} /><View style={styles.play}><Text style={styles.playIcon}>▶</Text></View><View style={styles.duration}><Text style={styles.durationText}>{workout.durationMinutes} min</Text></View></View>
    <View style={styles.workoutText}><Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.meta}>{workout.instructors?.map(i => i.name).join(', ') || workout.format} · {workout.level}</Text></View>
  </Pressable>;
}
