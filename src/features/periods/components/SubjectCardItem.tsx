import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { SubjectRow } from '../../../database/dbService';
import { getGradingSystemLabel } from '../constants/periods.constants';
import { createStyles } from '../styles/PeriodsSubjectsScreen.styles';

interface SubjectCardItemProps {
  subject: SubjectRow;
  rulesCount: number;
  onOpenRewardsModal: (subject: SubjectRow) => void;
  onDeleteSubject: (id: string, name: string) => void;
}

export const SubjectCardItem: React.FC<SubjectCardItemProps> = ({
  subject,
  rulesCount,
  onOpenRewardsModal,
  onDeleteSubject,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const sysLabel = getGradingSystemLabel(subject.grading_system, t);

  return (
    <View style={styles.subjectCard}>
      <View style={styles.subjectCardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.iconBox}>
            <Ionicons name="book" size={20} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.subjectCardTitle}>{subject.name}</Text>
            <View style={styles.subjectBadgeRow}>
              <View style={[styles.miniBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.miniBadgeText, { color: colors.primary }]}>{sysLabel}</Text>
              </View>
              <View style={[styles.miniBadge, { backgroundColor: colors.secondary + '15' }]}>
                <Text style={[styles.miniBadgeText, { color: colors.secondary }]}>
                  {t('periods.rulesBadge', { count: rulesCount })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => onDeleteSubject(subject.id, subject.name)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => onOpenRewardsModal(subject)}
        style={styles.manageRewardsBtn}
      >
        <Ionicons name="gift-outline" size={16} color={colors.white} />
        <Text style={styles.manageRewardsBtnText}>{t('periods.manageRewardsBtn')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubjectCardItem;
