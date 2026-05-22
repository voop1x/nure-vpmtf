import { DatabaseSync } from "node:sqlite";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";

// Зберігаємо лише призначені групи користувачів. Самі користувачі беруться
// з публічного API JSONPlaceholder (рівень 4).
const db = new DatabaseSync("users.sqlite");
db.exec("CREATE TABLE IF NOT EXISTS user_groups (id INTEGER PRIMARY KEY, grp TEXT)");

const DEFAULT_GROUP = "Інші";

// Збираємо app.jsx у браузерний бандл (заміна Bun.build).
await build({
  entryPoints: ["./app.jsx"],
  bundle: true,
  outdir: "./build",
  format: "iife",
});

// Допоміжні функції для віддачі статичних файлів та JSON.
async function sendFile(res, path, contentType) {
  try {
    const data = await readFile(path);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function sendJson(res, value) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (url.pathname === "/")
    return sendFile(res, "index.html", "text/html; charset=utf-8");

  if (url.pathname === "/app.js")
    return sendFile(res, "build/app.js", "text/javascript; charset=utf-8");

  // Рівень 3 + 4: список користувачів з реального API,
  // доповнений збереженою у БД групою кожного користувача.
  if (url.pathname === "/api/users" && method === "GET") {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const remote = await response.json();

    const groups = {};
    for (const row of db.prepare("SELECT id, grp FROM user_groups").all())
      groups[row.id] = row.grp;

    const users = remote.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      group: groups[u.id] || DEFAULT_GROUP,
    }));

    return sendJson(res, users);
  }

  if (url.pathname === "/api/users/group" && method === "POST") {
    const { id, group } = JSON.parse(await readBody(req));
    db
      .prepare("INSERT INTO user_groups (id, grp) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET grp = ?")
      .run(id, group, group);
    return sendJson(res, { success: true });
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(6969, () => {
  console.log("Сервер запущено на http://localhost:6969");
});
