import { db } from './db';
import { users, orders, pointsTransactions } from './db/schema';
import { eq } from 'drizzle-orm';

async function checkUsers() {
  const allUsers = await db.select().from(users);
  console.log('All Users in DB:');
  console.log(JSON.stringify(allUsers, null, 2));

  const allOrders = await db.select().from(orders);
  console.log('\nTotal Orders count:', allOrders.length);
  for (const o of allOrders) {
    console.log(`Order #${o.orderNumber}: UserID=${o.userId}, Email=${o.customerEmail}, Total=${o.totalAmount}, Status=${o.status}, PointsEarned=${o.pointsEarned}`);
  }
}

checkUsers().catch(console.error);
