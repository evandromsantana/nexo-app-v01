import { COLORS } from "@/constants";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { UserProfile } from "../../../types/user";

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [loadingImg, setLoadingImg] = useState(true);

  const toggleCard = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.overlay}>
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 350 }}
        style={styles.cardContainer}>
        {/* --- Cabeçalho --- */}
        <View style={styles.header}>
          <View style={{ position: "relative" }}>
            {loadingImg && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                color={COLORS.secondary}
              />
            )}
            <Image
              source={
                user.photoUrl
                  ? { uri: user.photoUrl }
                  : require("../../../assets/default-avatar.png")
              }
              style={styles.cardAvatar}
              onLoadEnd={() => setLoadingImg(false)}
            />
          </View>

          <Pressable
            onPress={toggleCard}
            accessibilityRole="button"
            accessibilityLabel={
              isExpanded
                ? "Recolher informações do usuário"
                : "Expandir informações do usuário"
            }
            style={({ pressed }) => [
              styles.infoContainer,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}>
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
          </Pressable>

          {/* Botões no estado colapsado */}
          {!isExpanded && (
            <View style={styles.collapsedButtonContainer}>
              <Link href={`/user/${user.uid}`} asChild>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Ver perfil do usuário"
                  style={[
                    styles.circularButton,
                    styles.viewProfileButtonCollapsed,
                  ]}>
                  <Feather name="user" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </Link>
              <Link href={`/propose/${user.uid}`} asChild>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Enviar proposta"
                  style={[styles.circularButton, styles.proposeButton]}>
                  <Feather name="send" size={18} color={COLORS.white} />
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

        {/* --- Conteúdo expansível --- */}
        {isExpanded && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 250 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.expandedContent}>
              {user.bio ? (
                <>
                  <Text style={styles.cardSectionTitle}>Sobre</Text>
                  <Text style={styles.cardBio}>{user.bio}</Text>
                </>
              ) : (
                <Text style={styles.emptyState}>
                  Este usuário ainda não adicionou uma bio.
                </Text>
              )}

              {user.skillsToTeach?.length > 0 ? (
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
              ) : (
                <Text style={styles.emptyState}>
                  Nenhuma habilidade cadastrada.
                </Text>
              )}
            </ScrollView>

            {/* --- Botões no estado expandido --- */}
            <View style={styles.expandedButtonContainer}>
              <Link href={`/user/${user.uid}`} asChild>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Ver perfil do usuário"
                  style={[styles.cardButton, styles.viewProfileButtonExpanded]}>
                  <Feather name="user" size={18} color={COLORS.secondary} />
                  <Text style={styles.viewProfileButtonText}>Ver Perfil</Text>
                </TouchableOpacity>
              </Link>
              <Link href={`/propose/${user.uid}`} asChild>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Enviar proposta"
                  activeOpacity={0.85}
                  style={styles.proposeButton}>
                  <View style={styles.iconWrapper}>
                    <Feather name="send" size={18} color={COLORS.white} />
                  </View>
                  <Text style={styles.proposeButtonText}>Enviar Proposta</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </MotiView>
        )}
      </MotiView>
    </View>
  );
};

// --- ESTILOS ---
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
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.grayLight + "50",
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
  expandedContent: {
    maxHeight: 250,
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
  emptyState: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "LeagueSpartan-Regular",
    fontStyle: "italic",
    marginBottom: 16,
  },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4, // Android shadow
    gap: 8,
  },
  iconWrapper: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 6,
    borderRadius: 8,
  },
  proposeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  viewProfileButtonText: {
    color: COLORS.secondary,
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 16,
  },
});

export default UserInfoCard;
