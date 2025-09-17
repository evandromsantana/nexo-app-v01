import { COLORS } from "@/constants";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { UserProfile } from "../../types/user";

// Habilitar LayoutAnimation para Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SkillTag = ({ text }: { text: string }) => (
  <View style={styles.skillTag}>
    <Text style={styles.skillTagText}>{text}</Text>
  </View>
);

interface UserInfoCardProps {
  user: UserProfile;
  onClose: () => void;
}

const UserInfoCard = ({ user }: UserInfoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring); // Mudei para 'spring' para um efeito mais físico
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.cardContainer}>
        {/* Cabeçalho - A área de texto agora é o principal gatilho de expansão */}
        <View style={styles.header}>
          <Image
            source={
              user.photoUrl
                ? { uri: user.photoUrl }
                : require("../../assets/default-avatar.png")
            }
            style={styles.cardAvatar}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleCard}
            style={styles.infoContainer}>
            <Text style={styles.cardName} numberOfLines={1}>
              {user.displayName}
            </Text>
            <View style={styles.expandHint}>
              <Text style={styles.topSkillText} numberOfLines={1}>
                {isExpanded ? "Ver menos" : "Ver mais"}
              </Text>
              <Feather
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={COLORS.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {/* AJUSTE: Botões aparecem na vista compacta */}
          {!isExpanded && (
            <View style={styles.collapsedButtonContainer}>
              <Link href={`/user/${user.uid}`} asChild>
                <TouchableOpacity
                  style={[
                    styles.circularButton,
                    styles.viewProfileButtonCollapsed,
                  ]}>
                  <Feather name="user" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </Link>
              <Link href={`/propose/${user.uid}`} asChild>
                <TouchableOpacity
                  style={[styles.circularButton, styles.proposeButton]}>
                  <Feather name="send" size={18} color={COLORS.white} />
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

        {/* --- Conteúdo Expansível --- */}
        {isExpanded && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.expandedContent}>
              {user.bio && (
                <>
                  <Text style={styles.cardSectionTitle}>Sobre</Text>
                  <Text style={styles.cardBio}>{user.bio}</Text>
                </>
              )}
              {user.skillsToTeach?.length > 0 && (
                <>
                  <Text style={styles.cardSectionTitle}>Ensina</Text>
                  <View style={styles.skillContainer}>
                    {user.skillsToTeach.map((skill, i) => (
                      <SkillTag
                        key={`${i}-teach`}
                        text={`${skill.skillName} (x${skill.multiplier})`}
                      />
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            {/* --- Botões de Ação para o estado expandido --- */}
            <View style={styles.expandedButtonContainer}>
              <Link href={`/user/${user.uid}`} asChild>
                <TouchableOpacity
                  style={[styles.cardButton, styles.viewProfileButtonExpanded]}>
                  <Feather name="user" size={18} color={COLORS.secondary} />
                  <Text style={styles.viewProfileButtonText}>Ver Perfil</Text>
                </TouchableOpacity>
              </Link>
              <Link href={`/propose/${user.uid}`} asChild>
                <TouchableOpacity
                  style={[styles.cardButton, styles.proposeButton]}>
                  <Feather name="send" size={18} color={COLORS.white} />
                  <Text style={styles.proposeButtonText}>Enviar Proposta</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

// --- ESTILOS AJUSTADOS ---
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cardName: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontFamily: "LeagueSpartan-Bold",
  },
  expandHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  topSkillText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "LeagueSpartan-Regular",
  },
  // --- Botões para o estado colapsado ---
  collapsedButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  circularButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  viewProfileButtonCollapsed: {
    backgroundColor: COLORS.grayLight,
  },
  // --- Conteúdo expandido ---
  expandedContent: {
    maxHeight: 250, // Limite de altura para o scroll
    marginTop: 16,
    paddingHorizontal: 4,
  },
  cardSectionTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    fontFamily: "LeagueSpartan-SemiBold",
    marginBottom: 8,
  },
  cardBio: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: "LeagueSpartan-Regular",
    lineHeight: 22,
    marginBottom: 16,
  },
  // ... estilos de SkillTag ...
  skillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: COLORS.secondary + "20",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skillTagText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontFamily: "LeagueSpartan-SemiBold",
  },
  // --- Botões para o estado expandido ---
  expandedButtonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    paddingTop: 12,
  },
  cardButton: {
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  viewProfileButtonExpanded: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.grayLight,
  },
  proposeButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
  },
  proposeButtonText: {
    color: COLORS.white,
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 16,
  },
  viewProfileButtonText: {
    color: COLORS.secondary,
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 16,
  },
});

export default UserInfoCard;
