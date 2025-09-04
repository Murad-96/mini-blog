import { createSlice } from '@reduxjs/toolkit';

// Helper function to check if token exists in localStorage
const isTokenStored = () => {
  const token = localStorage.getItem("token");
  return token && token.length > 0 && token !== "null";
};

// Helper function to get username from localStorage
const getStoredUsername = () => {
  const username = localStorage.getItem("username");
  return username || '';
};

// Initial state
const initialState = {
  username: getStoredUsername(), // 👈 Get username from localStorage on init
  isLoggedIn: isTokenStored()
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.username = action.payload.username;
      state.isLoggedIn = true;
      // Store username in localStorage 👈 Add this
      localStorage.setItem("username", action.payload.username);
    },
    logoutUser: (state) => {
      state.username = '';
      state.isLoggedIn = false;
      // Clear both token and username from localStorage 👈 Update this
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    },
    // Action to sync login status from localStorage (useful on app initialization)
    syncLoginStatus: (state) => {
      state.isLoggedIn = isTokenStored();
      if (!state.isLoggedIn) {
        state.username = '';
        localStorage.removeItem("username"); // 👈 Clean up username if not logged in
      } else {
        // 👈 Add this: restore username if still logged in
        state.username = getStoredUsername();
      }
    }
  }
});

export const { loginUser, logoutUser, syncLoginStatus } = userSlice.actions;
export default userSlice.reducer;
