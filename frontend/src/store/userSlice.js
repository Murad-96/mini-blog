import { createSlice } from '@reduxjs/toolkit';

// Helper function to check if token exists in localStorage
const isTokenStored = () => {
  const token = localStorage.getItem("token");
  return token && token.length > 0 && token !== "null";
};

// Initial state
const initialState = {
  username: '',
  isLoggedIn: isTokenStored()
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.username = action.payload.username;
      state.isLoggedIn = true;
    },
    logoutUser: (state) => {
      state.username = '';
      state.isLoggedIn = false;
      // Clear token from localStorage
      localStorage.removeItem("token");
    },
    // Action to sync login status from localStorage (useful on app initialization)
    syncLoginStatus: (state) => {
      state.isLoggedIn = isTokenStored();
      if (!state.isLoggedIn) {
        state.username = '';
      }
    }
  }
});

export const { loginUser, logoutUser, syncLoginStatus } = userSlice.actions;
export default userSlice.reducer;
