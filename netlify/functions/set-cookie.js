exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const token = body.token;
    if (!token) {
      return {
        statusCode: 400,
        body: "Missing token"
      };
    }

    const cookie = `nf_jwt=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`;
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Server error"
    };
  }
};
