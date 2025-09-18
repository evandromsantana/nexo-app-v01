import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "@/constants";
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
      <View style={styles.handleBar} />
      <Text style={styles.bottomSheetTitle}>
        👥 Usuários próximos ({selectedCluster.pointCount})
      </Text>

      <ScrollView style={styles.userList}>
        {clusterUsers.map((u) => (
          <View key={u.uid} style={styles.userCard}>
            <Text style={styles.userName}>{u.displayName}</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => onSelectUser(u)}>
              <Text style={styles.profileButtonText}>Ver Perfil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

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
    backgroundColor: COLORS.card,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    maxHeight: "55%",
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gray,
    alignSelf: "center",
    marginBottom: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: COLORS.textPrimary,
  },
  userList: {
    marginBottom: 15,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textSecondary,
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
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
  },
  closeButtonText: {
    textAlign: "center",
    color: COLORS.black,
    fontWeight: "500",
  },
});

export default ClusterBottomSheet;