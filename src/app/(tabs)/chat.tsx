import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function ChatScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <Text>Chat</Text>
    </View>
  );
}
