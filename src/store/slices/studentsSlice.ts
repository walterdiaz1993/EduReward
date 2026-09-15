import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudentRow } from '../../database/dbService';

export interface StudentsState {
  students: StudentRow[];
  selectedStudentId: string | null;
}

const initialState: StudentsState = {
  students: [],
  selectedStudentId: null,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setStudents: (state, action: PayloadAction<StudentRow[]>) => {
      state.students = action.payload;
    },
    addStudent: (state, action: PayloadAction<StudentRow>) => {
      state.students.push(action.payload);
    },
    updateStudentPoints: (state, action: PayloadAction<{ id: string; points: number }>) => {
      const student = state.students.find((s) => s.id === action.payload.id);
      if (student) {
        student.points = action.payload.points;
      }
    },
    setSelectedStudentId: (state, action: PayloadAction<string | null>) => {
      state.selectedStudentId = action.payload;
    },
  },
});

export const { setStudents, addStudent, updateStudentPoints, setSelectedStudentId } =
  studentsSlice.actions;

export default studentsSlice.reducer;
