import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://my-homely-cakes-isacsmile.aws-ap-south-1.turso.io';
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYwOTU1MTEsImlkIjoiMDE5ZmRiN2UtZTIwMS03ZWY2LTlmY2EtOTAyMmJhMmIwZGUyIiwia2lkIjoiN2xtV3pKVFAtZ1Y1WjdrWk53UkYyOE5iemtIMEFodGltSkFPb19qSFJ2byIsInJpZCI6ImI4MjhhM2U2LTA5ZGUtNDZjMi05MTJiLThhY2FmMThkYzlhOSJ9.zCjvXBE3roKX85ftl7UkN1jOLcGaW64CzaKTHsA8ZoFHqsfimKauBO40E4Q-AINbUPZDSFbPE83-8u6OeDx2DA';

async function testSubscribe() {
  const client = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  const testEmail = 'myhomelycakes@gmail.com';

  const res = await client.execute({
    sql: 'SELECT * FROM email_signups WHERE email = ?',
    args: [testEmail]
  });

  if (res.rows.length === 0) {
    await client.execute({
      sql: 'INSERT INTO email_signups (id, email, created_at) VALUES (?, ?, ?)',
      args: ['sub_test_' + Date.now(), testEmail, new Date().toISOString()]
    });
    console.log('✅ Successfully inserted sample subscriber email into Turso database!');
  } else {
    console.log('✅ Subscriber already exists in Turso database!');
  }

  const allSubs = await client.execute('SELECT * FROM email_signups');
  console.log(`Total subscribers in Turso DB: ${allSubs.rows.length}`);
}

testSubscribe().catch(err => console.error('Error:', err.message));
