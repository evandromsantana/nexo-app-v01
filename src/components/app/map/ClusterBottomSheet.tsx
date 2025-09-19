import { COLORS } from "@/constants";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UserProfile } from "../../../types/user";

interface ClusterBottomSheetProps {
  selectedCluster: {
    clusterId: number;
    pointCount: number;
    coordinates: [number, number];
  };
  clusterUsers: UserProfile[];
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
}

const ClusterBottomSheet: React.FC<ClusterBottomSheetProps> = ({
  selectedCluster,
  clusterUsers,
  onClose,
  onSelectUser,
}) => {
  return (
    <View style={styles.bottomSheet}>
      {/* Handle */}
      <View style={styles.handleBar} />

      {/* Título */}
      <Text style={styles.bottomSheetTitle}>
        👥 {selectedCluster.pointCount} usuários próximos
      </Text>

      {/* Lista de usuários */}
      <ScrollView style={styles.userList}>
        {clusterUsers.map((u) => (
          <View key={u.uid} style={styles.userCard}>
            {/* Avatar */}
            {u.photoUrl ? (
              <Image source={{ uri: u.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {u.displayName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Nome */}
            <Text style={styles.userName}>{u.displayName}</Text>

            {/* Botão */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => onSelectUser(u)}>
              <Text style={styles.profileButtonText}>Ver Perfil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Fechar */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Fechar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background || COLORS.card,
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    maxHeight: "55%",
    marginHorizontal: 10,
  },
  handleBar: {
    width: 45,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gray,
    alignSelf: "center",
    marginBottom: 12,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
    textAlign: "center",
    color: COLORS.textPrimary,
  },
  userList: {
    marginBottom: 15,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  profileButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  profileButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: COLORS.grayLight,
    borderRadius: 14,
  },
  closeButtonText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
});

export default ClusterBottomSheet;
