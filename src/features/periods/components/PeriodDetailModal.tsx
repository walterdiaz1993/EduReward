import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { PeriodRow, SubjectRow, RewardRuleRow, GradingSystem } from '../../../database/dbService';
import { getPeriodTypeLabel, GRADING_SYSTEMS } from '../constants/periods.constants';
import SubjectCardItem from './SubjectCardItem';
import { createStyles } from '../styles/PeriodsSubjectsScreen.styles';

interface PeriodDetailModalProps {
  selectedPeriod: PeriodRow | null;
  periodSubjects: SubjectRow[];
  subjectRulesMap: Record<string, RewardRuleRow[]>;
  newSubjectName: string;
  setNewSubjectName: (val: string) => void;
  newGradingSystem: GradingSystem;
  setNewGradingSystem: (sys: GradingSystem) => void;
  onClose: () => void;
  onCreateSubject: () => void;
  onDeleteSubject: (id: string, name: string) => void;
  onOpenRewardsModal: (subject: SubjectRow) => void;
}

export const PeriodDetailModal: React.FC<PeriodDetailModalProps> = ({
  selectedPeriod,
  periodSubjects,
  subjectRulesMap,
  newSubjectName,
  setNewSubjectName,
  newGradingSystem,
  setNewGradingSystem,
  onClose,
  onCreateSubject,
  onDeleteSubject,
  onOpenRewardsModal,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!selectedPeriod) return null;

  return (
    <Modal visible={true} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{selectedPeriod.name}</Text>
              <Text style={styles.modalSub}>
                Frecuencia: {getPeriodTypeLabel(selectedPeriod.period_type, t)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {/* 1. Add Subject Form */}
            <Text style={styles.sectionTitle}>{t('periods.createSubjectTitle')}</Text>
            <Input
              label={t('periods.subjectNameLabel')}
              placeholder={t('periods.subjectNamePlaceholder')}
              value={newSubjectName}
              onChangeText={setNewSubjectName}
            />

            <Text style={styles.fieldLabel}>{t('periods.gradingSystemLabel')}</Text>
            <View style={styles.systemToggleRow}>
              {GRADING_SYSTEMS.map((sys) => {
                const isActive = newGradingSystem === sys.type;
                return (
                  <TouchableOpacity
                    key={sys.type}
                    onPress={() => setNewGradingSystem(sys.type)}
                    style={[styles.systemTab, isActive && styles.systemTabActive]}
                  >
                    <Text style={[styles.systemTabText, isActive && styles.systemTabTextActive]}>
                      {t(sys.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title={t('periods.addSubjectBtn')}
              onPress={onCreateSubject}
              containerStyle={{ marginBottom: theme.spacing.lg }}
            />

            {/* 2. List of Subject Cards */}
            <Text style={[styles.sectionTitle, { marginTop: theme.spacing.xs }]}>
              {t('periods.subjectCardsTitle', { count: periodSubjects.length })}
            </Text>
            <Text style={styles.sectionSubTitle}>
              {t('periods.subjectCardsHint')}
            </Text>

            {periodSubjects.map((sb) => {
              const configuredRulesCount = (subjectRulesMap[sb.id] || []).length;
              return (
                <SubjectCardItem
                  key={sb.id}
                  subject={sb}
                  rulesCount={configuredRulesCount}
                  onOpenRewardsModal={onOpenRewardsModal}
                  onDeleteSubject={onDeleteSubject}
                />
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PeriodDetailModal;
