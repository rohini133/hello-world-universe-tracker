
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BillHistoryList } from "@/components/billing/BillHistoryList";
import { BillReceipt } from "@/components/billing/BillReceipt";
import { Bill } from "@/data/models";

const BillHistory = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  return (
    <PageContainer title="Bill History" subtitle="View and manage past transactions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BillHistoryList onSelectBill={setSelectedBill} selectedBillId={selectedBill?.id} />
        </div>
        <div>
          {selectedBill ? (
            <BillReceipt bill={selectedBill} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full flex items-center justify-center">
              <p className="text-gray-500 text-center">Select a bill to view details</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default BillHistory;
