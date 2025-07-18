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

// GET 端点：读取 nodeData.json 数据
app.get("/get-notes", (req, res) => {
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
app.post("/save-notes", (req, res) => {
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

app.listen(19200, () => console.log("Server running on port 19200"));