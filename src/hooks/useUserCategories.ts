import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useAuth from './useAuth';

export const useUserCategories = () => {
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      if (user?.id) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCategories(userData.categoriesSelected?.map((cat: any) => cat.category) || []);
          }
        } catch (error) {
          console.error('Error fetching user categories:', error);
        }
      }
    };

    fetchCategories();
  }, [user]);

  return userCategories;
};
