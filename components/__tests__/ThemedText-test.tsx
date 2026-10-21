import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, async () => {
  let tree!: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });
  try {
    expect(tree.toJSON()).toMatchSnapshot();
  } finally {
    await renderer.act(async () => tree.unmount());
  }
});
