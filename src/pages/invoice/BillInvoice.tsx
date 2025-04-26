import { Button, Box } from '@mui/material';
import { Print } from '@mui/icons-material';
const handlePrint = () => {
  window.print();
};

const BillInvoice = () => {
  return (
    <>
      <Box display="flex" justifyContent="center" p={2}>
        <Button variant="contained" color="primary" startIcon={<Print />} onClick={handlePrint}>
          Print Bill Invoice
        </Button>
      </Box>
    </>
  );
};

export default BillInvoice;
