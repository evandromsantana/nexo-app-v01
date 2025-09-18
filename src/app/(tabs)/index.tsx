import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Region } from "react-native-maps";
import Supercluster from "supercluster";

import { COLORS } from "@/constants";
import { getUsers, updateUserLocation } from "../../api/firestore";
import MapComponent, {
  ClusterItem,
  PointFeature,
} from "../../components/app/map/MapComponent";
import MapLoadingState from "../../components/app/map/MapLoadingState";
import MapSearchInput from "../../components/app/map/MapSearchInput";
import UserInfoCard from "../../components/app/map/UserInfoCard";
import { useAuth } from "../../hooks/useAuth";
import { UserProfile } from "../../types/user";

// --- HOME SCREEN COMPONENT ---
export default function HomeScreen() {
  const { user } = useAuth();
  const [region, setRegion] = useState<Region | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<{
    clusterId: number;
    pointCount: number;
    coordinates: [number, number];
  } | null>(null);
  const [clusterUsers, setClusterUsers] = useState<UserProfile[]>([]);

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
      if (user) await updateUserLocation(user.uid, loc.coords);
      setLocationLoading(false);
    })();
  }, [user]);

  // Load other users with React Query
  const { data: users = [], isLoading: isUsersLoading } = useQuery<
    UserProfile[],
    Error,
    UserProfile[]
  >({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !!user,
    select: (allUsers) => allUsers.filter((u) => u.uid !== user?.uid),
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(s) ||
        (u.skillsToTeach || []).some(
          (skill) =>
            skill.skillName && skill.skillName.toLowerCase().includes(s)
        ) ||
        (u.skillsToLearn || []).some((skill) => skill.toLowerCase().includes(s))
    );
  }, [search, users]);

  // Supercluster index
  const clusterIndex = useMemo(() => {
    const points: PointFeature[] = [];
    const locationsMap = new Map<string, UserProfile[]>();

    filteredUsers.forEach((u) => {
      if (u.location) {
        const key = `${u.location.latitude},${u.location.longitude}`;
        if (!locationsMap.has(key)) {
          locationsMap.set(key, []);
        }
        locationsMap.get(key)?.push(u);
      }
    });

    locationsMap.forEach((usersAtLocation) => {
      if (usersAtLocation.length === 1) {
        const u = usersAtLocation[0];
        points.push({
          type: "Feature",
          properties: { user: u },
          geometry: {
            type: "Point",
            coordinates: [u.location!.longitude, u.location!.latitude] as [
              number,
              number
            ],
          },
        });
      } else {
        usersAtLocation.forEach((u, index) => {
          const jitter = 0.00005 * (index + 1);
          const sign = index % 2 === 0 ? 1 : -1;
          points.push({
            type: "Feature",
            properties: { user: u },
            geometry: {
              type: "Point",
              coordinates: [
                u.location!.longitude + sign * jitter,
                u.location!.latitude + sign * jitter,
              ] as [number, number],
            },
          });
        });
      }
    });

    const index = new Supercluster({ radius: 60, maxZoom: 20 });
    index.load(points);
    return index;
  }, [filteredUsers]);

  // Get clusters
  const clusters = useMemo<ClusterItem[]>(() => {
    if (!region) return [];
    const bounds: [number, number, number, number] = [
      region.longitude - region.longitudeDelta,
      region.latitude - region.latitudeDelta,
      region.longitude + region.longitudeDelta,
      region.latitude + region.latitudeDelta,
    ];
    return clusterIndex.getClusters(
      bounds,
      Math.round(Math.log2(360 / region.longitudeDelta))
    ) as ClusterItem[];
  }, [clusterIndex, region]);

  const handleClusterPress = (
    clusterId: number,
    pointCount: number,
    coordinates: [number, number]
  ) => {
    const leaves = (clusterIndex as any).getLeaves(clusterId, pointCount);
    const usersInCluster = leaves.map(
      (leaf: PointFeature) => (leaf.properties as { user: UserProfile }).user
    );
    setSelectedCluster({ clusterId, pointCount, coordinates });
    setClusterUsers(usersInCluster);
    setRegion((prev) =>
      prev
        ? {
            ...prev,
            latitude: coordinates[1],
            longitude: coordinates[0],
            latitudeDelta: prev.latitudeDelta / 2,
            longitudeDelta: prev.longitudeDelta / 2,
          }
        : null
    );
  };

  const handleMapPress = () => {
    setSelectedUser(null);
    setSelectedCluster(null);
    setClusterUsers([]);
  };

  if (locationLoading || isUsersLoading || !region) {
    return <MapLoadingState />;
  }

  return (
    <View style={styles.container}>
      <MapComponent
        region={region}
        setRegion={setRegion}
        clusters={clusters}
        onMarkerPress={setSelectedUser}
        onClusterPress={handleClusterPress}
        onMapPress={handleMapPress}
      />

      <MapSearchInput search={search} setSearch={setSearch} />

      {selectedUser && (
        <UserInfoCard user={selectedUser} onClose={handleMapPress} />
      )}

      {selectedCluster && clusterUsers.length > 0 && (
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
                  onPress={() => {
                    setSelectedUser(u);
                    setSelectedCluster(null);
                    setClusterUsers([]);
                  }}>
                  <Text style={styles.profileButtonText}>Ver Perfil</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={handleMapPress}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!locationLoading && !isUsersLoading && !region && users.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Não foi possível carregar o mapa ou encontrar usuários.</Text>
          <Text style={styles.emptyStateSubText}>Verifique sua conexão ou permissões de localização.</Text>
        </View>
      )}

      {!locationLoading && !isUsersLoading && region && users.length === 0 && !search && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Nenhum usuário encontrado na sua área.</Text>
          <Text style={styles.emptyStateSubText}>Tente ajustar a busca ou o zoom.</Text>
        </View>
      )}

      {!locationLoading && !isUsersLoading && region && filteredUsers.length === 0 && search && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Nenhum usuário corresponde à sua busca.</Text>
          <Text style={styles.emptyStateSubText}>Tente outros termos de busca.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

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
