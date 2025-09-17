import React from "react";
import { View, TextInput, StyleSheet, Dimensions } from "react-native";
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
      <TextInput
        placeholder="Buscar usuário ou habilidade..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
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
  },
  searchInput: { width: "100%", fontSize: 16 },
});

export default MapSearchInput;