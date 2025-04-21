
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SizeStock {
  size: string;
  stock: number;
}

interface SizeStockManagerProps {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

export const SizeStockManager = ({ value, onChange }: SizeStockManagerProps) => {
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>(
    Object.entries(value || {}).map(([size, stock]) => ({ size, stock }))
  );
  const [inputSize, setInputSize] = useState("");
  const [inputStock, setInputStock] = useState<number>(0);

  useEffect(() => {
    const asObject: Record<string, number> = {};
    sizeStocks.forEach(({ size, stock }) => {
      if (size && stock > 0) asObject[size] = stock;
    });
    onChange(asObject);
    // eslint-disable-next-line
  }, [sizeStocks]);

  const handleAdd = () => {
    if (!inputSize.trim() || inputStock <= 0) return;
    if (sizeStocks.some((ss) => ss.size.toLowerCase() === inputSize.toLowerCase())) return;
    setSizeStocks([...sizeStocks, { size: inputSize.trim(), stock: inputStock }]);
    setInputSize("");
    setInputStock(0);
  };

  const handleRemove = (size: string) => {
    setSizeStocks(sizeStocks.filter((ss) => ss.size !== size));
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          placeholder="Size (e.g., S, M, L, XL)"
          value={inputSize}
          onChange={(e) => setInputSize(e.target.value)}
        />
        <Input
          placeholder="Stock"
          type="number"
          min={0}
          value={inputStock === 0 ? "" : inputStock}
          onChange={(e) => setInputStock(Number(e.target.value))}
          className="w-24"
        />
        <Button type="button" onClick={handleAdd} className="bg-primary">
          Add
        </Button>
      </div>
      {sizeStocks.length > 0 && (
        <div className="mt-3">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-1">Size</th>
                <th className="border p-1">Stock</th>
                <th className="border p-1">Remove</th>
              </tr>
            </thead>
            <tbody>
              {sizeStocks.map(({ size, stock }) => (
                <tr key={size}>
                  <td className="border p-1">{size}</td>
                  <td className="border p-1">{stock}</td>
                  <td className="border p-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(size)}
                      className="text-red-400"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

