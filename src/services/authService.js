import React, { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Firebase Console
  offlineAccess: true,
});

// Create Auth Context
export const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
          setUser(currentUser);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Email/Password Registration
export const registerUser = async (email, password, username, role = 'teacher') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      username: username,
      role: role,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      authProvider: 'email',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { 
      success: true, 
      user,
      message: 'Account created successfully!' 
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Failed to create account';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Email/Password Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        role: 'teacher',
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        authProvider: 'email',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return { 
      success: true, 
      user,
      message: 'Login successful!' 
    };
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Failed to login';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    // Check if device supports Google Play services
    await GoogleSignin.hasPlayServices();
    
    // Get user info from Google
    const userInfo = await GoogleSignin.signIn();
    
    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
    
    // Sign in with Firebase using the Google credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;
    
    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for Google sign-in users
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        role: 'teacher',
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        authProvider: 'google',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return { 
      success: true, 
      user,
      message: 'Google sign-in successful!' 
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    let errorMessage = 'Failed to sign in with Google';
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      errorMessage = 'Sign-in cancelled';
    } else if (error.code === 'IN_PROGRESS') {
      errorMessage = 'Sign-in already in progress';
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      errorMessage = 'Play services not available or outdated';
    } else {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Logout
export const logoutUser = async () => {
  try {
    // Sign out from Google if user signed in with Google
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.signOut();
    }
    
    // Sign out from Firebase
    await signOut(auth);
    
    return { 
      success: true,
      message: 'Logged out successfully' 
    };
  } catch (error) {
    console.error('Logout error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
