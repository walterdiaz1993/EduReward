import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PeriodRow, SubjectRow } from '../../database/dbService';

export interface AcademicState {
  periods: PeriodRow[];
  subjects: SubjectRow[];
  selectedPeriodId: string | null;
}

const initialState: AcademicState = {
  periods: [],
  subjects: [],
  selectedPeriodId: null,
};

const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    setPeriods: (state, action: PayloadAction<PeriodRow[]>) => {
      state.periods = action.payload;
    },
    addPeriod: (state, action: PayloadAction<PeriodRow>) => {
      state.periods.push(action.payload);
    },
    deletePeriod: (state, action: PayloadAction<string>) => {
      state.periods = state.periods.filter((p) => p.id !== action.payload);
      if (state.selectedPeriodId === action.payload) {
        state.selectedPeriodId = state.periods.length > 0 ? state.periods[0].id : null;
      }
    },
    setSubjects: (state, action: PayloadAction<SubjectRow[]>) => {
      state.subjects = action.payload;
    },
    addSubject: (state, action: PayloadAction<SubjectRow>) => {
      state.subjects.push(action.payload);
    },
    deleteSubject: (state, action: PayloadAction<string>) => {
      state.subjects = state.subjects.filter((s) => s.id !== action.payload);
    },
    setSelectedPeriodId: (state, action: PayloadAction<string | null>) => {
      state.selectedPeriodId = action.payload;
    },
  },
});

export const {
  setPeriods,
  addPeriod,
  deletePeriod,
  setSubjects,
  addSubject,
  deleteSubject,
  setSelectedPeriodId,
} = academicSlice.actions;

export default academicSlice.reducer;
