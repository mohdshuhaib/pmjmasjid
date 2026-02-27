import React from "react";
import { Receipt } from "lucide-react";

interface Payment {
  id: string;
  amount: number | string;
  payment_date: string; // Updated from 'date' to 'payment_date'
}

export default function Receipts({ payments }: { payments: Payment[] | null }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
          <Receipt className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Recent Receipts</h2>
      </div>

      <div className="p-6 flex-1">
        {payments && payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-slate-800">₹ {payment.amount}</p>
                  <p className="text-xs text-slate-500">
                    {/* Updated to use payment.payment_date */}
                    {new Date(payment.payment_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">Paid</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
            <Receipt className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}