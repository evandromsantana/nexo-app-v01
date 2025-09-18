import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
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
          skill.skillName.toLowerCase().includes(s)
        ) ||
        (u.skillsToLearn || []).some((skill) => skill.toLowerCase().includes(s))
    );
  }, [search, users]);

  // Supercluster index
  const clusterIndex = useMemo(() => {
    const points: PointFeature[] = filteredUsers
      .filter((u) => u.location)
      .map((u) => ({
        type: "Feature",
        properties: { user: u },
        geometry: {
          type: "Point",
          coordinates: [u.location!.longitude, u.location!.latitude] as [
            number,
            number
          ],
        },
      }));
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
        onMapPress={() => setSelectedUser(null)}
      />

      <MapSearchInput search={search} setSearch={setSearch} />

      {selectedUser && (
        <UserInfoCard
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
