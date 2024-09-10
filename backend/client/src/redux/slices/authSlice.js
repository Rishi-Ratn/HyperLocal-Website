import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  role: null, 
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = {
        email: action.payload.email,
        displayName: action.payload.displayName,
        uid: action.payload.uid,
      };
      state.isAuthenticated = true; 
    },
    logout: (state) => {
      state.currentUser = null;
      state.role = null;
      state.isAuthenticated = false;  
    },
    setRole: (state, action) => {
      state.role = action.payload; 
    },
  },
});

export const { loginSuccess, logout, setRole } = authSlice.actions;

export default authSlice.reducer;
