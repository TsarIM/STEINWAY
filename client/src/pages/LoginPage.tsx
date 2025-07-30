import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage(){
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(user){
      navigate('/piano');
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try{
      const response = await fetch('http://localhost:5050/api/users/google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await response.json();

      if(response.ok){
        login(data.token, data.user);
        navigate('/piano');
      }else{
        alert('Login failed: ' + data.error);
      }
    }catch(error){
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('Google Login Failed');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome to Steinway</h1>
        <p className="login-subtitle">
          Sign up / Sign in to start creating and sharing your music 
        </p>
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>
      </div>
    </div>
  );
}
