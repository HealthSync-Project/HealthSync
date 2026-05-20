"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { RecordPaymentSchema } from "@/lib/schema";
import { recordPayment } from "@/app/actions/medical";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";
import { DollarSign } from "lucide-react";

interface Props {
  paymentId: number;
  totalAmount: number;
  amountPaid: number;
  currentStatus: string;
}

export const RecordPayment = ({ paymentId, totalAmount, amountPaid, currentStatus }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const remaining = totalAmount - amountPaid;

  const form = useForm<z.infer<typeof RecordPaymentSchema>>({
    resolver: zodResolver(RecordPaymentSchema),
    defaultValues: {
      payment_id: String(paymentId),
      amount_paid: remaining,
      payment_method: "CASH",
      payment_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleSubmit = async (values: z.infer<typeof RecordPaymentSchema>) => {
    try {
      setIsLoading(true);
      const resp = await recordPayment(values);
      if (resp.success) {
        toast.success("Payment recorded successfully!");
        setOpen(false);
        router.refresh();
        form.reset();
      } else {
        toast.error(resp.msg || "Failed to record payment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === "PAID") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
        >
          <DollarSign size={14} />
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>Record Payment</DialogTitle>

        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Bill</span>
            <span className="font-medium">{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Already Paid</span>
            <span className="font-medium text-emerald-600">{amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="text-gray-500">Remaining</span>
            <span className="font-bold text-red-500">{remaining.toFixed(2)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <CustomInput
              type="input"
              control={form.control}
              name="amount_paid"
              label="Amount Received"
              placeholder="Enter amount"
            />
            <CustomInput
              type="radio"
              control={form.control}
              name="payment_method"
              label="Payment Method"
              placeholder=""
              selectList={[
                { label: "Cash", value: "CASH" },
                { label: "Card", value: "CARD" },
              ]}
            />
            <CustomInput
              type="input"
              control={form.control}
              name="payment_date"
              label="Payment Date"
              placeholder=""
              inputType="date"
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? "Recording..." : "Confirm Payment"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
