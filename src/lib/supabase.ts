import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export type OrderStatus =
  | "recebido"
  | "preparo"
  | "caminho"
  | "entregue";

export type PaymentStatus =
  | "pendente"
  | "pago"
  | "cancelado";

export interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  product_id: string | null;
  product_name: string;
  product_price: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
}