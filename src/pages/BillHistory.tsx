
import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BillHistoryList } from "@/components/billing/BillHistoryList";
import { BillReceipt } from "@/components/billing/BillReceipt";
import { Bill } from "@/data/models";
import { getBills } from "@/services/billService";

const BillHistory = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    const loadBills = async () => {
      try {
        const data = await getBills();
        setBills(data);
      } catch (error) {
        console.error("Error loading bills:", error);
      }
    };
    
    loadBills();
  }, []);

  const handleSelectBill = (bill: Bill) => {
    setSelectedBill(bill);
    setIsReceiptOpen(true);
  };

  return (
    <PageContainer title="Bill History" subtitle="View and manage past transactions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BillHistoryList 
            onSelectBill={handleSelectBill} 
            selectedBillId={selectedBill?.id} 
          />
        </div>
        <div>
          <BillReceipt 
            bill={selectedBill} 
            open={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default BillHistory;
