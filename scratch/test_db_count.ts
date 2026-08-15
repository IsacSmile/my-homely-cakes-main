import { db } from '../src/db/index';
import { products } from '../src/db/schema';

async function test() {
  const result1 = await db.select().from(products);
  console.log('Result length (without .all()):', result1.length);

  const names = result1.map((p: any) => p.name);
  console.log('Product Names:', names);
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
