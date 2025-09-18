import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Region } from "react-native-maps";

import { COLORS } from "@/constants";
import { getUsers } from "../../api/firestore";
import ClusterBottomSheet from "../../components/app/map/ClusterBottomSheet";
import MapComponent, {
  PointFeature,
} from "../../components/app/map/MapComponent";
import MapLoadingState from "../../components/app/map/MapLoadingState";
import MapSearchInput from "../../components/app/map/MapSearchInput";
import UserInfoCard from "../../components/app/map/UserInfoCard";
import EmptyState from "../../components/ui/EmptyState"; // Added EmptyState
import { useAuth } from "../../hooks/useAuth";
import { useMapClustering } from "../../hooks/useMapClustering";
import { useUserLocation } from "../../hooks/useUserLocation"; // Added useUserLocation
import { UserProfile } from "../../types/user";

// --- HOME SCREEN COMPONENT ---
export default function HomeScreen() {
  const { user } = useAuth();
  const [region, setRegion] = useState<Region | null>(null); // Re-introduced region state
  const { locationLoading } = useUserLocation(user, setRegion); // Pass setRegion to hook
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<{
    clusterId: number;
    pointCount: number;
    coordinates: [number, number];
  } | null>(null);
  const [clusterUsers, setClusterUsers] = useState<UserProfile[]>([]);

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

  const { clusters, clusterIndex } = useMapClustering(filteredUsers, region);

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
        <ClusterBottomSheet
          selectedCluster={selectedCluster}
          clusterUsers={clusterUsers}
          onClose={handleMapPress}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setSelectedCluster(null);
            setClusterUsers([]);
          }}
        />
      )}

      {!locationLoading && !isUsersLoading && !region && users.length === 0 && (
        <EmptyState
          message="Não foi possível carregar o mapa ou encontrar usuários."
          subMessage="Verifique sua conexão ou permissões de localização."
        />
      )}

      {!locationLoading &&
        !isUsersLoading &&
        region &&
        users.length === 0 &&
        !search && (
          <EmptyState
            message="Nenhum usuário encontrado na sua área."
            subMessage="Tente ajustar a busca ou o zoom."
          />
        )}

      {!locationLoading &&
        !isUsersLoading &&
        region &&
        filteredUsers.length === 0 &&
        search && (
          <EmptyState
            message="Nenhum usuário corresponde à sua busca."
            subMessage="Tente outros termos de busca."
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});
