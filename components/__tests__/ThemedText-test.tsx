import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

describe('ThemedText integration', () => {
  it('renders with default type style', () => {
    let tree!: renderer.ReactTestRenderer;
    expect(() => {
      tree = renderer.create(<ThemedText>Default</ThemedText>);
    }).not.toThrow();
    const json = tree.toJSON();
    expect(json).toMatchSnapshot();
    expect(json.props.style).toBeDefined();
    // Default type should have fontSize 16, lineHeight 24
    expect(json.props.style.fontSize).toBe(16);
    expect(json.props.style.lineHeight).toBe(24);
  });

  it('renders with title type', () => {
    let tree!: renderer.ReactTestRenderer;
    expect(() => {
      tree = renderer.create(<ThemedText type="title">Title Text</ThemedText>);
    }).not.toThrow();
    const json = tree.toJSON();
    expect(json.props.style.fontSize).toBe(32);
    expect(json.props.style.fontWeight).toBe('bold');
    expect(json.props.style.lineHeight).toBe(32);
  });

  it('renders with subtitle type', () => {
    let tree!: renderer.ReactTestRenderer;
    expect(() => {
      tree = renderer.create(<ThemedText type="subtitle">Subtitle</ThemedText>);
    }).not.toThrow();
    const json = tree.toJSON();
    expect(json.props.style.fontSize).toBe(20);
    expect(json.props.style.fontWeight).toBe('bold');
  });

  it('renders with link type and correct color', () => {
    let tree!: renderer.ReactTestRenderer;
    expect(() => {
      tree = renderer.create(<ThemedText type="link">Link</ThemedText>);
    }).not.toThrow();
    const json = tree.toJSON();
    expect(json.props.style.color).toBe('#0a7ea4');
    expect(json.props.style.lineHeight).toBe(30);
    expect(json.props.style.fontSize).toBe(16);
  });

  it('renders with custom lightColor/darkColor props', () => {
    // When lightColor is provided, it should be used in light mode
    // The hook prioritizes props[theme] over Colors[theme][colorName]
    let tree!: renderer.ReactTestRenderer;
    expect(() => {
      tree = renderer.create(
        <ThemedText lightColor="#ff0000" darkColor="#00ff00">Custom Colors</ThemedText>
      );
    }).not.toThrow();
    const json = tree.toJSON();
    // In light mode (default), lightColor should be applied
    expect(json.props.style.color).toBe('#ff0000');
  });
});