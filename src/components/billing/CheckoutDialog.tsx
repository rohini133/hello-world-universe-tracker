
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";
import { BillWithItems } from "@/data/models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generatePDF, formatBillNumber } from "@/utils/pdfGenerator";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: BillWithItems | null;
  subtotal: number;
  tax: number;
  total: number;
  discountAmount?: number;
  discountType?: "percent" | "amount";
  discountValue?: number;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  onCustomerInfoChange: (info: any) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onCreateBill: () => void;
}

export const CheckoutDialog = ({
  open,
  onOpenChange,
  bill,
  subtotal,
  tax,
  total,
  discountAmount,
  discountType,
  discountValue,
  customerInfo,
  onCustomerInfoChange,
  paymentMethod,
  onPaymentMethodChange,
  onCreateBill
}: CheckoutDialogProps) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Determine if we're in pre-checkout (collecting info) or post-checkout (showing receipt options)
  const isPostCheckout = !!bill;
  
  const handleCustomerInfoChange = (field: string, value: string) => {
    onCustomerInfoChange({
      ...customerInfo,
      [field]: value
    });
  };

  // Post-checkout UI (receipt options)
  if (isPostCheckout && bill) {
    console.log("CheckoutDialog received bill:", bill);
    console.log("Bill has items:", bill.items?.length || 0);

    const simpleBillNumber = formatBillNumber(bill.id);

    const handleSendWhatsApp = async () => {
      if (!bill.customerPhone) {
        toast({
          title: "WhatsApp receipt requires phone number",
          description: "Customer phone number is required to send receipt via WhatsApp.",
          variant: "destructive",
        });
        return;
      }
      
      setIsSendingWhatsApp(true);
      try {
        await sendBillToWhatsApp(bill);
        
        toast({
          title: "WhatsApp Receipt Sent",
          description: `The receipt has been sent to ${bill.customerPhone}`,
        });
      } catch (error) {
        toast({
          title: "Failed to send WhatsApp",
          description: "There was an error sending the bill via WhatsApp. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSendingWhatsApp(false);
      }
    };

    const handlePrintReceipt = () => {
      setIsPrinting(true);
      
      try {
        const pdfBlob = generatePDF(bill);
        
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        const printWindow = window.open(pdfUrl, '_blank');
        
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            try {
              setTimeout(() => {
                printWindow.print();
                setTimeout(() => {
                  printWindow.close();
                  setIsPrinting(false);
                }, 2000);
              }, 1000);
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

    const handleDownloadReceipt = () => {
      if (!bill.id) {
        toast({
          title: "Download Failed",
          description: "Invalid bill information. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setIsDownloading(true);
      
      try {
        const pdfBlob = generatePDF(bill);
        
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
          description: "The receipt has been downloaded as a PDF file.",
        });
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "Download Failed",
          description: "There was an error generating the receipt. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bill Generated Successfully</DialogTitle>
            <DialogDescription>
              Bill #{simpleBillNumber} has been created and inventory has been updated.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <p className="mb-4">What would you like to do next?</p>
            
            <Button 
              className="w-full"
              variant="destructive"
              onClick={handlePrintReceipt}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              Print Receipt
            </Button>
            
            <Button 
              className="w-full"
              variant="default"
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download Receipt
            </Button>
            
            {bill.customerPhone && (
              <Button 
                className="w-full"
                variant="destructive"
                onClick={handleSendWhatsApp}
                disabled={isSendingWhatsApp}
              >
                {isSendingWhatsApp ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Send Receipt via WhatsApp
              </Button>
            )}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Return to Billing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Pre-checkout UI (customer information form)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Enter customer information to complete the checkout process.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              value={customerInfo.name}
              onChange={(e) => handleCustomerInfoChange("name", e.target.value)}
              placeholder="Enter customer name"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="customer-phone">Phone Number</Label>
            <Input
              id="customer-phone"
              value={customerInfo.phone}
              onChange={(e) => handleCustomerInfoChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="customer-email">Email (optional)</Label>
            <Input
              id="customer-email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleCustomerInfoChange("email", e.target.value)}
              placeholder="Enter email address"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={onPaymentMethodChange}
            >
              <SelectTrigger id="payment-method" className="mt-1">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="digital-wallet">Digital Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Subtotal:</span>
            <span className="text-sm">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Tax:</span>
            <span className="text-sm">₹{tax.toFixed(2)}</span>
          </div>
          {discountAmount && discountAmount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-sm text-green-500">Discount:</span>
              <span className="text-sm text-green-500">-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onCreateBill}
            disabled={!customerInfo.name || !customerInfo.phone}
          >
            Complete Purchase
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
