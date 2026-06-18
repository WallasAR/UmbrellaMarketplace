export interface Address {
  id?: string;
  user_id?: string;
  name: string;
  cep: string;
  address: string;
  city?: string;
  state?: string;
  is_default?: boolean;
  created_at?: string;
}
