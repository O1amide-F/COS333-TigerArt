const http = require("http");

const PORT = process.env.PORT || 4000;

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (req.url === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, { status: "ok", service: "tigerart-backend" });
  }

  if (req.url === "/api/survey" && req.method === "GET") {
    return sendJson(res, 200, {
      selections: [1, 2, 3],
      username: "Username",
      updatedAt: new Date().toISOString(),
    });
  }

  return sendJson(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`TigerArt backend running on http://localhost:${PORT}`);
});
