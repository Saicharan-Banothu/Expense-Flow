import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, PiggyBank } from "lucide-react";
import { useState } from "react";

interface Budget {
  id: number;
  amount: number;
  period: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
}

export default function Budgets() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState("monthly");

  const { data: budgets, isLoading: isLoadingBudgets } = useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await api.get("/budgets");
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

  const createBudget = useMutation({
    mutationFn: async (newBudget: Partial<Budget>) => {
      const response = await api.post("/budgets", newBudget);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setAmount("");
      setCategoryId("");
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    
    createBudget.mutate({
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
      period,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Set Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={createBudget.isPending}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={createBudget.isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  disabled={createBudget.isPending}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={createBudget.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Set Budget
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBudgets ? (
              <div className="text-center py-4">Loading budgets...</div>
            ) : (
              <div className="space-y-4">
                {budgets?.map((budget) => {
                  const category = categories?.find(c => c.id === budget.category_id);
                  return (
                    <div
                      key={budget.id}
                      className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <PiggyBank className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{category ? category.name : 'Unknown Category'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{budget.period} limit</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">₹{budget.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteBudget.mutate(budget.id)}
                          disabled={deleteBudget.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {budgets?.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No budgets set yet.
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
