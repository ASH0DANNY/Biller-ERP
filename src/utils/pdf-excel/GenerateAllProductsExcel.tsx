import * as XLSX from 'xlsx';

export const generateAllProductsExcel = (columns: any[], data: any[]) => {
  // const headers = columns.map((col) => col.title);
  const rows = data.map((row) =>
    columns.reduce((acc, col) => {
      acc[col.title] = row[col.field] || '';
      return acc;
    }, {})
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, 'Product_List.xlsx'); // Save the Excel file
};
