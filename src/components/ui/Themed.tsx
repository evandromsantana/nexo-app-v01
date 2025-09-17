import { Text as DefaultText, View as DefaultView } from 'react-native';

import { COLORS } from '../../constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export function useThemeColor(props: ThemeProps, colorName: keyof typeof COLORS) {
  const theme = 'light'; // useColorScheme() ?? 'light';
  const colorFromProps = props[theme === 'light' ? 'lightColor' : 'darkColor'];

  if (colorFromProps) {
    return colorFromProps;
  }
  return COLORS[colorName];
}

export type TextProps = ThemeProps & DefaultText['props'];
type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ lightColor, darkColor }, 'grayDark'); // Changed 'text' to 'grayDark'

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ lightColor, darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
