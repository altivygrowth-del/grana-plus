import { CreditCardItem } from '../../store/userStore';

export interface DbCard {
  id: string;
  user_id?: string;
  name: string;
  bank?: string;
  brand?: string;
  last_four_digits?: string;
  last_4_digits?: string;
  last_four?: string;
  total_limit?: number;
  limit?: number;
  totalLimit?: number;
  current_usage?: number;
  used_limit?: number;
  currentUsage?: number;
  closing_date?: string;
  closing_day?: string;
  closingDate?: string;
  due_date?: string;
  due_day?: string;
  dueDate?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CardServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface DeleteServiceResult {
  success: boolean;
  error: string | null;
}

export function mapDbToCard(db: DbCard): CreditCardItem {
  return {
    id: db.id,
    name: db.name || 'Cartão',
    bank: db.bank || 'Outro',
    brand: db.brand || 'Mastercard',
    lastFourDigits: db.last_four_digits || db.last_4_digits || db.last_four || '4321',
    totalLimit: Number(db.total_limit ?? db.limit ?? db.totalLimit ?? 0),
    currentUsage: Number(db.current_usage ?? db.used_limit ?? db.currentUsage ?? 0),
    closingDate: db.closing_date || db.closing_day || db.closingDate || 'Dia 05',
    dueDate: db.due_date || db.due_day || db.dueDate || 'Dia 12',
    color: db.color || '#165037'
  };
}

export function mapCardToDb(card: Partial<CreditCardItem>, userId?: string): Record<string, any> {
  const payload: Record<string, any> = {};
  if (userId) payload.user_id = userId;
  if (card.name !== undefined) payload.name = card.name;
  if (card.bank !== undefined) payload.bank = card.bank;
  if (card.brand !== undefined) payload.brand = card.brand;
  if (card.lastFourDigits !== undefined) payload.last_four_digits = card.lastFourDigits;
  if (card.totalLimit !== undefined) payload.total_limit = Number(card.totalLimit);
  if (card.currentUsage !== undefined) payload.current_usage = Number(card.currentUsage);
  if (card.closingDate !== undefined) payload.closing_date = card.closingDate;
  if (card.dueDate !== undefined) payload.due_date = card.dueDate;
  if (card.color !== undefined) payload.color = card.color;
  return payload;
}
