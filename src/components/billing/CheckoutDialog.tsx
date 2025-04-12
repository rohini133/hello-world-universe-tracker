
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Printer, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendBillToWhatsApp } from "@/services/billService";
import { BillWithItems } from "@/data/models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generatePDF } from "@/utils/pdfGenerator";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: BillWithItems | null;
}

export const CheckoutDialog = ({
  open,
  onOpenChange,
  bill
}: CheckoutDialogProps) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  if (!bill) {
    return null;
  }

  const handleSendWhatsApp = async () => {
    if (!bill.id) return;
    
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
      // Generate PDF content
      const pdfBlob = generatePDF(bill);
      
      // Create a URL for the PDF blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open the PDF in a new window for printing
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          try {
            // Set timeout to ensure PDF is fully loaded
            setTimeout(() => {
              printWindow.print();
              // Add a longer delay before closing to ensure print dialog is handled
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
        
        // Fallback - just open the PDF directly
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
      // Generate PDF content
      const pdfBlob = generatePDF(bill);
      
      // Create download link for PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vivaas-Receipt-${bill.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bill Generated Successfully</DialogTitle>
          <DialogDescription>
            Bill #{bill.id} has been created and inventory has been updated.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">What would you like to do next?</p>
          
          <Button 
            className="w-full mb-3"
            style={{ backgroundColor: '#ea384c', color: 'white' }}
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
            className="w-full mb-3"
            variant="secondary"
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
              className="w-full mb-3"
              style={{ backgroundColor: '#ea384c', color: 'white' }}
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
};
