exports.handler = async () => {
  const cookie = "nf_jwt=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";
  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": cookie,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ok: true })
  };
};
