import { useMemo } from "react";
import Supercluster from "supercluster";
import { Region } from "react-native-maps";
import { UserProfile } from "../types/user";
import { ClusterItem, PointFeature } from "../components/app/map/MapComponent";

interface UseMapClusteringResult {
  clusters: ClusterItem[];
  clusterIndex: Supercluster;
}

export const useMapClustering = (filteredUsers: UserProfile[], region: Region | null): UseMapClusteringResult => {
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

  return { clusters, clusterIndex };
};