import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { PeriodsSubjectsScreenProps } from '../types/periods.types';
import { usePeriodsSubjects } from '../hooks/usePeriodsSubjects';
import { createStyles } from '../styles/PeriodsSubjectsScreen.styles';
import CreatePeriodCard from '../components/CreatePeriodCard';
import PeriodCardItem from '../components/PeriodCardItem';
import PeriodDetailModal from '../components/PeriodDetailModal';
import SubjectRewardsModal from '../components/SubjectRewardsModal';

export const PeriodsSubjectsScreen: React.FC<PeriodsSubjectsScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  const {
    periods,
    students,
    newPeriodName,
    setNewPeriodName,
    newPeriodType,
    setNewPeriodType,
    selectedPeriod,
    periodSubjects,
    subjectRulesMap,
    selectedStudentIds,
    newSubjectName,
    setNewSubjectName,
    newGradingSystem,
    setNewGradingSystem,
    editingSubject,
    ruleSlots,
    handleCreatePeriod,
    handleDeletePeriod,
    openPeriodDetail,
    closePeriodDetail,
    handleCreateSubjectInPeriod,
    handleDeleteSubjectInPeriod,
    openSubjectRewardsModal,
    closeSubjectRewardsModal,
    handleAddRuleSlot,
    handleRemoveRuleSlot,
    updateRuleSlot,
    handleSaveSubjectRewards,
    toggleStudentSelection,
    handleSavePeriodAssignments,
  } = usePeriodsSubjects();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backButtonText}>{t('common.backBtn')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('periods.manageTitle')}</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Create Period Form Component */}
          <CreatePeriodCard
            newPeriodName={newPeriodName}
            setNewPeriodName={setNewPeriodName}
            newPeriodType={newPeriodType}
            setNewPeriodType={setNewPeriodType}
            onCreatePeriod={handleCreatePeriod}
          />

          {/* Registered Periods Header & List */}
          <Text style={styles.sectionHeaderTitle}>
            {t('periods.registeredPeriods', { count: periods.length })}
          </Text>
          <Text style={styles.sectionSubTitle}>
            {t('periods.periodCardHint')}
          </Text>

          {periods.map((period) => (
            <PeriodCardItem
              key={period.id}
              period={period}
              onOpenDetail={openPeriodDetail}
              onDelete={handleDeletePeriod}
            />
          ))}
        </ScrollView>
      </View>

      {/* Level 1: Period Detail Modal */}
      <PeriodDetailModal
        selectedPeriod={selectedPeriod}
        periodSubjects={periodSubjects}
        subjectRulesMap={subjectRulesMap}
        students={students}
        selectedStudentIds={selectedStudentIds}
        newSubjectName={newSubjectName}
        setNewSubjectName={setNewSubjectName}
        newGradingSystem={newGradingSystem}
        setNewGradingSystem={setNewGradingSystem}
        onClose={closePeriodDetail}
        onCreateSubject={handleCreateSubjectInPeriod}
        onDeleteSubject={handleDeleteSubjectInPeriod}
        onOpenRewardsModal={openSubjectRewardsModal}
        onToggleStudentSelection={toggleStudentSelection}
        onSavePeriodAssignments={handleSavePeriodAssignments}
      />

      {/* Level 2: Subject Rewards Modal */}
      <SubjectRewardsModal
        editingSubject={editingSubject}
        ruleSlots={ruleSlots}
        onClose={closeSubjectRewardsModal}
        onAddRuleSlot={handleAddRuleSlot}
        onRemoveRuleSlot={handleRemoveRuleSlot}
        onUpdateRuleSlot={updateRuleSlot}
        onSaveRewards={handleSaveSubjectRewards}
      />
    </SafeAreaView>
  );
};

export default PeriodsSubjectsScreen;
