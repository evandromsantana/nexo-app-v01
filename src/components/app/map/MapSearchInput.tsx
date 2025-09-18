import React from "react";
import { View, TextInput, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons"; // Import Feather icon
import { COLORS } from "@/constants";

interface MapSearchInputProps {
  search: string;
  setSearch: (text: string) => void;
}

const { width } = Dimensions.get("window");

const MapSearchInput: React.FC<MapSearchInputProps> = ({
  search,
  setSearch,
}) => {
  return (
    <View style={styles.searchContainer}>
      <Feather name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
      <TextInput
        placeholder="Buscar usuário ou habilidade..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
      {search.length > 0 && (
        <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
          <Feather name="x-circle" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    width: width * 0.9,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: "row", // Added for icon and clear button
    alignItems: "center", // Added for icon and clear button
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1, // Take remaining space
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
  },
});

export default MapSearchInput;