import { useState, useRef } from "react";
import { Bill, BillWithItems } from "@/data/models";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";
import { generatePDF, formatBillNumber } from "@/utils/pdfGenerator";

interface BillReceiptProps {
  bill: Bill | null;
  open: boolean;
  onClose: () => void;
}

export const BillReceipt = ({ bill, open, onClose }: BillReceiptProps) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (!bill) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Receipt</span>
            <div className="text-sm font-normal text-gray-500">No bill selected</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <p>No bill data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol'
    }).format(amount).replace('₹', '₹ ');
  };

  const createdAtStr = bill.createdAt && typeof bill.createdAt === 'string'
    ? bill.createdAt
    : new Date().toISOString();

  const billDate = new Date(createdAtStr);
  const isValidDate = !isNaN(billDate.getTime());

  const formattedDate = isValidDate
    ? billDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

  const formattedTime = isValidDate
    ? billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const simpleBillNumber = formatBillNumber(bill.id);

  const totalMRP = bill.items?.reduce((sum, item) => {
    const price = item.productPrice || (item.product ? item.product.price : 0);
    return sum + (price * item.quantity);
  }, 0) || 0;

  const discountedTotal = bill.total || totalMRP;

  const handlePrint = () => {
    if (!receiptRef.current) return;

    setIsPrinting(true);

    try {
      const billWithItems: BillWithItems = {
        ...bill,
        items: bill.items || [],
        subtotal: bill.subtotal || 0,
        tax: bill.tax || 0,
        total: bill.total || 0,
        paymentMethod: bill.paymentMethod || 'cash'
      };

      const pdfBlob = generatePDF(billWithItems);

      const pdfUrl = URL.createObjectURL(pdfBlob);

      const printWindow = window.open(pdfUrl, '_blank');

      if (printWindow) {
        printWindow.addEventListener('load', () => {
          try {
            setTimeout(() => {
              printWindow.print();
              printWindow.onafterprint = () => {
                setTimeout(() => {
                  printWindow.close();
                  setIsPrinting(false);
                }, 1000);
              };
            }, 2000);
          } catch (printError) {
            console.error("Print error:", printError);
            toast({
              title: "Print Failed",
              description: "There was an error printing the receipt. Please try the download option instead.",
              variant: "destructive",
            });
            setIsPrinting(false);
          }
        });

        toast({
          title: "Receipt Prepared",
          description: "The receipt has been prepared for printing.",
        });
      } else {
        toast({
          title: "Print Failed",
          description: "Could not open print window. Please check your browser settings.",
          variant: "destructive",
        });

        window.open(pdfUrl, '_blank');
        setIsPrinting(false);
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Failed",
        description: "There was an error printing the receipt. Please try again.",
        variant: "destructive",
      });
      setIsPrinting(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!bill.customerPhone) {
      toast({
        title: "Cannot send WhatsApp",
        description: "Customer phone number is required to send bill via WhatsApp.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      const billWithItems: BillWithItems = {
        ...bill,
        items: bill.items || [],
        subtotal: bill.subtotal || 0,
        tax: bill.tax || 0,
        total: bill.total || 0,
        paymentMethod: bill.paymentMethod || 'cash'
      };

      await sendBillToWhatsApp(billWithItems);
      toast({
        title: "Receipt sent",
        description: `Receipt has been sent to ${bill.customerPhone} via WhatsApp.`,
      });
    } catch (error) {
      toast({
        title: "Failed to send receipt",
        description: "There was an error sending the receipt via WhatsApp.",
        variant: "destructive"
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      const billWithItems: BillWithItems = {
        ...bill,
        items: bill.items || [],
        subtotal: bill.subtotal || 0,
        tax: bill.tax || 0,
        total: bill.total || 0,
        paymentMethod: bill.paymentMethod || 'cash'
      };

      const pdfBlob = generatePDF(billWithItems);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vivaas-Receipt-${simpleBillNumber}.pdf`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Receipt Downloaded",
        description: `Receipt has been downloaded as Vivaas-Receipt-${simpleBillNumber}.pdf`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Receipt Download Failed",
        description: "There was an error downloading the receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!bill.items || bill.items.length === 0) {
    console.warn("No items found in bill:", bill.id);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span></span>
          <div className="text-sm font-normal text-gray-500">Bill #{simpleBillNumber}</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto">
        <div ref={receiptRef} className="text-center">
          <img 
            src="/lovable-uploads/ac58d961-7833-46c0-b5a4-fd5650245900.png"
            alt="Vivaa's Logo" 
            className="h-24 mx-auto mb-2"
          />
          <div className="text-sm text-gray-600">Shiv Park Phase 2 Shop No-6-7 Pune Solapur Road</div>
          <div className="text-sm text-gray-600">Lakshumi Colony Opp. HDFC Bank Near Angle School, Pune - 412307</div>
          <div className="text-sm text-gray-600">9657171777 | 9765971717</div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          <div className="text-left">
            <div className="flex justify-between">
              <div><strong>Bill No:</strong> {simpleBillNumber}</div>
              <div><strong>Date:</strong> {formattedDate}</div>
            </div>
            <div className="flex justify-between">
              <div><strong>Counter:</strong> 1</div>
              <div><strong>Time:</strong> {formattedTime}</div>
            </div>
          </div>

          <div className="text-left text-sm mt-2">
            <div><strong>Customer:</strong> {bill.customerName || "Walk-in Customer"}</div>
            {bill.customerPhone && <div><strong>Phone:</strong> {bill.customerPhone}</div>}
            {bill.customerEmail && <div><strong>Email:</strong> {bill.customerEmail}</div>}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          <table className="receipt-items w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-medium py-1">Particulars</th>
                <th className="text-center font-medium py-1">Qty</th>
                <th className="text-right font-medium py-1">MRP</th>
                <th className="text-right font-medium py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items && bill.items.map((item, index) => {
                const mrp = item.productPrice || (item.product ? item.product.price : 0);
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-1">{item.productName || (item.product ? item.product.name.toUpperCase() : "Unknown")}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">{formatCurrency(mrp)}</td>
                    <td className="text-right py-1">{formatCurrency(mrp * item.quantity)}</td>
                  </tr>
                );
              })}
              {(!bill.items || bill.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-3">No items in this bill</td>
                </tr>
              )}
            </tbody>
          </table>

          {((bill.discountAmount && bill.discountAmount > 0) || (bill.discountValue && bill.discountValue > 0)) && (
            <div className="text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-green-700 font-medium">
                  Discount
                </span>
                <span className="text-green-700 font-medium">
                  - {formatCurrency(bill.discountAmount || 0)}
                </span>
              </div>
            </div>
          )}

          <div className="text-left text-sm">
            <div className="flex justify-between py-1 border-t border-gray-200">
              <span><strong>Qty:</strong> {bill.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
              <span><strong>Total:</strong> {formatCurrency(discountedTotal)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold">
              <span>Total:</span>
              <span>{formatCurrency(bill.total || 0)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-3"></div>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Thank you for shopping with us</p>
            <p>Please visit again..!</p>
            <p>*** Have A Nice Day ***</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 mt-auto">
        <div className="flex flex-col w-full gap-2">
          <Button onClick={handlePrint} className="w-full justify-start" style={{ backgroundColor: '#ea384c', color: 'white' }} disabled={isPrinting}>
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print Receipt
          </Button>

          {bill.customerPhone && (
            <Button
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              variant="outline"
              className="w-full justify-start"
              style={{ borderColor: '#ea384c', color: '#ea384c' }}
            >
              {isSendingWhatsApp ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Send via WhatsApp
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            style={{ borderColor: '#ea384c', color: '#ea384c' }}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Receipt
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
