import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import Supercluster from "supercluster";
import { getUsers, updateUserLocation } from "../../api/firestore";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../hooks/useAuth";
import { UserProfile } from "../../types/user";

interface PointFeature {
  type: "Feature";
  properties: { user: UserProfile };
  geometry: { type: "Point"; coordinates: [number, number] };
}

interface ClusterFeature {
  type: "Feature";
  properties: {
    cluster: true;
    cluster_id: number;
    point_count: number;
  };
  geometry: { type: "Point"; coordinates: [number, number] };
}

type ClusterItem = PointFeature | ClusterFeature;

export default function HomeScreen() {
  const { user } = useAuth();
  const [region, setRegion] = useState<Region | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
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
      setLoading(false);
    })();
  }, [user]);

  // Load other users
  useEffect(() => {
    if (!user) return;
    (async () => {
      const allUsers = await getUsers();
      setUsers(allUsers.filter((u) => u.uid !== user.uid));
    })();
  }, [user]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(s) ||
        (u.skillsToTeach || []).some((skill) =>
          skill.toLowerCase().includes(s)
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
    const index = new Supercluster<PointFeature>({
      radius: 60,
      maxZoom: 20,
    });
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

  const renderMarker = useCallback((feature: ClusterItem) => {
    if ("cluster" in feature.properties) {
      // Cluster marker
      return (
        <Marker
          key={`cluster-${feature.properties.cluster_id}`}
          coordinate={{
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          }}>
          <View style={styles.cluster}>
            <Text style={styles.clusterText}>
              {feature.properties.point_count}
            </Text>
          </View>
        </Marker>
      );
    } else {
      // Single user
      const { user } = feature.properties;
      const photo = user.photoUrl ? { uri: user.photoUrl } : undefined;
      const initials = user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      return (
        <Marker
          key={user.uid}
          coordinate={{
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          }}
          title={user.displayName}>
          <View style={styles.avatarMarker}>
            {photo ? (
              <Image source={photo} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>
        </Marker>
      );
    }
  }, []);

  if (loading || !region) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}>
        {clusters.map(renderMarker)}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar usuário ou habilidade..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  map: { ...StyleSheet.absoluteFillObject },
  avatarMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.grayLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { color: COLORS.white, fontWeight: "bold" },
  cluster: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  clusterText: { color: COLORS.white, fontWeight: "bold" },
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
  searchInput: {
    width: "100%",
    fontSize: 16,
  },
});
