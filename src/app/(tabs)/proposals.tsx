import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function ProposalsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <Text>Propostas</Text>
    </View>
  );
}
