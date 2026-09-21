import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../../store/AuthContext';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setStudents as setReduxStudents, addStudent as addReduxStudent } from '../../../store/slices/studentsSlice';
import { INITIAL_STUDENTS, StudentWithGrades, RewardRule } from '../../../mocks/userMock';
import dbService, { SubjectRow, GradeLogRow, RewardLogRow } from '../../../database/dbService';

export type GradingSystem = 'percentage' | 'decimal' | 'letters';

export type AssignedSubjectItem = SubjectRow & { period_name?: string };

export const useAdmin = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const dispatch = useAppDispatch();
  
  // Read Redux students
  const reduxStudents = useAppSelector((state) => state.students.students);

  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [allStudents, setAllStudents] = useState<StudentWithGrades[]>(INITIAL_STUDENTS);
  const [myStudents, setMyStudents] = useState<StudentWithGrades[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithGrades | null>(null);
  
  // Assigned subjects state for grade modal
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubjectItem[]>([]);
  const [selectedSubjectItem, setSelectedSubjectItem] = useState<AssignedSubjectItem | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState<boolean>(false);
  const [isConfigMode, setIsConfigMode] = useState<boolean>(false);

  const [gradingSystem, setGradingSystem] = useState<GradingSystem>('percentage');
  const [gradeValue, setGradeValue] = useState<string>('');
  
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentUsername, setNewStudentUsername] = useState<string>('');
  
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'reward' | 'punish' | 'error' | null>(null);

  // Grade history & Subject averages state for grade modal
  const [subjectGradeHistory, setSubjectGradeHistory] = useState<GradeLogRow[]>([]);
  const [subjectAveragesMap, setSubjectAveragesMap] = useState<Record<string, { subjectName: string; average: number; count: number }>>({});

  // Carnet Estudiantil modal state
  const [selectedCarnetStudent, setSelectedCarnetStudent] = useState<StudentWithGrades | null>(null);
  const [isCarnetModalOpen, setIsCarnetModalOpen] = useState<boolean>(false);

  const openCarnetModal = (student: StudentWithGrades) => {
    setSelectedCarnetStudent(student);
    setIsCarnetModalOpen(true);
  };

  const closeCarnetModal = () => {
    setIsCarnetModalOpen(false);
    setSelectedCarnetStudent(null);
  };

  // Grade detail modal state
  const [selectedGradeDetail, setSelectedGradeDetail] = useState<GradeLogRow | null>(null);
  const [gradeDetailReward, setGradeDetailReward] = useState<{
    title: string;
    reward_type: string;
    reward_value: string;
    rule_type: string;
  } | null>(null);
  const [isGradeDetailModalOpen, setIsGradeDetailModalOpen] = useState<boolean>(false);

  const openGradeDetail = async (gradeLog: GradeLogRow) => {
    setSelectedGradeDetail(gradeLog);
    setIsGradeDetailModalOpen(true);
    try {
      const reward = await dbService.getRewardForGradeLog(gradeLog);
      setGradeDetailReward(reward);
    } catch (e) {
      console.error('Error fetching reward for grade detail:', e);
      setGradeDetailReward(null);
    }
  };

  const closeGradeDetail = () => {
    setIsGradeDetailModalOpen(false);
    setSelectedGradeDetail(null);
    setGradeDetailReward(null);
  };

  // Sync SQLite students on mount & dispatch to Redux Store
  useEffect(() => {
    loadStudentsFromDb();
  }, [user]);

  const loadStudentsFromDb = async () => {
    try {
      await dbService.recalculateAllStudentAverages();
      const dbSts = await dbService.getAllStudents();
      dispatch(setReduxStudents(dbSts));

      // Map SQLite rows to StudentWithGrades format
      const mapped: StudentWithGrades[] = dbSts.map((row) => ({
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        email: row.email,
        role: 'student',
        points: row.points,
        grades: [],
        average: row.average || 0,
        periodType: row.period_type,
        gradingSystem: row.grading_system,
        subjectRules: [],
      }));

      setAllStudents(mapped);
      setMyStudents(mapped);

      setSelectedStudent((prev) => {
        if (!prev) return null;
        const fresh = mapped.find((s) => s.id === prev.id);
        return fresh || prev;
      });
    } catch (e) {
      console.error('Error loading SQLite students:', e);
    }
  };

  const loadAssignedSubjectsForStudent = async (studentId: string) => {
    try {
      const subs = await dbService.getAssignedSubjectsForStudent(studentId);
      setAssignedSubjects(subs);

      // Recalculate and load subject averages
      const avgRes = await dbService.calculateAndUpdateStudentAverage(studentId);
      setSubjectAveragesMap(avgRes.subjectAverages);

      if (subs.length > 0) {
        setSelectedSubjectItem(subs[0]);
        setGradingSystem((subs[0].grading_system as GradingSystem) || 'percentage');

        const history = await dbService.getGradesForSubjectAndStudent(studentId, subs[0].id);
        setSubjectGradeHistory(history);
      } else {
        setSelectedSubjectItem(null);
        setSubjectGradeHistory([]);
      }
    } catch (e) {
      console.error('Error loading assigned subjects for student:', e);
    }
  };

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      await requestPermission();
    }
    setIsScannerOpen(true);
  };

  const closeScanner = () => {
    setIsScannerOpen(false);
  };

  const handleScanStudent = async (scannedData: string) => {
    const rawData = (scannedData || '').trim();
    const cleanData = rawData.toLowerCase();

    const student = allStudents.find(
      (s) =>
        s.id === rawData ||
        s.username.toLowerCase() === cleanData ||
        s.id.toLowerCase() === cleanData ||
        cleanData.includes(s.id.toLowerCase()) ||
        cleanData.includes(s.username.toLowerCase())
    );

    if (student) {
      setSelectedStudent(student);
      await loadAssignedSubjectsForStudent(student.id);
      setIsScannerOpen(false);
      setIsGradeModalOpen(true);
    } else {
      setIsScannerOpen(false);
      setAlertMessage(`Código QR: "${rawData}". No se encontró estudiante registrado.`);
      setAlertType('error');
      setIsGradeModalOpen(true);
    }
  };

  const handleSelectStudent = async (student: StudentWithGrades) => {
    setSelectedStudent(student);
    setIsConfigMode(false);
    await loadAssignedSubjectsForStudent(student.id);
    setIsGradeModalOpen(true);
  };

  const handleConfigureStudent = (student: StudentWithGrades) => {
    setSelectedStudent(student);
    setIsConfigMode(true);
    setIsGradeModalOpen(true);
  };

  const closeGradeModal = () => {
    setIsGradeModalOpen(false);
    setIsConfigMode(false);
    setGradeValue('');
    setAlertMessage(null);
    setAlertType(null);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewStudentName('');
    setNewStudentUsername('');
    setAlertMessage(null);
    setAlertType(null);
  };

  const openPeriodModal = () => {
    setIsPeriodModalOpen(true);
  };

  const closePeriodModal = () => {
    setIsPeriodModalOpen(false);
  };

  const handleActivatePremium = () => {
    updateUser({ isPremium: true });
    setAlertMessage(t('admin.premiumActive'));
    setAlertType('success');
    setIsGradeModalOpen(true);
  };

  const checkCreationLimit = (): { allowed: boolean; message: string | null; requiresPremium: boolean } => {
    if (!user) return { allowed: false, message: null, requiresPremium: false };
    const currentCount = myStudents.length;

    if (user.role === 'tutor') {
      if (currentCount >= 3) {
        return { allowed: false, message: t('admin.limitReached'), requiresPremium: false };
      }
    } else if (user.role === 'teacher') {
      if (!user.isPremium) {
        if (currentCount >= 1) {
          return { allowed: false, message: t('admin.premiumRequired'), requiresPremium: true };
        }
      } else {
        if (currentCount >= 25) {
          return { allowed: false, message: t('admin.limitReached'), requiresPremium: false };
        }
      }
    }

    return { allowed: true, message: null, requiresPremium: false };
  };

  const handleCreateStudent = async () => {
    const limitCheck = checkCreationLimit();
    if (!limitCheck.allowed) {
      setAlertMessage(limitCheck.message);
      setAlertType('error');
      return;
    }

    if (!newStudentName.trim() || !newStudentUsername.trim()) {
      setAlertMessage(t('login.errorEmptyFields'));
      setAlertType('error');
      return;
    }

    const usernameClean = newStudentUsername.trim().toLowerCase();

    if (allStudents.some((s) => s.username === usernameClean)) {
      setAlertMessage(t('admin.gradeInvalid'));
      setAlertType('error');
      return;
    }

    try {
      const createdRow = await dbService.createStudent({
        user_type: user?.role === 'tutor' ? 'child' : 'student',
        full_name: newStudentName.trim(),
        username: usernameClean,
        email: `${usernameClean}@edureward.dev`,
        parent_teacher_id: user?.id,
        points: 0,
        period_type: 'semester',
        grading_system: 'percentage',
      });

      dispatch(addReduxStudent(createdRow));

      const newStudent: StudentWithGrades = {
        id: createdRow.id,
        username: createdRow.username,
        fullName: createdRow.full_name,
        email: createdRow.email,
        role: 'student',
        points: 0,
        grades: [],
        average: 0,
        periodType: 'semester',
        gradingSystem: 'percentage',
        subjectRules: [],
      };

      const updatedAll = [...allStudents, newStudent];
      setAllStudents(updatedAll);
      setMyStudents(updatedAll);

      if (user && user.studentIds) {
        const updatedIds = [...user.studentIds, createdRow.id];
        updateUser({ studentIds: updatedIds });
      }

      closeCreateModal();
      setAlertMessage(t('admin.profileSuccess'));
      setAlertType('success');
      setIsGradeModalOpen(true);
    } catch (e) {
      console.error('Error creating student in SQLite:', e);
      setAlertMessage(t('common.error'));
      setAlertType('error');
    }
  };

  const handleSaveStudentConfig = (id: string, fields: Partial<StudentWithGrades>) => {
    const updatedAll = allStudents.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          ...fields,
        };
      }
      return s;
    });

    setAllStudents(updatedAll);
    closeGradeModal();
    setAlertMessage(t('admin.profileSuccess'));
    setAlertType('success');
    setIsGradeModalOpen(true);
  };

  const handleAddRule = (studentId: string, ruleData: Omit<RewardRule, 'id'>) => {
    const newRule: RewardRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
    };

    const updatedAll = allStudents.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          subjectRules: [...s.subjectRules, newRule],
        };
      }
      return s;
    });

    setAllStudents(updatedAll);
  };

  const handleDeleteRule = (studentId: string, ruleId: string) => {
    const updatedAll = allStudents.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          subjectRules: s.subjectRules.filter((r) => r.id !== ruleId),
        };
      }
      return s;
    });

    setAllStudents(updatedAll);
  };

  const [triggeredReward, setTriggeredReward] = useState<import('../../../database/dbService').RewardLogRow | null>(null);
  const [editingGradeLog, setEditingGradeLog] = useState<import('../../../database/dbService').GradeLogRow | null>(null);
  const [editGradeValue, setEditGradeValue] = useState<string>('');

  const closeRewardModal = () => {
    setTriggeredReward(null);
  };

  const openEditGrade = (grade: import('../../../database/dbService').GradeLogRow) => {
    setEditingGradeLog(grade);
    setEditGradeValue(grade.raw_grade);
  };

  const closeEditGrade = () => {
    setEditingGradeLog(null);
    setEditGradeValue('');
  };

  const handleUpdateGrade = async () => {
    if (!editingGradeLog || !selectedStudent || !selectedSubjectItem) return;

    const currentSystem = (editingGradeLog.grading_system as GradingSystem) || 'percentage';
    let numericGrade = 0;
    let isValid = false;

    if (currentSystem === 'percentage') {
      const val = parseFloat(editGradeValue);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        numericGrade = val;
        isValid = true;
      }
    } else if (currentSystem === 'decimal') {
      const val = parseFloat(editGradeValue);
      if (!isNaN(val) && val >= 0 && val <= 10) {
        numericGrade = val;
        isValid = true;
      }
    } else if (currentSystem === 'letters') {
      const letter = editGradeValue.trim().toUpperCase();
      const mappings: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 0 };
      if (mappings[letter] !== undefined) {
        numericGrade = mappings[letter];
        isValid = true;
      }
    }

    if (!isValid) {
      setAlertMessage(t('admin.gradeInvalid'));
      setAlertType('error');
      return;
    }

    try {
      const evalResult = await dbService.updateGradeLog(
        editingGradeLog.id,
        selectedStudent.id,
        editGradeValue.trim(),
        numericGrade,
        currentSystem
      );

      closeEditGrade();
      await loadStudentsFromDb();

      const history = await dbService.getGradesForSubjectAndStudent(selectedStudent.id, selectedSubjectItem.id);
      setSubjectGradeHistory(history);

      const avgRes = await dbService.calculateAndUpdateStudentAverage(selectedStudent.id);
      setSubjectAveragesMap(avgRes.subjectAverages);

      if (evalResult.triggeredReward) {
        setTriggeredReward(evalResult.triggeredReward);
      } else {
        setAlertMessage('¡Calificación actualizada con éxito!');
        setAlertType('success');
      }
    } catch (e: any) {
      console.error('Error updating grade log:', e);
      setAlertMessage(e?.message || 'Error al actualizar la nota.');
      setAlertType('error');
    }
  };

  const handleDeleteGrade = (gradeId: string) => {
    if (!selectedStudent || !selectedSubjectItem) return;

    Alert.alert(
      'Eliminar Calificación',
      '¿Estás seguro de que deseas eliminar esta nota del histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbService.deleteGradeLog(gradeId, selectedStudent.id);
              await loadStudentsFromDb();

              const history = await dbService.getGradesForSubjectAndStudent(selectedStudent.id, selectedSubjectItem.id);
              setSubjectGradeHistory(history);

              const avgRes = await dbService.calculateAndUpdateStudentAverage(selectedStudent.id);
              setSubjectAveragesMap(avgRes.subjectAverages);

              setAlertMessage('Calificación eliminada.');
              setAlertType('success');
            } catch (e: any) {
              console.error('Error deleting grade log:', e);
              setAlertMessage(e?.message || 'Error al eliminar la nota.');
              setAlertType('error');
            }
          },
        },
      ]
    );
  };

  const selectAssignedSubject = async (subjectItem: AssignedSubjectItem) => {
    setSelectedSubjectItem(subjectItem);
    if (subjectItem.grading_system) {
      setGradingSystem(subjectItem.grading_system as GradingSystem);
    }
    if (selectedStudent) {
      try {
        const history = await dbService.getGradesForSubjectAndStudent(selectedStudent.id, subjectItem.id);
        setSubjectGradeHistory(history);
      } catch (e) {
        console.error('Error fetching subject grade history:', e);
      }
    }
  };

  const validateAndAddGrade = async () => {
    if (!selectedStudent) return;
    if (!selectedSubjectItem) {
      setAlertMessage('Selecciona una materia asignada para registrar la calificación.');
      setAlertType('error');
      return;
    }

    const currentSystem = (selectedSubjectItem.grading_system as GradingSystem) || 'percentage';
    let numericGrade = 0;
    let isValid = false;

    if (currentSystem === 'percentage') {
      const val = parseFloat(gradeValue);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        numericGrade = val;
        isValid = true;
      }
    } else if (currentSystem === 'decimal') {
      const val = parseFloat(gradeValue);
      if (!isNaN(val) && val >= 0 && val <= 10) {
        numericGrade = val; // Keep decimal scale 0.0 to 10.0
        isValid = true;
      }
    } else if (currentSystem === 'letters') {
      const letter = gradeValue.trim().toUpperCase();
      const mappings: Record<string, number> = {
        A: 5,
        B: 4,
        C: 3,
        D: 2,
        F: 0,
      };
      if (mappings[letter] !== undefined) {
        numericGrade = mappings[letter];
        isValid = true;
      }
    }

    if (!isValid) {
      setAlertMessage(t('admin.gradeInvalid'));
      setAlertType('error');
      return;
    }

    try {
      // Log grade in SQLite & evaluate reward rules for selected subject
      const evalResult = await dbService.addGradeAndEvaluateRewards(
        selectedStudent.id,
        selectedSubjectItem.id,
        selectedSubjectItem.period_id || '',
        gradeValue.trim(),
        numericGrade,
        currentSystem
      );

      // Refresh student DB records so points & averages update
      await loadStudentsFromDb();

      // Refresh subject grade history & subject averages
      const history = await dbService.getGradesForSubjectAndStudent(selectedStudent.id, selectedSubjectItem.id);
      setSubjectGradeHistory(history);

      const avgRes = await dbService.calculateAndUpdateStudentAverage(selectedStudent.id);
      setSubjectAveragesMap(avgRes.subjectAverages);

      if (evalResult.triggeredReward) {
        setTriggeredReward(evalResult.triggeredReward);
        closeGradeModal();
      } else {
        setAlertMessage(
          `¡Calificación registrada con éxito para ${selectedSubjectItem.name}!\nNota: ${gradeValue.trim()}`
        );
        setAlertType('success');
      }

      setGradeValue('');
    } catch (e: any) {
      console.error('Error adding grade and evaluating rewards:', e);
      setAlertMessage(e?.message || 'Error registrando la nota.');
      setAlertType('error');
    }
  };

  return {
    students: myStudents,
    allStudents,
    selectedStudent,
    assignedSubjects,
    selectedSubjectItem,
    selectAssignedSubject,
    subjectGradeHistory,
    subjectAveragesMap,
    triggeredReward,
    closeRewardModal,
    isScannerOpen,
    isGradeModalOpen,
    isCreateModalOpen,
    isPeriodModalOpen,
    isConfigMode,
    gradingSystem,
    setGradingSystem,
    gradeValue,
    setGradeValue,
    newStudentName,
    setNewStudentName,
    newStudentUsername,
    setNewStudentUsername,
    alertMessage,
    alertType,
    cameraPermission,
    requestPermission,
    openScanner,
    closeScanner,
    handleScanStudent,
    handleSelectStudent,
    handleConfigureStudent,
    closeGradeModal,
    openCreateModal,
    closeCreateModal,
    openPeriodModal,
    closePeriodModal,
    selectedCarnetStudent,
    isCarnetModalOpen,
    openCarnetModal,
    closeCarnetModal,
    selectedGradeDetail,
    gradeDetailReward,
    isGradeDetailModalOpen,
    openGradeDetail,
    closeGradeDetail,
    editingGradeLog,
    editGradeValue,
    setEditGradeValue,
    openEditGrade,
    closeEditGrade,
    handleUpdateGrade,
    handleDeleteGrade,
    handleCreateStudent,
    handleSaveStudentConfig,
    handleAddRule,
    handleDeleteRule,
    handleActivatePremium,
    validateAndAddGrade,
    checkCreationLimit,
    reloadFromDb: loadStudentsFromDb,
  };
};

export default useAdmin;
