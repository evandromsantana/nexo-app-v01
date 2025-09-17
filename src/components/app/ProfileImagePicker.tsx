import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "@/constants";

interface ProfileImagePickerProps {
  imageUri: string | null;
  onPickImage: () => void;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  imageUri,
  onPickImage,
}) => {
  return (
    <TouchableOpacity onPress={onPickImage} style={styles.imagePicker}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.profileImage} />
      ) : (
        <Text style={styles.imagePickerText}>Escolher foto</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.grayLight || "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  imagePickerText: {
    color: COLORS.grayDark || "#757575",
    textAlign: "center",
  },
});

export default ProfileImagePicker;