import { useSelector } from 'react-redux';

export default function UserInfo() {
  const { username, isLoggedIn } = useSelector((state) => state.user);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: '#f0f0f0', 
      margin: '10px 0',
      borderRadius: '5px'
    }}>
      <h3>User Information (from Redux)</h3>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Login Status:</strong> {isLoggedIn ? 'Logged In' : 'Logged Out'}</p>
    </div>
  );
}
