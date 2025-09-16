import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { UserProfile } from '../../types/user';
import { COLORS } from '../../constants/colors';

interface UserInfoCardProps {
  user: UserProfile;
  onClose: () => void;
}

const UserInfoCard = ({ user, onClose }: UserInfoCardProps) => {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.cardCloseButton} onPress={onClose}>
        <Text style={styles.cardCloseButtonText}>X</Text>
      </TouchableOpacity>
      <View style={styles.cardHeader}>
        <Image 
          source={user.photoUrl ? { uri: user.photoUrl } : require("../../assets/default-avatar.png")} 
          style={styles.cardAvatar} 
        />
        <Text style={styles.cardName}>{user.displayName}</Text>
      </View>
      <ScrollView style={styles.cardBody}>
        <Text style={styles.cardSectionTitle}>Habilidades que ensina:</Text>
        {(user.skillsToTeach || []).map((skill, index) => (
          <Text key={`${index}-${skill.skillName}`} style={styles.cardSkill}>- {skill.skillName} (x{skill.multiplier})</Text>
        ))}
        <Text style={styles.cardSectionTitle}>Habilidades que quer aprender:</Text>
        {(user.skillsToLearn || []).map((skill, index) => (
          <Text key={`${index}-${skill}`} style={styles.cardSkill}>- {skill}</Text>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Link href={`/user/${user.uid}`} asChild>
          <TouchableOpacity style={[styles.cardButton, styles.viewProfileButton]}>
            <Text style={styles.cardButtonText}>Ver Perfil</Text>
          </TouchableOpacity>
        </Link>
        <Link href={`/propose/${user.uid}`} asChild>
          <TouchableOpacity style={[styles.cardButton, styles.proposeButton]}>
            <Text style={styles.cardButtonText}>Fazer Proposta</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '45%',
  },
  cardCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.grayLight,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  cardCloseButtonText: { color: COLORS.grayDark, fontWeight: 'bold', fontSize: 16 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  cardName: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  cardBody: { flex: 1, marginBottom: 10 },
  cardSectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.grayDark, marginTop: 10, marginBottom: 5 },
  cardSkill: { fontSize: 14, color: COLORS.grayDark, marginLeft: 10 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardButton: {
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
  },
  viewProfileButton: {
    backgroundColor: COLORS.secondary,
    marginRight: 5,
  },
  proposeButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 5,
  },
  cardButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default UserInfoCard;
