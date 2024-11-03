import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

function Login() {
  const [error, setError] = useState(null);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in:", result.user);
      })
      .catch((error) => {
        console.error("Error during sign in:", error);
        setError(error.message);
      });
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <img src="/Valuee.png" alt="Value View AI Stock Analysis Logo" className="login-logo" />
        <div className="login-form">
          <h2>Login to Stock Analysis App</h2>
          <button onClick={signInWithGoogle}>Sign in with Google</button>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;
