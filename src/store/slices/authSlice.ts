import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MockUser } from '../../mocks/userMock';

export interface AuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<MockUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<MockUser>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { setUser, setLoading, updateProfile, logoutUser } = authSlice.actions;
export default authSlice.reducer;
