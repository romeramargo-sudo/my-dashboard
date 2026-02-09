const { Client } = require("pg");

const ensureTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

exports.handler = async (event, context) => {
  if (!context.clientContext || !context.clientContext.user) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const user = context.clientContext.user;
  const userId = user.sub || user.id || user.user_id;

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    await ensureTable(client);

    if (event.httpMethod === "GET") {
      const result = await client.query("SELECT data FROM user_data WHERE user_id = $1", [userId]);
      const data = result.rows[0]?.data || null;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      };
    }

    if (event.httpMethod === "POST") {
      const body = event.body ? JSON.parse(event.body) : {};
      const data = body.data ?? body;
      await client.query(
        `
        INSERT INTO user_data (user_id, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
        `,
        [userId, data]
      );
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true })
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    return { statusCode: 500, body: "Server error" };
  } finally {
    await client.end();
  }
};
