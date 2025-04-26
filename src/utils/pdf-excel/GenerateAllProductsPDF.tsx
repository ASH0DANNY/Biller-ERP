import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAllProductsPDF = (columns: any[], data: any[]) => {
  const doc = new jsPDF();
  const tableColumnHeaders = columns.map((col) => col.title);
  const tableRows = data.map((row) => columns.map((col) => row[col.field] || ''));

  doc.text('Product List', 14, 10); // Title
  autoTable(doc, {
    head: [tableColumnHeaders],
    body: tableRows,
    startY: 20,
  });
  doc.save('Product_List.pdf'); // Save the PDF
};
