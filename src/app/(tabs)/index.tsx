import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Region } from "react-native-maps";
import Supercluster from "supercluster";

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
  const [selectedCluster, setSelectedCluster] = useState<{ clusterId: number; pointCount: number; coordinates: [number, number] } | null>(null);
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
  const { data: users = [], isLoading: isUsersLoading } = useQuery<UserProfile[], Error, UserProfile[]>({ 
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
        (u.skillsToTeach || []).some((skill) =>
          skill.skillName && skill.skillName.toLowerCase().includes(s)
        ) ||
        (u.skillsToLearn || []).some((skill) => skill.toLowerCase().includes(s))
    );
  }, [search, users]);

  // Supercluster index
  const clusterIndex = useMemo(() => {
    const points: PointFeature[] = [];
    const locationsMap = new Map<string, UserProfile[]>();

    // Group users by exact location
    filteredUsers.forEach(u => {
      if (u.location) {
        const key = `${u.location.latitude},${u.location.longitude}`;
        if (!locationsMap.has(key)) {
          locationsMap.set(key, []);
        }
        locationsMap.get(key)?.push(u);
      }
    });

    // Apply jitter to duplicate locations and create PointFeatures
    locationsMap.forEach(usersAtLocation => {
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
        // Apply jitter for multiple users at the same exact location
        usersAtLocation.forEach((u, index) => {
          const jitter = 0.00005 * (index + 1); // Small, unique offset
          const sign = index % 2 === 0 ? 1 : -1; // Alternate direction
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

  const handleClusterPress = (clusterId: number, pointCount: number, coordinates: [number, number]) => {
    const leaves = (clusterIndex as any).getLeaves(clusterId, pointCount);
    const usersInCluster = leaves.map((leaf: PointFeature) => (leaf.properties as { user: UserProfile }).user);
    setSelectedCluster({ clusterId, pointCount, coordinates });
    setClusterUsers(usersInCluster);
    // Optionally zoom to the cluster location
    setRegion(prev => prev ? { ...prev, latitude: coordinates[1], longitude: coordinates[0], latitudeDelta: prev.latitudeDelta / 2, longitudeDelta: prev.longitudeDelta / 2 } : null);
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
        <UserInfoCard
          user={selectedUser}
          onClose={handleMapPress}
        />
      )}

      {selectedCluster && clusterUsers.length > 0 && (
        <View style={styles.bottomSheetPlaceholder}>
          <Text style={styles.bottomSheetTitle}>Usuários no Cluster ({selectedCluster.pointCount})</Text>
          {clusterUsers.map(u => (
            <View key={u.uid} style={styles.bottomSheetItem}>
              <Text>{u.displayName}</Text>
              <TouchableOpacity onPress={() => {
                setSelectedUser(u);
                setSelectedCluster(null);
                setClusterUsers([]);
              }}>
                <Text>Ver Perfil</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleMapPress}>
            <Text style={styles.closeButton}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomSheetPlaceholder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
  },
});
