import React from 'react';
import renderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import App from '../../app/(tabs)/index';

// Exercise the real learner layout without booting storage, media or navigation.
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  NavigationIndependentTree: ({ children }: any) => children,
}));
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  }),
}));
jest.mock('../../hooks/useSession', () => ({
  SessionProvider: ({ children }: any) => children,
}));
jest.mock('../Introduction', () => () => null);
jest.mock('../Listening', () => () => null);
jest.mock('../Test', () => () => null);
jest.mock('../TranscriptReview', () => () => null);

it('owns every system inset once around the entire learner navigator', async () => {
  let tree!: renderer.ReactTestRenderer;
  await renderer.act(async () => { tree = renderer.create(<App />); });
  try {
    const containers = tree.root.findAll(node => Object.is(node.type, SafeAreaView));
    expect(containers).toHaveLength(1);
    expect(containers[0].props.edges).toEqual(['top', 'right', 'bottom', 'left']);
    expect(StyleSheet.flatten(containers[0].props.style)).toMatchObject({ flex: 1 });
    expect(containers[0].findAll(node => node.props.initialRouteName === 'Introduction')).toHaveLength(1);
  } finally {
    await renderer.act(async () => tree.unmount());
  }
});
