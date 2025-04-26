import { createContext, useEffect, useReducer, ReactElement } from 'react';

// third-party
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// action - state management
import { LOGIN, LOGOUT } from 'store/reducers/actions-reducer';
import authReducer from 'store/reducers/auth-reducer';

// project-imports
import Loader from 'components/Loader';
import { AuthProps, FirebaseContextType } from 'types/auth';
// import { UserType } from 'types/user';

// firebase initialize
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyCx35vRqs-unNyusiePCkbsibjGA8QDReY',
    authDomain: 'billing-erp-429f4.firebaseapp.com',
    projectId: 'billing-erp-429f4',
    storageBucket: 'billing-erp-429f4.firebasestorage.app',
    messagingSenderId: '257836658941',
    appId: '1:257836658941:web:cf18a1c5ac9800de9a8e94',
    measurementId: 'G-V3QPKC4QMY'
  });
}

// const
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ==============================|| FIREBASE CONTEXT & PROVIDER ||============================== //

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider = ({ children }: { children: ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
        if (user) {
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: {
                id: user.uid,
                email: user.email!,
                name: user.displayName || 'Stebin Ben',
                role: 'Biller/Cashier'
              }
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const firebaseEmailPasswordSignIn = (email: string, password: string) => firebase.auth().signInWithEmailAndPassword(email, password);

  const firebaseGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  const firebaseTwitterSignIn = () => {
    const provider = new firebase.auth.TwitterAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  const firebaseFacebookSignIn = () => {
    const provider = new firebase.auth.FacebookAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  const firebaseRegister = async (email: string, password: string) => firebase.auth().createUserWithEmailAndPassword(email, password);

  const logout = () => firebase.auth().signOut();

  const resetPassword = async (email: string) => {
    await firebase.auth().sendPasswordResetEmail(email);
  };

  const updateProfile = () => {};
  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <FirebaseContext.Provider
      value={{
        ...state,
        firebaseRegister,
        firebaseEmailPasswordSignIn,
        login: () => {},
        firebaseGoogleSignIn,
        firebaseTwitterSignIn,
        firebaseFacebookSignIn,
        logout,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext;
