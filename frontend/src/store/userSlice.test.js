import userReducer, { loginUser, logoutUser, syncLoginStatus } from './userSlice';

describe('userSlice', () => {
  const initialState = {
    username: '',
    isLoggedIn: false
  };

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle loginUser', () => {
    const previousState = initialState;
    const action = loginUser({ username: 'testuser' });
    const newState = userReducer(previousState, action);
    
    expect(newState.username).toEqual('testuser');
    expect(newState.isLoggedIn).toEqual(true);
  });

  it('should handle logoutUser', () => {
    const previousState = {
      username: 'testuser',
      isLoggedIn: true
    };
    const action = logoutUser();
    const newState = userReducer(previousState, action);
    
    expect(newState.username).toEqual('');
    expect(newState.isLoggedIn).toEqual(false);
  });

  it('should handle syncLoginStatus when no token', () => {
    // Mock localStorage
    const mockGetItem = jest.fn(() => null);
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
      },
      writable: true
    });

    const previousState = {
      username: 'testuser',
      isLoggedIn: true
    };
    const action = syncLoginStatus();
    const newState = userReducer(previousState, action);
    
    expect(newState.username).toEqual('');
    expect(newState.isLoggedIn).toEqual(false);
  });
});
