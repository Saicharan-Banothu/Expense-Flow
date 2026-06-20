import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Receipt, Download, Search, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";

interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  category_id: number | null;
}

interface Category {
  id: number;
  name: string;
}

export default function Expenses() {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [categoryId, setCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const minDate = `${currentYear}-${monthStr}-01`;
  const maxDate = `${currentYear}-${monthStr}-${daysInMonth}`;

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await api.get("/expenses");
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

  const createExpense = useMutation({
    mutationFn: async (newExpense: Partial<Expense>) => {
      const response = await api.post("/expenses", newExpense);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setDescription("");
      setAmount("");
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;
    
    createExpense.mutate({
      description,
      amount: parseFloat(amount),
      date,
      category_id: categoryId ? parseInt(categoryId) : null,
    });
  };

  const handleExportCSV = () => {
    if (!expenses || expenses.length === 0) return;
    
    const headers = ["Date", "Description", "Category", "Amount"];
    const csvData = expenses.map(e => {
      const cat = categories?.find(c => c.id === e.category_id);
      return [
        e.date, 
        `"${e.description.replace(/"/g, '""')}"`, 
        cat ? `"${cat.name.replace(/"/g, '""')}"` : "Uncategorized", 
        e.amount
      ].join(",");
    });
    
    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedExpenses = useMemo(() => {
    if (!expenses) return [];
    
    let result = [...expenses];
    
    // Filter
    if (searchQuery) {
      result = result.filter(e => e.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Sort
    if (sortBy === "date_desc") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "date_asc") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "amount_desc") {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amount_asc") {
      result.sort((a, b) => a.amount - b.amount);
    }
    
    return result;
  }, [expenses, searchQuery, sortBy]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-gradient">Expenses</h2>
          <p className="text-lg text-muted-foreground">Track and manage your spending</p>
        </div>
        <Button variant="outline" className="h-12 px-6 text-lg shadow-sm bg-white/50 dark:bg-black/50 backdrop-blur-md" onClick={handleExportCSV} disabled={!expenses || expenses.length === 0}>
          <Download className="mr-2 h-5 w-5 text-primary" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit glass shadow-xl border-t-4 border-t-primary">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              Add Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <Input
                  className="text-lg py-6"
                  placeholder="e.g. Groceries"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={createExpense.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Amount</label>
                <Input
                  className="text-lg py-6"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={createExpense.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Date</label>
                <Input
                  className="text-lg py-6"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={createExpense.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Category</label>
                <select
                  className="flex h-14 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={createExpense.isPending}
                >
                  <option value="">Uncategorized (Default)</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full text-lg py-6 font-bold primary-gradient shadow-lg shadow-primary/25" disabled={createExpense.isPending}>
                <Plus className="mr-2 h-5 w-5" />
                Save Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass shadow-xl border-t-4 border-t-accent">
          <CardHeader className="bg-muted/30 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Receipt className="h-6 w-6 text-accent-foreground" />
              Recent Expenses
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search expenses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-white/20 dark:border-white/10"
                />
              </div>
              <div className="relative w-full sm:w-48">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <select
                  className="flex h-10 w-full pl-9 pr-3 rounded-md border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary relative appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Amount (High to Low)</option>
                  <option value="amount_asc">Amount (Low to High)</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12 text-lg text-muted-foreground animate-pulse">Loading expenses...</div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedExpenses.map((expense) => {
                  const category = categories?.find(c => c.id === expense.category_id);
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-xl border border-white/20 dark:border-white/10 p-5 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:shadow-md hover:bg-white/80 dark:hover:bg-slate-800/80"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                          <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{expense.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className="font-medium">{expense.date}</span>
                            {category && (
                              <>
                                <span>•</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">{category.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-black text-2xl tracking-tight">₹{expense.amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-destructive/70 hover:bg-destructive/10 hover:text-destructive rounded-full"
                          onClick={() => deleteExpense.mutate(expense.id)}
                          disabled={deleteExpense.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {filteredAndSortedExpenses.length === 0 && (
                  <div className="text-center py-16 flex flex-col items-center">
                    <Receipt className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground">
                      No expenses found.
                    </p>
                    <p className="text-muted-foreground mt-1 text-base max-w-sm">
                      {searchQuery ? "Try adjusting your search filters." : "Start by adding your first expense above."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
