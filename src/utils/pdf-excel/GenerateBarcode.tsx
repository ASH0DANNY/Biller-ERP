import { productBarcodeType } from '../../types/product';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

export const GenerateBarcode = (selectedProducts: productBarcodeType[], preview: boolean = false) => {
  if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
    throw new Error('Invalid products data provided');
  }

  const doc = new jsPDF();
  // const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const cardWidth = 60;
  const cardHeight = 35;
  const margin = 10;
  const columns = 3;
  const spacing = 5; // Spacing between cards

  let xPos = margin;
  let yPos = margin;
  let currentColumn = 0;

  selectedProducts.forEach((product, index) => {
    if (!product.product_data?.productCode) {
      console.warn(`Skipping product at index ${index}: Invalid product code`);
      return;
    }

    try {
      // Border
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.rect(xPos, yPos, cardWidth, cardHeight);

      doc.setFontSize(7);
      doc.text(product.product_data.category.categoryName.substring(0, 15), xPos + 2, yPos + 4);
      doc.text(product.product_data.productName.substring(0, 15), xPos + 2, yPos + 8);

      // Generating barcode
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, product.product_data.productCode.toString(), {
        format: 'CODE128',
        width: 2,
        height: 30,
        displayValue: true,
        fontSize: 8,
        fontOptions: 'normal',
        margin: 0,
        background: '#ffffff',
        lineColor: '#000000',
        textMargin: 2,
        valid: (valid: boolean) => {
          if (!valid) {
            console.warn(`Invalid barcode value for product: ${product.product_data.productCode}`);
          }
        }
      });

      // Adding barcode
      const imgData = canvas.toDataURL('image/png', 1.0);
      doc.addImage(imgData, 'PNG', xPos + 2, yPos + 10, cardWidth - 4, cardHeight - 18);

      const bottomY = yPos + cardHeight - 3;
      doc.setFontSize(6);
      doc.text(`MRP:₹${product.product_data.product_mrp_price}`, xPos + 2, bottomY);
      doc.text(product.product_color || 'N/A', xPos + cardWidth / 2 - 5, bottomY);
      doc.text(product.product_size || 'N/A', xPos + cardWidth - 12, bottomY);

      // Positions for 3 columns
      currentColumn++;
      if (currentColumn === columns) {
        currentColumn = 0;
        xPos = margin;
        yPos += cardHeight + spacing;

        if (yPos > pageHeight - (cardHeight + margin)) {
          doc.addPage();
          yPos = margin;
        }
      } else {
        xPos += cardWidth + spacing;
      }
    } catch (error) {
      console.error(`Error generating barcode for product ${product.product_data.productCode}:`, error);
    }
  });

  if (preview) {
    // Open PDF in new window
    const pdfOutput = doc.output('datauristring');
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfOutput}'></iframe>`);
    }
  } else {
    doc.save('product-barcodes.pdf');
  }

  return doc;
};
