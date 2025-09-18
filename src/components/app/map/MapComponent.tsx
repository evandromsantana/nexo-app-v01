import React, { useCallback } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import Supercluster from "supercluster";
import { COLORS } from "@/constants";
import { UserProfile } from "../../../types/user"; // Importar UserProfile

// --- TYPE DEFINITIONS ---
export interface PointFeature {
  type: "Feature";
  properties: { user: UserProfile };
  geometry: { type: "Point"; coordinates: [number, number] };
}

export interface ClusterFeature {
  type: "Feature";
  properties: {
    cluster: true;
    cluster_id: number;
    point_count: number;
  };
  geometry: { type: "Point"; coordinates: [number, number] };
}
export type ClusterItem = PointFeature | ClusterFeature;

interface MapComponentProps {
  region: Region | null;
  setRegion: (region: Region) => void;
  clusters: ClusterItem[];
  onMarkerPress: (user: UserProfile) => void;
  onClusterPress: (clusterId: number, pointCount: number, coordinates: [number, number]) => void;
  onMapPress: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  region,
  setRegion,
  clusters,
  onMarkerPress,
  onClusterPress,
  onMapPress,
}) => {
  const renderMarker = useCallback((feature: ClusterItem) => {
    if ("cluster" in feature.properties) {
      return (
        <Marker
          key={`cluster-${feature.properties.cluster_id}`}
          coordinate={{
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          }}
          onPress={(e) => {
            e.stopPropagation();
            onClusterPress(
              feature.properties.cluster_id,
              feature.properties.point_count,
              feature.geometry.coordinates as [number, number]
            );
          }}
        >
          <View style={styles.cluster}>
            <Text style={styles.clusterText}>
              {feature.properties.point_count}
            </Text>
          </View>
        </Marker>
      );
    } else {
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
          onPress={(e) => {
            e.stopPropagation(); // Prevent map press from firing
            onMarkerPress(user);
          }}>
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
  }, [onMarkerPress, onClusterPress]);

  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      region={region || undefined}
      onRegionChangeComplete={setRegion}
      onPress={onMapPress}
    >
      {clusters.map(renderMarker)}
    </MapView>
  );
};

const styles = StyleSheet.create({
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
});

export default MapComponent;