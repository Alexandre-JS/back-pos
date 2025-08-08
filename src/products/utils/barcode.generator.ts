export async function generateBarcode(): Promise<string> {
  const prefix = '299'; // Standard prefix for internal products
  const timestamp = Date.now().toString().slice(-9);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}
