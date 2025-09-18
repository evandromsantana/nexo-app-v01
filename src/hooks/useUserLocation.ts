import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Region } from "react-native-maps";
import { User } from "firebase/auth";
import { updateUserLocation } from "../api/firestore";

interface UseUserLocationResult {
  locationLoading: boolean;
}

export const useUserLocation = (user: User | null, setRegion: React.Dispatch<React.SetStateAction<Region | null>>): UseUserLocationResult => {
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
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
    };

    getLocation();
  }, [user, setRegion]); // Added setRegion to dependency array

  return { locationLoading };
};