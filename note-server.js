import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const filePath = path.join(dataDir, "nodeData.json"); // 存储文件为 data/nodeData.json

app.use(express.json());

// 确保 data 目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 静态文件服务 - 提供 dist 目录下的文件
app.use(express.static(path.join(__dirname, "dist")));

// API 路由
// GET 端点：读取 nodeData.json 数据
app.get("/api/get-notes", (req, res) => {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const stored = JSON.parse(raw);
      // 如果文件直接是数组，则视为 menus
      const menus = Array.isArray(stored) ? stored : stored.menus || [];
      const version = stored.version || "1.0.0";
      res.json({ version, menus });
    } else {
      res.json({ version: "1.0.0", menus: [] }); // 返回默认结构
    }
  } catch (error) {
    console.error("Error reading notes:", error);
    res.status(500).send("Error reading notes");
  }
});

// POST 端点：保存 nodeData.json 数据
app.post("/api/save-notes", (req, res) => {
  const notes = req.body;
  const dataToSave = { version: "1.0.0", menus: notes };
  try {
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    // 返回保存后的数据
    res.json(dataToSave);
  } catch (error) {
    console.error("Error saving notes:", error);
    res.status(500).json({ error: "Error saving notes" });
  }
});

// 兼容旧版本的 API 端点（保持向后兼容）
app.get("/get-notes", (req, res) => {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const stored = JSON.parse(raw);
      const menus = Array.isArray(stored) ? stored : stored.menus || [];
      const version = stored.version || "1.0.0";
      res.json({ version, menus });
    } else {
      res.json({ version: "1.0.0", menus: [] });
    }
  } catch (error) {
    console.error("Error reading notes:", error);
    res.status(500).send("Error reading notes");
  }
});

app.post("/save-notes", (req, res) => {
  const notes = req.body;
  const dataToSave = { version: "1.0.0", menus: notes };
  try {
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    res.json(dataToSave);
  } catch (error) {
    console.error("Error saving notes:", error);
    res.status(500).json({ error: "Error saving notes" });
  }
});

// 默认路由 - 返回 index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(19200, () => {
  console.log("🚀 Server running on port 19200");
  console.log("📱 Frontend: http://localhost:19200");
  console.log("🔧 API: http://localhost:19200/api/get-notes");
}); 