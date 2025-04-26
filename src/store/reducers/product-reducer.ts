import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { productType as BaseProductType } from 'types/product';

interface productType extends BaseProductType {
  id: string;
}

interface productstate {
  productArray: productType[];
  loading: boolean;
  error: string | null;
}

interface StockUpdateItem {
  productCode: string;
  quantity: number;
}

const generateUidID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let doc_id = '';
  for (let i = 0; i < 28; i++) {
    doc_id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return doc_id;
};
const doc_id = generateUidID();

//add product
export const addProduct = createAsyncThunk<productType, productType>('product/addProduct', async (product) => {
  try {
    const newProduct = {
      ...product,
      product_id: doc_id,
      createdAt: new Date().toISOString(),
      doc_id: doc_id
    };
    await setDoc(doc(db, 'products', doc_id), newProduct);
    return { ...newProduct, id: doc_id };
  } catch (error) {
    console.error('Error adding product: ', error);
    alert('Failed to add product');
    throw error;
  }
});

//FETCH product
export const fetchproduct = createAsyncThunk<productType[], void>('product/fetchProducts', async () => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const product: productType[] = [];
  querySnapshot.forEach((doc) => {
    product.push({ ...(doc.data() as productType), product_id: doc.id });
  });
  return product;
});
// delete product
export const deleteProduct = createAsyncThunk<void, string>('product/deleteProduct', async (id) => {
  await deleteDoc(doc(db, 'products', id));
});

// New thunk to update product stock
export const updateProductStock = createAsyncThunk<productType[], StockUpdateItem[]>('product/updateStock', async (items, { getState, dispatch }) => {
  try {
    const state = getState() as { products: productstate };
    const products = state.products.productArray;

    // Create an array of update promises
    const updatePromises = items.map(async (item) => {
      // Find the product in state
      const product = products.find(p => p.productCode === item.productCode);

      if (!product) {
        throw new Error(`Product not found with code: ${item.productCode}`);
      }

      // Calculate new quantity after sale
      const newQuantity = Math.max(0, product.quantity - item.quantity);

      // Update in Firestore
      const productRef = doc(db, 'products', product.product_id);
      await updateDoc(productRef, { quantity: newQuantity });

      // Return updated product
      return {
        ...product,
        quantity: newQuantity
      };
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Fetch fresh data
    return dispatch(fetchproduct()).unwrap();
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
});

// Add updateProduct thunk
export const updateProduct = createAsyncThunk<productType, { id: string; data: Partial<productType> }>(
  'product/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const productRef = doc(db, 'products', id);

      // Get current product data first
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        throw new Error('Product not found');
      }

      // Merge existing data with updates
      const updatedProduct = {
        ...productSnap.data(),
        ...data,
        product_id: id
      };

      // Update in Firebase
      await updateDoc(productRef, updatedProduct);

      // Return the complete updated product
      return updatedProduct as productType;
    } catch (error) {
      console.error('Error updating product:', error);
      return rejectWithValue((error as Error).message || 'Failed to update product');
    }
  }
);

const initialState: productstate = {
  productArray: [],
  loading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.productArray.push(action.payload); // Add the new product to the array
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      //fetch product
      .addCase(fetchproduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchproduct.fulfilled, (state, action: PayloadAction<productType[]>) => {
        state.loading = false;
        state.productArray = action.payload;
      })
      .addCase(fetchproduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      //delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.productArray = state.productArray.filter((product) => product.product_id !== action.meta.arg);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      // New cases for updateProductStock
      .addCase(updateProductStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.loading = false;
        state.productArray = action.payload;
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.productArray.findIndex(p => p.product_id === action.payload.product_id);
        if (index !== -1) {
          state.productArray[index] = { ...state.productArray[index], ...action.payload };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  }
});

export default productsSlice.reducer;