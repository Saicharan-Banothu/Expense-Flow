import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Subscription {
  id: number;
  name: string;
  amount: number;
  billing_cycle: string;
  next_billing_date: string;
  category_id: number | null;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextBillingDate, setNextBillingDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [categoryId, setCategoryId] = useState("");

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await api.get("/subscriptions");
      return response.data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (newSub: Partial<Subscription>) => {
      const response = await api.post("/subscriptions", newSub);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setName("");
      setAmount("");
    },
  });

  const deleteSubscription = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !nextBillingDate) return;
    
    createSubscription.mutate({
      name,
      amount: parseFloat(amount),
      billing_cycle: billingCycle,
      next_billing_date: nextBillingDate,
      category_id: categoryId ? parseInt(categoryId) : null,
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Service Name (e.g. Netflix)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createSubscription.isPending}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={createSubscription.isPending}
                />
              </div>
              <div className="space-y-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  disabled={createSubscription.isPending}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  disabled={createSubscription.isPending}
                />
              </div>
              <div className="space-y-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={createSubscription.isPending}
                >
                  <option value="">Select Category (Optional)</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={createSubscription.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subscription
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading subscriptions...</div>
            ) : (
              <div className="space-y-4">
                {subscriptions?.map((sub) => {
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Next billing: {sub.next_billing_date} ({sub.billing_cycle})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">₹{sub.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteSubscription.mutate(sub.id)}
                          disabled={deleteSubscription.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {subscriptions?.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No subscriptions tracked yet.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
