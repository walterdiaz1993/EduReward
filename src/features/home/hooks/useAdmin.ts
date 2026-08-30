import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../../store/AuthContext';
import { INITIAL_STUDENTS, StudentWithGrades, RewardRule } from '../../../mocks/userMock';

export type GradingSystem = 'percentage' | 'decimal' | 'letters';

export const useAdmin = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [allStudents, setAllStudents] = useState<StudentWithGrades[]>(INITIAL_STUDENTS);
  const [myStudents, setMyStudents] = useState<StudentWithGrades[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithGrades | null>(null);
  
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isConfigMode, setIsConfigMode] = useState<boolean>(false);

  const [gradingSystem, setGradingSystem] = useState<GradingSystem>('percentage');
  const [gradeValue, setGradeValue] = useState<string>('');
  
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentUsername, setNewStudentUsername] = useState<string>('');
  
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'reward' | 'punish' | 'error' | null>(null);

  useEffect(() => {
    if (user && user.studentIds) {
      const filtered = allStudents.filter((s) => user.studentIds!.includes(s.id));
      setMyStudents(filtered);
    }
  }, [user, allStudents]);

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setAlertMessage(t('admin.cameraPermission'));
        setAlertType('error');
        setIsGradeModalOpen(true);
        return;
      }
    }
    setIsScannerOpen(true);
  };

  const closeScanner = () => {
    setIsScannerOpen(false);
  };

  const handleScanStudent = (studentId: string) => {
    const student = allStudents.find((s) => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsScannerOpen(false);
      setIsGradeModalOpen(true);
    } else {
      setIsScannerOpen(false);
      setAlertMessage(t('admin.gradeInvalid'));
      setAlertType('error');
      setIsGradeModalOpen(true);
    }
  };

  const handleSelectStudent = (student: StudentWithGrades) => {
    setSelectedStudent(student);
    setIsConfigMode(false);
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

  const handleCreateStudent = () => {
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
    const newId = `usr_${usernameClean}`;

    if (allStudents.some((s) => s.id === newId)) {
      setAlertMessage(t('admin.gradeInvalid'));
      setAlertType('error');
      return;
    }

    const newStudent: StudentWithGrades = {
      id: newId,
      username: usernameClean,
      fullName: newStudentName.trim(),
      email: `${usernameClean}@edureward.dev`,
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

    if (user && user.studentIds) {
      const updatedIds = [...user.studentIds, newId];
      updateUser({ studentIds: updatedIds });
    }

    closeCreateModal();
    setAlertMessage(t('admin.profileSuccess'));
    setAlertType('success');
    setIsGradeModalOpen(true);
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

  const validateAndAddGrade = () => {
    if (!selectedStudent) return;

    let numericGrade = 0;
    let isValid = false;

    if (gradingSystem === 'percentage') {
      const val = parseFloat(gradeValue);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        numericGrade = val;
        isValid = true;
      }
    } else if (gradingSystem === 'decimal') {
      const val = parseFloat(gradeValue);
      if (!isNaN(val) && val >= 0 && val <= 10) {
        numericGrade = val * 10;
        isValid = true;
      }
    } else if (gradingSystem === 'letters') {
      const letter = gradeValue.trim().toUpperCase();
      const mappings: Record<string, number> = {
        A: 95,
        B: 85,
        C: 75,
        D: 65,
        F: 50,
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

    let pointsChange = 0;
    let outcomeType: 'success' | 'reward' | 'punish' = 'success';
    let alertMsg = t('admin.gradeSuccess');

    if (numericGrade >= 90) {
      pointsChange = 50;
      outcomeType = 'reward';
      alertMsg = `${t('admin.gradeSuccess')} \n ${t('admin.microRewardAlert')}`;
    } else if (numericGrade < 70) {
      pointsChange = Math.round(selectedStudent.points * -0.2);
      outcomeType = 'punish';
      alertMsg = `${t('admin.gradeSuccess')} \n ${t('admin.microPunishAlert')}`;
    }

    const updatedGrades = [...selectedStudent.grades, numericGrade];
    const updatedAverage = updatedGrades.reduce((a, b) => a + b, 0) / updatedGrades.length;
    const updatedPoints = Math.max(0, selectedStudent.points + pointsChange);

    const updatedStudent: StudentWithGrades = {
      ...selectedStudent,
      grades: updatedGrades,
      average: parseFloat(updatedAverage.toFixed(2)),
      points: updatedPoints,
    };

    const updatedAll = allStudents.map((s) =>
      s.id === selectedStudent.id ? updatedStudent : s
    );

    setAllStudents(updatedAll);
    setSelectedStudent(updatedStudent);
    setGradeValue('');
    setAlertMessage(alertMsg);
    setAlertType(outcomeType);
  };

  return {
    students: myStudents,
    allStudents,
    selectedStudent,
    isScannerOpen,
    isGradeModalOpen,
    isCreateModalOpen,
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
    handleCreateStudent,
    handleSaveStudentConfig,
    handleAddRule,
    handleDeleteRule,
    handleActivatePremium,
    validateAndAddGrade,
    checkCreationLimit,
  };
};
export default useAdmin;
