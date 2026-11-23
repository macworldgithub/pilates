import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image } from 'react-native';
import { OrbitImage } from '../src/components/OrbitImage';

test('failed images can retry and a different record clears the error', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<OrbitImage source={{ uri: 'https://example.com/one.jpg' }} />); });
  await act(async () => tree.root.findByType(Image).props.onError({ nativeEvent: { error: 'Offline' } }));
  expect(JSON.stringify(tree.toJSON())).toContain('Image unavailable');
  await act(async () => tree.root.findAll(n => n.props.accessibilityLabel === 'Retry image' && typeof n.props.onPress === 'function')[0].props.onPress());
  expect(tree.root.findAllByType(Image)).toHaveLength(1);
  await act(async () => tree.root.findByType(Image).props.onError({ nativeEvent: { error: 'Offline' } }));
  await act(async () => tree.update(<OrbitImage source={{ uri: 'https://example.com/two.jpg' }} />));
  expect(tree.root.findByType(Image).props.source.uri).toBe('https://example.com/two.jpg');
  await act(async () => tree.unmount());
});
