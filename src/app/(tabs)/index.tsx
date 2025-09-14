import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { updateUserLocation, getUsers } from '../../api/firestore';
import { UserProfile } from '../../types/user';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [otherUsers, setOtherUsers] = useState<UserProfile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for getting user's location and updating it in Firestore
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setIsLoading(false);

      if (user) {
        try {
          await updateUserLocation(user.uid, currentLocation.coords);
        } catch (error) {
          console.error("Failed to update user location:", error);
        }
      }
    })();
  }, [user]);

  // Effect for fetching other users
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const allUsers = await getUsers();
        const filteredUsers = allUsers.filter(u => u.uid !== user.uid);
        setOtherUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [user]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Current User Marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            pinColor={COLORS.accent}
          />

          {/* Other Users Markers */}
          {otherUsers.map((otherUser) => (
            otherUser.location && (
              <Marker
                key={otherUser.uid}
                coordinate={{
                  latitude: otherUser.location.latitude,
                  longitude: otherUser.location.longitude,
                }}
                title={otherUser.displayName}
                pinColor={COLORS.primary}
                onPress={() => router.push(`/user/${otherUser.uid}`)}
              />
            )
          ))}
        </MapView>
      ) : (
        <View style={styles.centered}>
          <Text>Location not found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
