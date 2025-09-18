import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants";

interface EmptyStateProps {
  message: string;
  subMessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, subMessage }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>{message}</Text>
      {subMessage && (
        <Text style={styles.emptyStateSubText}>{subMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -50, // Adjust to center vertically
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 5,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default EmptyState;