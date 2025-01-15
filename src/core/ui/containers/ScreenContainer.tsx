import React, { FC, ReactNode } from 'react';
import {
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const ScreenContainer: FC<Props> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  ...rest
}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <View
      testID="screen-container"
      style={[styles.container, style, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}
      {...rest}
    >
      {children}
      <StatusBar style="auto" />
    </View>
  );

  return content;
};

export default ScreenContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1C1E22',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});