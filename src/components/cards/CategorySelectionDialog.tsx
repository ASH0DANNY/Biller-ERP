import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { productCategories } from 'types/product';
import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface CategorySelectionDialogProps {
  open: boolean;
  userId: string;
  onClose: () => void;
}

const CategorySelectionDialog = ({ open, userId, onClose }: CategorySelectionDialogProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCategories = async () => {
      if (userId && open) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setSelectedCategories(userData.categoriesSelected?.map((cat: any) => cat.category) || []);
          }
        } catch (error) {
          console.error('Error fetching user categories:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserCategories();
  }, [userId, open]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        categoriesSelected: selectedCategories.map((category) => ({
          category,
          subcategory: productCategories.find((pc) => pc.category === category)?.subcategory || []
        }))
      });
      onClose();
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Select Your Product Categories</DialogTitle>
      <DialogContent>
        <FormGroup>
          {productCategories.map((category) => (
            <FormControlLabel
              key={category.category}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category.category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category.category]);
                    } else {
                      setSelectedCategories(selectedCategories.filter((cat) => cat !== category.category));
                    }
                  }}
                />
              }
              label={category.category}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save Categories
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategorySelectionDialog;
