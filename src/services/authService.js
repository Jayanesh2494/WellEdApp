import React, { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { Platform } from 'react-native';

// Import Google Sign-In only for native platforms
let GoogleSignin;
if (Platform.OS !== 'web') {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      offlineAccess: true,
    });
  } catch (error) {
    console.log('Google Sign-In not available:', error);
  }
}

// Set persistence on web
if (Platform.OS === 'web') {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error('Error setting persistence:', error);
    });
}

// Create Auth Context
export const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.email : 'No user');
      
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
            console.log('User role:', userDoc.data().role);
          } else {
            console.warn('User document not found in Firestore');
          }
          setUser(currentUser);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(currentUser); // Set user anyway even if Firestore fails
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
    console.log('Registering user:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User created in Auth:', user.uid);

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

    console.log('User document created in Firestore');

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
    console.log('Attempting to login user:', email);
    
    // First check if user document exists
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User authenticated:', user.uid);

    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('User document not found, creating one...');
      
      // Create missing user document
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
      
      console.log('User document created');
    } else {
      console.log('User document found:', userDoc.data());
    }

    return { 
      success: true, 
      user,
      message: 'Login successful!' 
    };
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error code:', error.code);
    
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

// Google Sign-In (Web and Native compatible)
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    
    if (Platform.OS === 'web') {
      console.log('Signing in with Google (web)');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Google sign-in successful:', user.email);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        console.log('Creating user document for Google user');
        
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
    } else {
      console.log('Signing in with Google (native)');
      
      if (!GoogleSignin) {
        throw new Error('Google Sign-In is not available on this platform');
      }
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
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
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    let errorMessage = 'Failed to sign in with Google';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup blocked. Please allow popups for this site';
    } else if (error.code === 'SIGN_IN_CANCELLED') {
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
    console.log('Logging out user');
    
    if (Platform.OS !== 'web' && GoogleSignin) {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    }
    
    await signOut(auth);
    
    console.log('Logout successful');
    
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
