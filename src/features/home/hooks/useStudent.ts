import { useRef, useState, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../store/AuthContext';
import { StudentWithGrades, INITIAL_STUDENTS } from '../../../mocks/userMock';

export const useStudent = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [studentData, setStudentData] = useState<StudentWithGrades | null>(null);
  const [activeWheel, setActiveWheel] = useState<'gold' | 'consequences' | 'locked'>('locked');
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  
  const spinValue = useRef(new Animated.Value(0)).current;

  const goldOptions = [
    '+$50 Mesada',
    '+1h Consola',
    'Salida Cine',
    'Juego Nuevo',
    'Día Libre',
    '+100 Puntos',
  ];

  const consequenceOptions = [
    '-20% Mesada',
    'Sin Consola',
    'Tareas Extra',
    '-50 Puntos',
    'Sin Salida',
    'Limpiar Cuarto',
  ];

  useEffect(() => {
    if (user) {
      const match = INITIAL_STUDENTS.find((s) => s.username === user.username);
      if (match) {
        setStudentData(match);
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
    }
  }, [user]);

  useEffect(() => {
    if (studentData) {
      const avg = studentData.average;
      if (studentData.grades.length === 0) {
        setActiveWheel('locked');
      } else if (avg >= 90) {
        setActiveWheel('gold');
      } else if (avg < 70) {
        setActiveWheel('consequences');
      } else {
        setActiveWheel('locked');
      }
    }
  }, [studentData]);

  const spin = () => {
    if (isSpinning || activeWheel === 'locked') return;

    setIsSpinning(true);
    setSpinResult(null);
    spinValue.setValue(0);

    const randomSpins = 5 + Math.floor(Math.random() * 5);
    const targetValue = randomSpins * 360;

    Animated.timing(spinValue, {
      toValue: targetValue,
      duration: 3000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      
      const options = activeWheel === 'gold' ? goldOptions : consequenceOptions;
      const selectedIndex = Math.floor(Math.random() * options.length);
      const result = options[selectedIndex];
      
      setSpinResult(result);

      if (studentData) {
        let updatedPoints = studentData.points;
        if (activeWheel === 'gold') {
          if (result === '+$50 Mesada') updatedPoints += 150;
          else if (result === '+100 Puntos') updatedPoints += 100;
          else updatedPoints += 50;
        } else if (activeWheel === 'consequences') {
          if (result === '-20% Mesada') updatedPoints = Math.round(updatedPoints * 0.8);
          else if (result === '-50 Puntos') updatedPoints = Math.max(0, updatedPoints - 50);
          else updatedPoints = Math.max(0, updatedPoints - 20);
        }

        setStudentData({
          ...studentData,
          points: updatedPoints,
        });
      }
    });
  };

  const getInterpolatedRotation = () => {
    return spinValue.interpolate({
      inputRange: [0, 3600],
      outputRange: ['0deg', '3600deg'],
    });
  };

  return {
    studentData,
    activeWheel,
    spinResult,
    isSpinning,
    spin,
    getInterpolatedRotation,
    goldOptions,
    consequenceOptions,
    t,
  };
};
export default useStudent;
