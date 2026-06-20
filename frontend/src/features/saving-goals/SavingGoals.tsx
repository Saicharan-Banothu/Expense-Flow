import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, CheckCircle2, TrendingUp } from "lucide-react";
import { useState } from "react";

interface SavingGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

export default function SavingGoals() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const { data: goals, isLoading } = useQuery<SavingGoal[]>({
    queryKey: ["saving_goals"],
    queryFn: async () => {
      const response = await api.get("/saving_goals");
      return response.data;
    },
  });

  const createGoal = useMutation({
    mutationFn: async (newGoal: Partial<SavingGoal>) => {
      const response = await api.post("/saving_goals", newGoal);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saving_goals"] });
      setName("");
      setTargetAmount("");
      setDeadline("");
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/saving_goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saving_goals"] });
    },
  });

  const updateGoalProgress = useMutation({
    mutationFn: async ({ id, amount }: { id: number, amount: number }) => {
      const response = await api.put(`/saving_goals/${id}`, { current_amount: amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saving_goals"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    
    createGoal.mutate({
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      deadline: deadline || null,
    } as Partial<SavingGoal>);
  };

  const handleAddFunds = (goal: SavingGoal) => {
    const amount = window.prompt(`How much would you like to add to '${goal.name}'?`);
    if (amount && !isNaN(parseFloat(amount))) {
      updateGoalProgress.mutate({ 
        id: goal.id, 
        amount: goal.current_amount + parseFloat(amount) 
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-gradient">Saving Goals</h2>
        <p className="text-lg text-muted-foreground">Dream big and track your progress towards financial milestones.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit glass shadow-xl border-t-4 border-t-primary">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              New Goal
            </CardTitle>
            <CardDescription className="text-base">What are you saving for?</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Goal Name</label>
                <Input
                  className="text-lg py-6"
                  placeholder="e.g. New Laptop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createGoal.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Target Amount</label>
                <Input
                  className="text-lg py-6"
                  type="number"
                  step="0.01"
                  placeholder="1500.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  disabled={createGoal.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Target Date (Optional)</label>
                <Input
                  className="text-lg py-6"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={createGoal.isPending}
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6 font-bold primary-gradient shadow-lg shadow-primary/25" disabled={createGoal.isPending}>
                Create Goal
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-lg text-muted-foreground animate-pulse">Loading your dreams...</div>
          ) : goals?.length === 0 ? (
            <Card className="glass border-dashed border-2 flex flex-col items-center justify-center py-24 text-center">
              <Target className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl font-bold mb-2">No Goals Yet</h3>
              <p className="text-lg text-muted-foreground max-w-sm">Start saving for your future by creating your first financial goal.</p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {goals?.map((goal) => {
                const progressPercentage = Math.min(100, Math.max(0, (goal.current_amount / goal.target_amount) * 100));
                const isCompleted = progressPercentage >= 100;

                return (
                  <Card key={goal.id} className="glass overflow-hidden shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className={`${isCompleted ? 'bg-emerald-500/10' : 'bg-muted/30'} pb-4`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold flex items-center gap-2">
                            {isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Target className="h-5 w-5 text-primary" />}
                            {goal.name}
                          </CardTitle>
                          {goal.deadline && (
                            <CardDescription className="mt-1 font-medium text-sm">
                              Target: {goal.deadline}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteGoal.mutate(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-black text-gradient">₹{goal.current_amount.toFixed(2)}</p>
                          <p className="text-sm font-semibold text-muted-foreground mt-1">of ₹{goal.target_amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
                            {progressPercentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Progress value={progressPercentage} className={`h-3 ${isCompleted ? '[&>div]:bg-emerald-500' : '[&>div]:bg-primary'}`} />
                      </div>

                      {!isCompleted && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-4 font-bold gap-2 text-primary border-primary/20 hover:bg-primary/5"
                          onClick={() => handleAddFunds(goal)}
                        >
                          <TrendingUp className="h-4 w-4" />
                          Add Funds
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
