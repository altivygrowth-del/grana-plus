import { AssetItem, AssetCategory } from '../../store/userStore';

export interface DbAsset {
  id: string;
  user_id?: string;
  name?: string;
  title?: string;
  category?: string;
  type?: string;
  value?: number;
  current_value?: number;
  amount?: number;
  acquisition_date?: string;
  acquisitionDate?: string;
  date?: string;
  last_updated?: string;
  updated_at?: string;
  notes?: string;
  description?: string;
  created_at?: string;
}

export interface AssetServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface DeleteServiceResult {
  success: boolean;
  error: string | null;
}

export function mapDbToAsset(db: DbAsset): AssetItem {
  let cat: AssetCategory = 'Investimentos';
  const rawCat = db.category || db.type || 'Investimentos';

  if (['Contas', 'Investimentos', 'Imóveis', 'Veículos', 'Criptoativos', 'Outros', 'Outros Bens'].includes(rawCat)) {
    cat = rawCat as AssetCategory;
  } else if (rawCat.toLowerCase().includes('cripto') || rawCat.toLowerCase().includes('crypto')) {
    cat = 'Criptoativos';
  } else if (rawCat.toLowerCase().includes('conta') || rawCat.toLowerCase().includes('bank')) {
    cat = 'Contas';
  } else if (rawCat.toLowerCase().includes('imóvel') || rawCat.toLowerCase().includes('imovel') || rawCat.toLowerCase().includes('real estate')) {
    cat = 'Imóveis';
  } else if (rawCat.toLowerCase().includes('veículo') || rawCat.toLowerCase().includes('veiculo') || rawCat.toLowerCase().includes('car')) {
    cat = 'Veículos';
  } else if (rawCat.toLowerCase().includes('invest')) {
    cat = 'Investimentos';
  } else {
    cat = 'Outros';
  }

  return {
    id: db.id,
    name: db.name || db.title || 'Novo Patrimônio',
    category: cat,
    value: Number(db.value ?? db.current_value ?? db.amount ?? 0),
    acquisitionDate: db.acquisition_date || db.acquisitionDate || db.date || new Date().toISOString().split('T')[0],
    lastUpdated: db.last_updated || (db.updated_at ? new Date(db.updated_at).toLocaleDateString('pt-BR') : 'Hoje'),
    notes: db.notes || db.description || ''
  };
}

export function mapAssetToDb(asset: Partial<AssetItem>, userId?: string): Record<string, any> {
  const payload: Record<string, any> = {};
  if (userId) payload.user_id = userId;
  if (asset.name !== undefined) {
    payload.name = asset.name;
    payload.title = asset.name;
  }
  if (asset.category !== undefined) {
    payload.category = asset.category;
    payload.type = asset.category;
  }
  if (asset.value !== undefined) {
    payload.value = Number(asset.value);
    payload.current_value = Number(asset.value);
  }
  if (asset.acquisitionDate !== undefined) {
    payload.acquisition_date = asset.acquisitionDate;
    payload.date = asset.acquisitionDate;
  }
  if (asset.notes !== undefined) {
    payload.notes = asset.notes;
    payload.description = asset.notes;
  }
  payload.updated_at = new Date().toISOString();
  return payload;
}
