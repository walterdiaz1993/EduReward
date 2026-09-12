import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../config/theme';

export type TabType = 'home' | 'rewards' | 'wheel' | 'profile';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const tabs: { key: TabType; labelKey: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', labelKey: 'tabs.home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'rewards', labelKey: 'tabs.rewards', icon: 'ribbon-outline', activeIcon: 'ribbon' },
    { key: 'wheel', labelKey: 'tabs.wheel', icon: 'aperture-outline', activeIcon: 'aperture' },
    { key: 'profile', labelKey: 'tabs.profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.barContainer,
          {
            backgroundColor: colors.glassBg,
            borderColor: colors.glassBorder,
            shadowColor: isDark ? '#000000' : '#1e40af',
          },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={[
                styles.tabItem,
                isActive && [
                  styles.activeTabItem,
                  { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' },
                ],
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.textSecondary },
                  isActive && styles.activeTabLabel,
                ]}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    alignItems: 'center',
    zIndex: 100,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: theme.roundness.full,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabItem: {
    paddingHorizontal: 16,
  },
  tabLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});

export default BottomTabBar;
