import { useRef, useState, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../store/AuthContext';
import { StudentWithGrades, INITIAL_STUDENTS } from '../../../mocks/userMock';
import dbService, {
  StudentRow,
  GradeLogRow,
  PeriodRow,
  PeriodWheelRow,
  StudentPeriodSpinRow,
} from '../../../database/dbService';

export const useStudent = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [studentData, setStudentData] = useState<StudentWithGrades | null>(null);
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  const [activeWheelInfo, setActiveWheelInfo] = useState<{
    wheel: PeriodWheelRow;
    options: string[];
  } | null>(null);

  const [savedSpinRecord, setSavedSpinRecord] = useState<StudentPeriodSpinRow | null>(null);

  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const spinValue = useRef(new Animated.Value(0)).current;

  const [gradesHistory, setGradesHistory] = useState<(GradeLogRow & { subject_name?: string })[]>([]);
  const [subjectAveragesMap, setSubjectAveragesMap] = useState<Record<string, { subjectName: string; average: number; count: number }>>({});

  // Grade Detail Modal state
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

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;
    try {
      const parentId = await loadStudentFromDb();
      
      let pList = await dbService.getAllPeriods(parentId || undefined);
      if (pList.length === 0) {
        const defP = await dbService.createPeriod('Primer Semestre', 'semester', parentId || 'admin');
        pList = [defP];
      }
      setPeriods(pList);
      if (pList.length > 0) {
        setSelectedPeriodId(pList[0].id);
      }
    } catch (e) {
      console.error('Error loading initial student data:', e);
    }
  };

  const loadStudentFromDb = async (): Promise<string | undefined> => {
    if (!user) return undefined;
    try {
      const allSts = await dbService.getAllStudents();
      const match = allSts.find((s: StudentRow) => s.id === user.id || s.username === user.username);
      if (match) {
        const avgRes = await dbService.calculateAndUpdateStudentAverage(match.id);
        setSubjectAveragesMap(avgRes.subjectAverages);

        const history = await dbService.getGradesForStudent(match.id);
        setGradesHistory(history);

        setStudentData({
          id: match.id,
          username: match.username,
          fullName: match.full_name,
          email: match.email,
          role: 'student',
          points: match.points,
          grades: history.map((h: GradeLogRow) => h.numeric_grade),
          average: avgRes.globalAverage || match.average || 0,
          periodType: match.period_type,
          gradingSystem: match.grading_system,
          subjectRules: [],
        });
        return match.parent_teacher_id;
      } else {
        const initialMatch = INITIAL_STUDENTS.find((s) => s.username === user.username);
        if (initialMatch) {
          setStudentData(initialMatch);
        } else {
          setStudentData({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: 'student',
            points: user.points,
            grades: [],
            average: 0,
            periodType: 'semester',
            gradingSystem: 'percentage',
            subjectRules: [],
          });
        }
        return user.id || undefined;
      }
    } catch (e) {
      console.error('Error loading student data from DB:', e);
      return undefined;
    }
  };

  const resolveWheelForStudentAndPeriod = async (studentId: string, periodId: string) => {
    if (!studentId || !periodId) return;
    try {
      const spinRecord = await dbService.getStudentPeriodSpin(studentId, periodId);
      setSavedSpinRecord(spinRecord);

      const matched = await dbService.getMatchingWheelForStudent(studentId, periodId);
      setActiveWheelInfo(matched);
    } catch (e) {
      console.error('Error resolving matching wheel and spin record:', e);
    }
  };

  const resetSpinOpportunity = async (studentId: string, periodId: string) => {
    if (!studentId || !periodId) return;
    try {
      await dbService.resetStudentPeriodSpin(studentId, periodId);
      setSavedSpinRecord(null);
      setSpinResult(null);
      await resolveWheelForStudentAndPeriod(studentId, periodId);
    } catch (e) {
      console.error('Error resetting spin opportunity:', e);
    }
  };

  useEffect(() => {
    if (studentData && selectedPeriodId) {
      resolveWheelForStudentAndPeriod(studentData.id, selectedPeriodId);
    }
  }, [studentData, selectedPeriodId]);

  const currentAngleRef = useRef<number>(0);

  const spin = (customOptions?: string[], studentIdForSpin?: string) => {
    const availableOptions = customOptions || activeWheelInfo?.options || [];
    const N = availableOptions.length;
    if (isSpinning || N === 0 || savedSpinRecord) return;

    setIsSpinning(true);
    setSpinResult(null);

    // Pick winning index beforehand
    const winningIndex = Math.floor(Math.random() * N);
    const winningItem = availableOptions[winningIndex];

    // Calculate exact target angle so winning item stops directly under top arrow
    const segmentAngle = 360 / N;
    const stopAngle = 360 - (winningIndex * segmentAngle);
    const fullSpins = 5 + Math.floor(Math.random() * 4);

    const currentAngle = currentAngleRef.current;
    const currentMod = currentAngle % 360;
    let delta = stopAngle - currentMod;
    if (delta <= 0) {
      delta += 360;
    }

    const totalNewRotation = currentAngle + delta + fullSpins * 360;
    currentAngleRef.current = totalNewRotation;

    Animated.timing(spinValue, {
      toValue: totalNewRotation,
      duration: 3500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(async () => {
      setIsSpinning(false);
      setSpinResult(winningItem);

      const stId = studentIdForSpin || studentData?.id || '';
      if (stId && selectedPeriodId && activeWheelInfo?.wheel.id) {
        try {
          const rec = await dbService.saveStudentPeriodSpin(
            stId,
            selectedPeriodId,
            activeWheelInfo.wheel.id,
            winningItem
          );
          setSavedSpinRecord(rec);
        } catch (e) {
          console.error('Error saving spin record to SQLite:', e);
        }
      }
    });
  };

  const getInterpolatedRotation = () => {
    return spinValue.interpolate({
      inputRange: [0, 360000],
      outputRange: ['0deg', '360000deg'],
    });
  };

  const clearSpinResult = () => setSpinResult(null);

  return {
    studentData,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    activeWheelInfo,
    savedSpinRecord,
    resolveWheelForStudentAndPeriod,
    resetSpinOpportunity,
    gradesHistory,
    subjectAveragesMap,
    selectedGradeDetail,
    gradeDetailReward,
    isGradeDetailModalOpen,
    openGradeDetail,
    closeGradeDetail,
    spinResult,
    clearSpinResult,
    isSpinning,
    spin,
    getInterpolatedRotation,
    t,
  };
};

export default useStudent;
