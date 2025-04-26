import { Button, TextField, Grid, Paper, Select, FormControl, FormHelperText, MenuItem, Dialog } from '@mui/material';
import { Theme } from '@mui/material/styles';
import AnimateButton from 'components/@extended/AnimateButton';
import { productCategories, productType } from 'types/product';
import { useUserCategories } from 'hooks/useUserCategories';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addProduct } from 'store/reducers/product-reducer';
import BarcodeScannerComponent from 'react-qr-barcode-scanner'; // Import the barcode scanner
import { useState } from 'react';

const AddProduct = () => {
  const SeperatorHeader = styled('div')(({ theme }: { theme: Theme }) => ({
    margin: '15px 0',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'uppercase',
    color: 'Black',
    padding: 6,
    width: '100%'
  }));
  const dispatch = useDispatch();

  const [openScanner, setOpenScanner] = useState(false); // State to control the scanner dialog

  const validationSchema = yup.object({
    productName: yup.string().required('Product Name is required'),
    productCode: yup.string().required('Product Code is required'),
    product_selling_price: yup.number().required('Selling Price is required'),
    product_cost_price: yup.number().required('Cost Price is required'),
    product_mrp_price: yup.number().required('MRP is required'),
    category: yup.object().shape({
      categoryName: yup.string().required('Category is required'),
      subCategories: yup.array().of(yup.string())
    }),
    quantity: yup.number().required('Quantity is required'),
    expiryDate: yup.date().nullable().optional(),
    dealerName: yup.string().required('Dealer name is required').optional()
  });

  const generateProductCode = () => {
    const chars = '0123456789';
    let productCode = '';
    for (let i = 0; i < 12; i++) {
      productCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    formik.setFieldValue('productCode', parseInt(productCode, 10)); // Update formik field
  };

  const userCategories = useUserCategories();

  const formik = useFormik<productType>({
    initialValues: {
      doc_id: '',
      product_id: '',
      productName: '',
      productCode: '',
      product_selling_price: 0,
      product_cost_price: 0,
      product_mrp_price: 0,
      category: {
        categoryName: '',
        subCategories: []
      },
      quantity: 0,
      dealerName: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // @ts-ignore
      dispatch(addProduct(values))
        .unwrap()
        .then(() => {
          alert('Product added successfully');
          resetForm();
        })
        .catch((error: any) => {
          console.error('Error adding product: ', error);
          alert('Failed to add product');
        });
    }
  });

  return (
    <Paper sx={{ padding: '10px 30px', margin: '0px 10px ' }} elevation={3}>
      <div style={{ marginTop: '4px' }}>
        <SeperatorHeader>Product Detail</SeperatorHeader>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              name="productName"
              label="Product Name"
              value={formik.values.productName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.productName && Boolean(formik.errors.productName)}
              helperText={formik.touched.productName && formik.errors.productName}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="productCode"
              label="Product Code"
              value={formik.values.productCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.productCode && Boolean(formik.errors.productCode)}
              helperText={formik.touched.productCode && formik.errors.productCode}
            />
            <Button onClick={generateProductCode}>Random Generate</Button>
            <Button onClick={() => setOpenScanner(true)}>Scan Barcode</Button> {/* Open scanner dialog */}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="product_selling_price"
              label="Selling Price"
              type="number"
              value={formik.values.product_selling_price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.product_selling_price && Boolean(formik.errors.product_selling_price)}
              helperText={formik.touched.product_selling_price && formik.errors.product_selling_price}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="product_cost_price"
              label="Cost Price"
              type="number"
              value={formik.values.product_cost_price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.product_cost_price && Boolean(formik.errors.product_cost_price)}
              helperText={formik.touched.product_cost_price && formik.errors.product_cost_price}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="product_mrp_price"
              label="MRP"
              type="number"
              value={formik.values.product_mrp_price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.product_mrp_price && Boolean(formik.errors.product_mrp_price)}
              helperText={formik.touched.product_mrp_price && formik.errors.product_mrp_price}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl error={formik.touched.category && Boolean(formik.errors.category)} fullWidth>
              <Select
                name="category.categoryName"
                value={formik.values.category.categoryName}
                onChange={(e) => {
                  const selectedCategory = productCategories.find((cat) => cat.category === e.target.value);
                  formik.setFieldValue('category', {
                    categoryName: e.target.value,
                    subCategories: selectedCategory?.subcategory || []
                  });
                }}
                onBlur={formik.handleBlur}
                displayEmpty
              >
                <MenuItem value="">--Select Category--</MenuItem>
                {productCategories
                  .filter((cat) => userCategories.includes(cat.category))
                  .map((category) => (
                    <MenuItem key={category.category} value={category.category}>
                      {category.category}
                    </MenuItem>
                  ))}
              </Select>
              {formik.touched.category && formik.errors.category && <FormHelperText>{formik.errors.category as string}</FormHelperText>}
            </FormControl>
            {formik.values.category.categoryName && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  name="category.subCategories"
                  value={formik.values.category.subCategories[0] || ''}
                  onChange={(e) => {
                    formik.setFieldValue('category.subCategories', [e.target.value]);
                  }}
                  displayEmpty
                >
                  <MenuItem value="">--Select Subcategory--</MenuItem>
                  {productCategories
                    .find((cat) => cat.category === formik.values.category.categoryName)
                    ?.subcategory.map((subCategory: string) => (
                      <MenuItem key={subCategory} value={subCategory}>
                        {subCategory}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.quantity && Boolean(formik.errors.quantity)}
              helperText={formik.touched.quantity && formik.errors.quantity}
            />
          </Grid>
        </Grid>
        <br />
        <br />
        <SeperatorHeader>Other Details</SeperatorHeader>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              name="dealerName"
              label="Dealer name"
              type="text"
              value={formik.values.dealerName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dealerName && Boolean(formik.errors.dealerName)}
              helperText={formik.touched.dealerName && formik.errors.dealerName}
            />
          </Grid>
        </Grid>
        <Grid container sx={{ display: 'flex', justifyContent: 'end' }} spacing={2}>
          <Grid item>
            <AnimateButton>
              <Button fullWidth size="large" variant="contained" color="primary" onClick={() => formik.resetForm()}>
                RESET
              </Button>
            </AnimateButton>
          </Grid>
          <Grid item>
            <AnimateButton>
              <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary">
                SUBMIT
              </Button>
            </AnimateButton>
          </Grid>
        </Grid>
      </form>

      {/* Barcode Scanner Dialog */}
      <Dialog open={openScanner} onClose={() => setOpenScanner(false)}>
        <BarcodeScannerComponent
          width={500}
          height={500}
          onUpdate={(err, result) => {
            if (result) {
              formik.setFieldValue('productCode', result?.getText() || ''); // Set the scanned barcode value
              setOpenScanner(false); // Close the scanner dialog
            }
          }}
        />
        <Button onClick={() => setOpenScanner(false)}>Close</Button>
      </Dialog>
    </Paper>
  );
};

export default AddProduct;
