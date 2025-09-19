import { Ionicons } from "@expo/vector-icons"; // 👥 Ícones
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

import { COLORS } from "@/constants";
import { retroMapStyle } from "@/constants/MapStyles";
import { UserProfile } from "../../../types/user";

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
  onClusterPress: (
    clusterId: number,
    pointCount: number,
    coordinates: [number, number]
  ) => void;
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
  const scale = useRef(new Animated.Value(0)).current; // começa invisível

  // 🔥 Animação de pulso + entrada com bounce
  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const getClusterStyle = (count: number) => {
    if (count < 10) return styles.clusterSmall;
    if (count < 50) return styles.clusterMedium;
    return styles.clusterLarge;
  };

  const renderMarker = useCallback(
    (feature: ClusterItem) => {
      if ("cluster" in feature.properties) {
        const clusterProps = feature.properties as ClusterFeature["properties"];
        return (
          <Marker
            key={`cluster-${clusterProps.cluster_id}`}
            coordinate={{
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0],
            }}
            onPress={(e) => {
              e.stopPropagation();
              onClusterPress(
                clusterProps.cluster_id,
                clusterProps.point_count,
                feature.geometry.coordinates as [number, number]
              );
            }}>
            <Animated.View
              style={[
                styles.clusterBase,
                getClusterStyle(clusterProps.point_count),
                { transform: [{ scale }] },
              ]}>
              <Ionicons
                name="people"
                size={18}
                color={COLORS.white}
                style={{ marginBottom: 2 }}
              />
              <Text style={styles.clusterText}>{clusterProps.point_count}</Text>
            </Animated.View>
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
              e.stopPropagation();
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
    },
    [onMarkerPress, onClusterPress]
  );

  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      region={region || undefined}
      onRegionChangeComplete={setRegion}
      onPress={onMapPress}
      customMapStyle={retroMapStyle}>
      {clusters.map(renderMarker)}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },

  // --- Avatar marker ---
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

  // --- Cluster estilo Waze ---
  clusterBase: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    padding: 4,
  },
  clusterSmall: {
    width: 48,
    height: 48,
    backgroundColor: "#4CAF50", // Verde (poucos usuários)
  },
  clusterMedium: {
    width: 58,
    height: 58,
    backgroundColor: "#FF9800", // Laranja (médio)
  },
  clusterLarge: {
    width: 70,
    height: 70,
    backgroundColor: "#F44336", // Vermelho (muitos)
  },
  clusterText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 15,
    marginTop: -2,
  },
});

export default MapComponent;
