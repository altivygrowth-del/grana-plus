import { Account } from '../../store/userStore';

export interface DbAccount {
  id: string;
  user_id?: string;
  name?: string;
  account_name?: string;
  institution?: string;
  bank?: string;
  type?: string;
  account_type?: string;
  balance?: number;
  current_balance?: number;
  color?: string;
  bg_color?: string;
  bgColor?: string;
  icon?: string;
  last_updated?: string;
  updated_at?: string;
  created_at?: string;
}

export interface AccountServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface DeleteServiceResult {
  success: boolean;
  error: string | null;
}

/**
 * Mapeia um registro da tabela accounts do Supabase para a interface Account do frontend.
 */
export function mapDbToAccount(db: DbAccount): Account {
  const name = db.name || db.account_name || 'Conta Corrente';
  const type = db.type || db.account_type || 'Conta Corrente';
  const balance = typeof db.balance === 'number' 
    ? db.balance 
    : (typeof db.current_balance === 'number' ? db.current_balance : Number(db.balance || db.current_balance || 0));

  let bgColor = db.bgColor || db.bg_color;
  if (!bgColor) {
    const col = (db.color || '#1E6B4B').toLowerCase();
    if (col.includes('8a05be') || col.includes('purple')) {
      bgColor = 'bg-purple-50 text-[#8A05BE] border-purple-100';
    } else if (col.includes('2563eb') || col.includes('blue')) {
      bgColor = 'bg-blue-50 text-blue-600 border-blue-100';
    } else if (col.includes('f59e0b') || col.includes('amber') || col.includes('yellow')) {
      bgColor = 'bg-amber-50 text-amber-600 border-amber-100';
    } else if (col.includes('ec7000') || col.includes('orange')) {
      bgColor = 'bg-orange-50 text-orange-600 border-orange-100';
    } else if (col.includes('e11d48') || col.includes('red') || col.includes('rose')) {
      bgColor = 'bg-rose-50 text-rose-600 border-rose-100';
    } else {
      bgColor = 'bg-emerald-50 text-[#1E6B4B] border-emerald-100';
    }
  }

  return {
    id: db.id,
    name: name,
    institution: db.institution || db.bank || '',
    type: type,
    balance: isNaN(balance) ? 0 : balance,
    color: db.color || '#1E6B4B',
    bgColor: bgColor,
    icon: db.icon || '',
    lastUpdated: db.last_updated || (db.updated_at ? new Date(db.updated_at).toLocaleDateString('pt-BR') : 'Hoje')
  };
}

/**
 * Mapeia os dados da conta do frontend para o objeto aceito pelo Supabase.
 */
export function mapAccountToDb(acc: Partial<Account>, userId?: string): Record<string, any> {
  const payload: Record<string, any> = {};

  if (userId) payload.user_id = userId;
  if (acc.name !== undefined) payload.name = acc.name;
  if (acc.institution !== undefined) payload.institution = acc.institution;
  if (acc.type !== undefined) payload.type = acc.type;
  if (acc.balance !== undefined) payload.balance = Number(acc.balance);
  if (acc.color !== undefined) payload.color = acc.color;
  if (acc.bgColor !== undefined) payload.bg_color = acc.bgColor;
  if (acc.icon !== undefined) payload.icon = acc.icon;
  payload.updated_at = new Date().toISOString();

  return payload;
}
