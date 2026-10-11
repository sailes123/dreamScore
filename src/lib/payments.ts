import { createHmac } from 'crypto';

const baseUrl = () => process.env.PAYMENT_BASE_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';
export const paymentCallbackUrl = (provider: 'khalti' | 'esewa') => `${baseUrl()}/api/payments/${provider}/callback`;

export async function initiateKhaltiPayment(input: { purchaseId: string; name: string; email: string; amountPaisa: number; packageName: string }) {
  const key = process.env.KHALTI_SECRET_KEY; if (!key) throw new Error('Khalti is not configured.');
  const sandbox = process.env.KHALTI_ENVIRONMENT !== 'production'; const api = sandbox ? 'https://dev.khalti.com/api/v2/epayment/initiate/' : 'https://khalti.com/api/v2/epayment/initiate/';
  const response = await fetch(api, { method: 'POST', headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ return_url: paymentCallbackUrl('khalti'), website_url: baseUrl(), amount: input.amountPaisa, purchase_order_id: input.purchaseId, purchase_order_name: input.packageName, customer_info: { name: input.name, email: input.email } }) });
  if (!response.ok) throw new Error(`Khalti initiation failed (${response.status}).`);
  return response.json() as Promise<{ pidx: string; payment_url: string }>;
}

export async function lookupKhaltiPayment(pidx: string) {
  const key = process.env.KHALTI_SECRET_KEY; if (!key) throw new Error('Khalti is not configured.');
  const sandbox = process.env.KHALTI_ENVIRONMENT !== 'production'; const api = sandbox ? 'https://dev.khalti.com/api/v2/epayment/lookup/' : 'https://khalti.com/api/v2/epayment/lookup/';
  const response = await fetch(api, { method: 'POST', headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ pidx }) });
  if (!response.ok) throw new Error(`Khalti lookup failed (${response.status}).`);
  return response.json() as Promise<{ status: string; total_amount: number; transaction_id: string | null }>;
}

export function createEsewaCheckout(input: { purchaseId: string; amount: string }) {
  const secret = process.env.ESEWA_SECRET_KEY; const productCode = process.env.ESEWA_PRODUCT_CODE; if (!secret || !productCode) throw new Error('eSewa is not configured.');
  const transactionUuid = input.purchaseId; const signedFieldNames = 'total_amount,transaction_uuid,product_code'; const message = `total_amount=${input.amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = createHmac('sha256', secret).update(message).digest('base64'); const sandbox = process.env.ESEWA_ENVIRONMENT !== 'production';
  return { action: sandbox ? 'https://rc-epay.esewa.com.np/api/epay/main/v2/form' : 'https://epay.esewa.com.np/api/epay/main/v2/form', fields: { amount: input.amount, tax_amount: '0', total_amount: input.amount, transaction_uuid: transactionUuid, product_code: productCode, product_service_charge: '0', product_delivery_charge: '0', success_url: paymentCallbackUrl('esewa'), failure_url: `${baseUrl()}/organizer/purchase?payment=cancelled`, signed_field_names: signedFieldNames, signature } };
}
