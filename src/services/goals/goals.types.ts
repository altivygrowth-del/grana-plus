import { FinancialGoalItem } from '../../store/userStore';

export interface DbGoal {
  id: string;
  user_id?: string;
  title?: string;
  name?: string;
  target_amount?: number;
  target_val?: number;
  targetAmount?: number;
  current_amount?: number;
  current_val?: number;
  currentAmount?: number;
  deadline?: string;
  target_date?: string;
  due_date?: string;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbGoalContribution {
  id: string;
  goal_id?: string;
  goalId?: string;
  user_id?: string;
  amount: number;
  date?: string;
  created_at?: string;
  notes?: string;
  description?: string;
}

export interface GoalContributionItem {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface GoalServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface DeleteServiceResult {
  success: boolean;
  error: string | null;
}

export function mapDbToGoal(db: DbGoal): FinancialGoalItem {
  return {
    id: db.id,
    title: db.title || db.name || 'Nova Meta',
    targetAmount: Number(db.target_amount ?? db.target_val ?? db.targetAmount ?? 0),
    currentAmount: Number(db.current_amount ?? db.current_val ?? db.currentAmount ?? 0),
    deadline: db.deadline || db.target_date || db.due_date || 'A definir',
    icon: db.icon || 'Target',
    color: db.color || '#1E6B4B',
    createdAt: db.created_at
  };
}

export function mapGoalToDb(goal: Partial<FinancialGoalItem>, userId?: string): Record<string, any> {
  const payload: Record<string, any> = {};
  if (userId) payload.user_id = userId;
  if (goal.title !== undefined) {
    payload.title = goal.title;
    payload.name = goal.title;
  }
  if (goal.targetAmount !== undefined) {
    payload.target_amount = Number(goal.targetAmount);
  }
  if (goal.currentAmount !== undefined) {
    payload.current_amount = Number(goal.currentAmount);
  }
  if (goal.deadline !== undefined) {
    payload.deadline = goal.deadline;
    payload.target_date = goal.deadline;
  }
  if (goal.icon !== undefined) payload.icon = goal.icon;
  if (goal.color !== undefined) payload.color = goal.color;
  return payload;
}

export function mapDbToContribution(db: DbGoalContribution): GoalContributionItem {
  return {
    id: db.id,
    goalId: db.goal_id || db.goalId || '',
    amount: Number(db.amount || 0),
    date: db.date || db.created_at || new Date().toISOString().split('T')[0],
    notes: db.notes || db.description || 'Aporte realizado'
  };
}
