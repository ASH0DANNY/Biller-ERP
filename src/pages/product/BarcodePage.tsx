import MaterialTable from '@material-table/core';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { productType, productBarcodeType } from '../../types/product';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { GenerateBarcode } from '../../utils/pdf-excel/GenerateBarcode';
import { useUserCategories } from 'hooks/useUserCategories';

const BarcodePage = () => {
  const [products, setProducts] = useState<(productType & { id: string })[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<(productType & { id: string })[]>([]);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copies, setCopies] = useState(1);
  const [isPreview, setIsPreview] = useState(false);

  const userCategories = useUserCategories();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              product_id: data.product_id || '',
              productName: data.productName || '',
              productCode: data.productCode || 0,
              product_selling_price: data.product_selling_price || 0,
              product_cost_price: data.product_cost_price || 0,
              product_mrp_price: data.product_mrp_price || 0,
              category: {
                categoryName: data.category?.categoryName || '',
                subCategories: data.category?.subCategories || []
              },
              quantity: data.quantity || 0,
              dealerName: data.dealerName || ''
            } as productType & { id: string };
          })
          .filter((product) => userCategories.includes(product.category.categoryName));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (userCategories.length > 0) {
      fetchProducts();
    }
  }, [userCategories]); // Add userCategories as dependency

  const handleBarcodeButtonClick = (preview: boolean) => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }
    setIsPreview(preview);
    setCopyDialogOpen(true);
  };

  const handleGenerateBarcode = () => {
    const barcodeProducts: productBarcodeType[] = [];
    selectedProducts.forEach((product) => {
      for (let i = 0; i < copies; i++) {
        barcodeProducts.push({
          product_data: {
            doc_id: product.id,
            product_id: product.product_id,
            productName: product.productName,
            productCode: product.productCode,
            product_selling_price: product.product_selling_price,
            product_cost_price: product.product_cost_price,
            product_mrp_price: product.product_mrp_price,
            category: product.category,
            quantity: product.quantity,
            dealerName: product.dealerName || ''
          },
          product_size: '',
          product_color: '',
          product_weight: 0
        });
      }
    });

    GenerateBarcode(barcodeProducts, isPreview);
    setCopyDialogOpen(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<QrCodeIcon />}
          onClick={() => handleBarcodeButtonClick(true)}
          disabled={selectedProducts.length === 0}
        >
          Preview Barcode
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<QrCodeIcon />}
          onClick={() => handleBarcodeButtonClick(false)}
          disabled={selectedProducts.length === 0}
        >
          Generate & Save ({selectedProducts.length})
        </Button>
      </div>

      <MaterialTable
        title="Select Products for Barcode"
        columns={[
          {
            title: 'Product ID',
            field: 'product_id',
            cellStyle: { textAlign: 'center' },
            headerStyle: { textAlign: 'center' }
          },
          {
            title: 'Name',
            field: 'productName',
            cellStyle: { textAlign: 'center' },
            headerStyle: { textAlign: 'center' }
          },
          {
            title: 'Category',
            field: 'category.categoryName',
            cellStyle: { textAlign: 'center' },
            headerStyle: { textAlign: 'center' }
          },
          {
            title: 'MRP',
            field: 'product_mrp_price',
            type: 'numeric',
            cellStyle: { width: '60px', textAlign: 'center' },
            headerStyle: { width: '60px', textAlign: 'center' }
          },
          {
            title: 'Selling Price',
            field: 'product_selling_price',
            type: 'numeric',
            cellStyle: { width: '60px', textAlign: 'center' },
            headerStyle: { width: '60px', textAlign: 'center' }
          }
        ]}
        data={products}
        options={{
          selection: true,
          grouping: true,
          headerStyle: {
            backgroundColor: '#5d87ff',
            color: '#FFF'
          },
          rowStyle: (rowData) => ({
            backgroundColor: selectedProducts.find((p) => p.id === rowData.id) ? '#EEE' : '#FFF'
          })
        }}
        onSelectionChange={(rows) => {
          setSelectedProducts(rows as (productType & { id: string })[]);
        }}
      />

      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)}>
        <DialogTitle>Number of Copies</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Number of copies for each barcode"
            type="number"
            fullWidth
            value={copies}
            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleGenerateBarcode} color="primary">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BarcodePage;
