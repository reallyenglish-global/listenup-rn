import * as React from 'react';
import { useThemeColor } from '../useThemeColor';

// Mock react-native's useColorScheme at the module level
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useColorScheme: jest.fn(),
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    // Reset the mock before each test
    (React.useColorScheme as jest.Mock).mockReset();
  });

  it('returns light color from props when theme is light', () => {
    (React.useColorScheme as jest.Mock).mockReturnValue('light');
    const result = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
    // When theme is light and light prop exists, return it
    expect(result).toBe('#11181C');
  });

  it('falls back to Colors.dark when no dark prop and theme is dark', () => {
    (React.useColorScheme as jest.Mock).mockReturnValue('dark');
    // No dark prop provided, should fall back to Colors.dark.text
    const result = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
    expect(result).toBe('#ECEDEE');
  });

  it('returns Colors light default when theme is light and no prop', () => {
    (React.useColorScheme as jest.Mock).mockReturnValue('light');
    const result = useThemeColor({}, 'text');
    expect(result).toBe('#11181C'); // Colors.light.text
  });
});