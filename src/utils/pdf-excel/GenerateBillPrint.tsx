import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill } from '../../types/bills';
import numberToWords from 'number-to-words';
import { useEffect } from 'react';

interface GenerateBillPrintProps {
  bill: Bill;
  businessDetails?: {
    businessName: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessPostalCode: number | string;
    businessPhone: number[] | string;
    businessEmail: string;
    businessGSTIN: string;
  };
}

const convertToWords = (amount: number): string => {
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);

  const wholeWords = numberToWords.toWords(wholePart);
  const formattedWholeWords = wholeWords.charAt(0).toUpperCase() + wholeWords.slice(1);

  if (decimalPart > 0) {
    const decimalWords = numberToWords.toWords(decimalPart);
    return `${formattedWholeWords} Rupees and ${decimalWords} Paise Only`;
  }

  return `${formattedWholeWords} Rupees Only`;
};

const formatPhoneNumbers = (phones: number[] | string | undefined): string => {
  if (!phones) return 'N/A';
  if (typeof phones === 'string') return phones;
  return phones.join(', ');
};

const GenerateBillPrint: React.FC<GenerateBillPrintProps> = ({ bill, businessDetails }) => {
  useEffect(() => {
    const generatePDF = () => {
      // Create new document with A7 size and proper margins
      const doc = new jsPDF({
        format: 'a7',
        unit: 'mm',
        orientation: 'portrait'
      });

      // Increase margin for better print results
      const margin = 5; // Increased from 3 to 5 for better print margins
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;

      // Header with business details
      doc.setFontSize(8);
      doc.text('|| SHREE GANESHAY NAMAH ||', pageWidth / 2, margin + 3, { align: 'center' });

      doc.setFontSize(10);
      doc.text(businessDetails?.businessName || 'N.K.SAREE', pageWidth / 2, margin + 8, { align: 'center' });

      doc.setFontSize(6);
      doc.text(businessDetails?.businessAddress || 'JUGSALAI, JAMSHEDPUR-831006', pageWidth / 2, margin + 13, { align: 'center' });
      doc.text(
        `${businessDetails?.businessCity || ''} ${businessDetails?.businessState || ''} ${
          businessDetails?.businessPostalCode || ''
        }`.trim(),
        pageWidth / 2,
        margin + 16,
        { align: 'center' }
      );
      doc.text(`Ph: ${formatPhoneNumbers(businessDetails?.businessPhone)}`, pageWidth / 2, margin + 19, { align: 'center' });
      doc.text(`GSTIN: ${businessDetails?.businessGSTIN || '20AALFN6748B1ZH'}`, pageWidth / 2, margin + 22, { align: 'center' });

      // Invoice title with return bill indication
      doc.setFontSize(8);
      doc.text(bill.isReturn ? 'RETURN - INVOICE' : 'TAXABLE - INVOICE', pageWidth / 2, margin + 27, { align: 'center' });
      
      if (bill.isReturn && bill.originalBillId) {
        doc.setFontSize(6);
        doc.text(`(Original Bill: ${bill.originalBillId})`, pageWidth / 2, margin + 31, { align: 'center' });
      }

      // Add a small divider line
      doc.setLineWidth(0.1);
      doc.line(margin, margin + 33, pageWidth - margin, margin + 33);

      // Customer & Invoice details
      doc.setFontSize(6);
      doc.text(`Name: ${bill.customerName || 'Walk-in Customer'}`, margin, margin + 37);
      doc.text(`Phone: ${bill.customerPhone || 'N/A'}`, margin, margin + 40);
      doc.text(`Invoice No: ${bill.billId}`, pageWidth - margin, margin + 37, { align: 'right' });
      doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, pageWidth - margin, margin + 40, { align: 'right' });

      // Reference to store the finalY after table drawing
      let tableEndY = 0;

      // Items table - simplified
      autoTable(doc, {
        head: [['Item', 'Qty', 'Rate', 'Amount']],
        body: bill.items.map((item) => [
          `${item.productName}\n(${item.productCode})`,
          item.quantity.toString(),
          `${item.price.toFixed(2)}`,
          `${Math.abs(item.totalPrice).toFixed(2)}`
        ]),
        startY: margin + 42,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 6,
          cellPadding: 1.5, // Increased padding for better readability
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.4 },
          1: { halign: 'center', cellWidth: contentWidth * 0.1 },
          2: { halign: 'right', cellWidth: contentWidth * 0.2 },
          3: { halign: 'right', cellWidth: contentWidth * 0.3 }
        },

        // Draw a border around the table - safely handling null cursor
        didDrawPage: (data) => {
          // Get table dimensions
          const tableLeft = data.settings.margin.left;
          const tableTop = data.settings.startY;

          // Safe access of cursor y position
          const tableBottom = data.cursor?.y || tableTop + 20; // Default height if cursor is null
          tableEndY = tableBottom; // Store for later use

          const tableWidth = pageWidth - margin * 2;

          // Draw rectangle around the table
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.1);
          doc.rect(tableLeft, tableTop, tableWidth, tableBottom - tableTop);
        }
      });

      // Get final position after table drawing
      const finalY = (doc as any).lastAutoTable.finalY || tableEndY;

      // Add a small space after the table
      const summaryStartY = finalY + 3;

      // Summary section with clean lines
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(pageWidth - 35, summaryStartY, pageWidth - margin, summaryStartY);

      // Total calculations
      doc.text('Subtotal:', pageWidth - 25, summaryStartY + 3);
      doc.text(`${bill.subtotal.toFixed(2)}`, pageWidth - margin, summaryStartY + 3, { align: 'right' });
      doc.text('GST (5%):', pageWidth - 25, summaryStartY + 6);
      doc.text(`${bill.tax.toFixed(2)}`, pageWidth - margin, summaryStartY + 6, { align: 'right' });

      // Draw line before grand total
      doc.setLineWidth(0.2);
      doc.line(pageWidth - 35, summaryStartY + 7.5, pageWidth - margin, summaryStartY + 7.5);

      // Grand total with slightly larger font
      doc.setFontSize(7);
      doc.text('Total:', pageWidth - 25, summaryStartY + 11);
      doc.text(`${bill.total.toFixed(2)}`, pageWidth - margin, summaryStartY + 11, { align: 'right' });
      doc.setFontSize(6);

      // Amount in words
      doc.text('Amount in words:', margin, summaryStartY + 15);
      doc.text(convertToWords(bill.total), margin, summaryStartY + 18);

      // Footer
      doc.setFontSize(5);
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.1);
      doc.line(margin, summaryStartY + 21, pageWidth - margin, summaryStartY + 21);

      doc.text('Terms & Conditions:', margin, summaryStartY + 24);
      doc.text('1. Goods once sold will not be taken back.', margin, summaryStartY + 27);
      doc.text('2. Subject to local jurisdiction.', margin, summaryStartY + 30);

      // Bank details
      doc.text('Bank: BANK OF INDIA', margin, summaryStartY + 34);
      doc.text('A/C: 450020110000775', margin, summaryStartY + 37);
      doc.text('IFSC: BKID0004500', margin, summaryStartY + 40);

      // Signature
      doc.text('For - ' + (businessDetails?.businessName || 'N.K.SAREE'), pageWidth - margin, summaryStartY + 40, { align: 'right' });
      doc.text('Authorized Signatory', pageWidth - margin, summaryStartY + 43, { align: 'right' });

      // Open PDF in new window optimized for direct printing
      const pdfOutput = doc.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice #${bill.billId}</title>
              <style>
                /* Hide UI elements when printing */
                @media print {
                  .no-print { display: none !important; }
                  body { margin: 0; padding: 0; }
                  iframe { width: 100% !important; height: 100% !important; border: none !important; }
                }
                
                /* Style for screen view */
                body { 
                  margin: 0; 
                  padding: 0; 
                  display: flex; 
                  flex-direction: column; 
                  align-items: center; 
                  background-color: #f5f5f5;
                  font-family: Arial, sans-serif;
                }
                .container {
                  max-width: 100%;
                  width: 100%;
                  padding: 20px;
                  box-sizing: border-box;
                }
                iframe {
                  width: 100%;
                  height: 500px;
                  border: 1px solid #ccc;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  background-color: white;
                }
                .controls {
                  margin-top: 15px;
                  text-align: center;
                  padding: 10px;
                  background-color: white;
                  border-radius: 5px;
                  box-shadow: 0 0 5px rgba(0,0,0,0.05);
                }
                button {
                  padding: 8px 16px;
                  margin: 0 5px;
                  cursor: pointer;
                  background-color: #4CAF50;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  font-weight: bold;
                }
                button:hover {
                  background-color: #45a049;
                }
                .print-note {
                  font-size: 12px;
                  color: #666;
                  margin-top: 8px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <iframe src="${pdfOutput}" id="pdf-frame"></iframe>
                <div class="controls no-print">
                  <button onclick="printInvoice()">Print Invoice</button>
                  <button onclick="downloadPDF()">Download PDF</button>
                  <div class="print-note">
                    Note: For best results, select "Actual Size" in print options.
                  </div>
                </div>
              </div>
              <script>
                function printInvoice() {
                  const iframe = document.getElementById('pdf-frame');
                  
                  // If browser supports iframe printing
                  if (iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete') {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                  } else {
                    // Fallback to printing the whole page
                    window.print();
                  }
                }
                
                function downloadPDF() {
                  const link = document.createElement('a');
                  link.href = '${pdfOutput}';
                  link.download = 'Invoice-${bill.billId}.pdf';
                  link.click();
                }
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    };

    generatePDF();
  }, [bill, businessDetails]);

  return null;
};

export default GenerateBillPrint;
