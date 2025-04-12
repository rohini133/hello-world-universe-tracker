import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getBills } from "@/services/billService";
import { Bill } from "@/data/models";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface BillHistoryListProps {
  onSelectBill: (bill: Bill) => void;
  selectedBillId?: string | null;
}

export const BillHistoryList = ({ onSelectBill, selectedBillId }: BillHistoryListProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await getBills();
        setBills(data);
        setFilteredBills(data);
      } catch (error) {
        toast({
          title: "Failed to load bills",
          description: "There was an error loading the bill history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBills(bills);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = bills.filter(
      bill => 
        bill.id.toLowerCase().includes(lowerCaseQuery) ||
        bill.customerName?.toLowerCase().includes(lowerCaseQuery) ||
        bill.customerPhone?.toLowerCase().includes(lowerCaseQuery)
    );
    
    setFilteredBills(filtered);
  }, [searchQuery, bills]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol'
    }).format(amount).replace('₹', '₹ '); // Add a space after the symbol
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold mb-3">Recent Bills</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by bill ID, customer name or phone"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin h-6 w-6 border-2 border-[#ea384c] border-t-transparent rounded-full inline-block mr-2"></div>
          <span>Loading bills...</span>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {searchQuery ? "No bills match your search" : "No bills found"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow 
                  key={bill.id}
                  className={`cursor-pointer hover:bg-red-50 ${
                    selectedBillId === bill.id ? "bg-red-100 hover:bg-red-100" : ""
                  }`}
                  onClick={() => onSelectBill(bill)}
                >
                  <TableCell className="font-medium">{bill.id}</TableCell>
                  <TableCell>
                    {new Date(bill.createdAt).toLocaleDateString()}
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(bill.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {bill.customerName || "Walk-in Customer"}
                    {bill.customerPhone && (
                      <div className="text-xs text-gray-500">{bill.customerPhone}</div>
                    )}
                  </TableCell>
                  <TableCell>{bill.items.length} items</TableCell>
                  <TableCell className="font-semibold text-[#ea384c]">
                    {formatCurrency(bill.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
