import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageProps, ImageStyle, ImageURISource, StyleProp } from 'react-native';

type Props = Omit<ImageProps, 'children'> & { children?: React.ReactNode } & { imageStyle?: StyleProp<ImageStyle> };
// A failed request must not leave an invisible, untappable hole in a card.
export function OrbitImage({ source, style, imageStyle, children, onError, ...props }: Props) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const uri = source && !Array.isArray(source) && typeof source === 'object' ? (source as ImageURISource).uri : undefined;
  const missing = !source || (typeof source === 'object' && !Array.isArray(source) && !uri);
  useEffect(() => { setFailed(false); setAttempt(0); }, [uri]);
  return <View style={[styles.frame, style]}>
    {!missing && !failed && <Image {...props} key={attempt} source={source} style={[StyleSheet.absoluteFill, imageStyle]} onError={event => { setFailed(true); onError?.(event); }} />}
    {(missing || failed) && <Pressable accessibilityRole="button" accessibilityLabel="Retry image" disabled={missing} onPress={() => { setFailed(false); setAttempt(n => n + 1); }} style={styles.fallback}>
      <Text style={styles.icon}>◇</Text><Text style={styles.label}>{missing ? 'Image coming soon' : 'Image unavailable · Tap to retry'}</Text>
    </Pressable>}
    {children}
  </View>;
}
const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: '#eeece7' },
  fallback: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 4 },
  icon: { color: '#8c8986', fontSize: 20 }, label: { color: '#77736f', fontSize: 9, textAlign: 'center' },
});
