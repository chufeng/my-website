const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';
const SMMS_TOKEN = '5OPYbt0fkEgaPFeuNaHijAySU78FJzd5';

// 上传图片到 sm.ms 图床
async function uploadToSmms(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('smfile', blob, fileName);

    const res = await fetch('https://sm.ms/api/v2/upload', {
      method: 'POST',
      headers: { 'Authorization': SMMS_TOKEN },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      console.log(`图片上传到 sm.ms 成功: ${data.data.url}`);
      return data.data.url;
    } else if (data.code === 'image_repeated') {
      console.log(`图片已存在于 sm.ms: ${data.images}`);
      return data.images;
    } else {
      console.log(`图片上传到 sm.ms 失败: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`上传到 sm.ms 出错: ${error.message}`);
    return null;
  }
}

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'portfolio.db');
let db;

// 保存数据库到文件
function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// 初始化数据库
async function initDb() {
  const SQL = await initSqlJs();

  // 如果数据库文件存在，则加载它
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      image TEXT,
      tags TEXT,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建默认管理员账户 (admin / admin123)
  const adminExists = db.exec("SELECT * FROM users WHERE username = 'admin'");
  if (adminExists.length === 0 || adminExists[0].values.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', hashedPassword]);
    console.log('Default admin account created: admin / admin123');
  }

  // 插入默认作品（如果没有）
  const projectCount = db.exec("SELECT COUNT(*) as count FROM projects");
  if (projectCount.length > 0 && projectCount[0].values[0][0] === 0) {
    const defaultProjects = [
      { title: '兴安云智能移动端', category: 'B端系统 / APP', description: '金融行业移动端解决方案', image: '/兴安云智能移动端.jpg', sort_order: 1 },
      { title: '金智云鼎 APP', category: 'B端系统 / APP', description: '面向企业客户的业务管理端', image: '/金智云鼎APP.jpg', sort_order: 2 },
      { title: '可视化大屏', category: '数据可视化', description: '实时数据驾驶舱', image: '/可视化大屏.jpg', sort_order: 3 },
      { title: '运营设计', category: '品牌 / 平面', description: '活动与转化目标的视觉物料', image: '/运营设计.jpg', sort_order: 4 }
    ];

    for (const p of defaultProjects) {
      db.run(
        "INSERT INTO projects (title, category, description, image, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
        [p.title, p.category, p.description, p.image, '[]', p.sort_order]
      );
    }
    console.log('Default projects inserted');
  }

  saveDb();
}

// 辅助函数：将查询结果转换为对象数组
function queryAll(sql, params = []) {
  const result = db.exec(sql, params);
  if (result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// 管理后台页面
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ========== 公开 API ==========

// 获取所有作品（公开）
app.get('/api/projects', (req, res) => {
  try {
    const projects = queryAll('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC');
    const formattedProjects = projects.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    }));
    res.json(formattedProjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个作品
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    project.tags = project.tags ? JSON.parse(project.tags) : [];
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== 需要认证的 API ==========

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

// 验证 token
app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// 创建作品
app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, tags, link, sort_order, image_path } = req.body;
    let image = image_path || null;

    // 如果上传了图片文件，先转存到 sm.ms
    if (req.file) {
      const localPath = path.join(uploadDir, req.file.filename);
      const cdnUrl = await uploadToSmms(localPath);
      if (cdnUrl) {
        image = cdnUrl;
        // 删除本地临时文件
        fs.unlinkSync(localPath);
      } else {
        // 如果上传到 sm.ms 失败，使用本地路径
        image = `/uploads/${req.file.filename}`;
      }
    }

    db.run(
      `INSERT INTO projects (title, category, description, image, tags, link, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, category, description, image, tags, link, sort_order || 0]
    );
    saveDb();

    const lastId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
    res.json({ id: lastId, message: 'Project created', image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新作品
app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, tags, link, sort_order, image_path } = req.body;
    const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let image = project.image;
    if (req.file) {
      // 删除旧的本地图片（如果有）
      if (project.image && project.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, project.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // 上传新图片到 sm.ms
      const localPath = path.join(uploadDir, req.file.filename);
      const cdnUrl = await uploadToSmms(localPath);
      if (cdnUrl) {
        image = cdnUrl;
        // 删除本地临时文件
        fs.unlinkSync(localPath);
      } else {
        // 如果上传到 sm.ms 失败，使用本地路径
        image = `/uploads/${req.file.filename}`;
      }
    } else if (image_path) {
      // 使用传入的图片路径
      image = image_path;
    }

    db.run(
      `UPDATE projects SET title = ?, category = ?, description = ?, image = ?, tags = ?, link = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, category, description, image, tags, link, sort_order || 0, req.params.id]
    );
    saveDb();

    res.json({ message: 'Project updated', image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除作品
app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  try {
    const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 删除图片文件
    if (project.image && project.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, project.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 修改密码
app.post('/api/change-password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.status(400).json({ error: 'Old password is incorrect' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
  saveDb();
  res.json({ message: 'Password changed successfully' });
});

// ========== 简历管理 API ==========

// 简历上传配置
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, 'resume' + path.extname(file.originalname));
  }
});
const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.doc') {
      cb(null, true);
    } else {
      cb(new Error('只支持 PDF 和 Word 格式'));
    }
  }
});

// 上传简历（需要认证）
app.post('/api/resume', authenticateToken, resumeUpload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }
    const resumePath = `/uploads/${req.file.filename}`;

    db.run(
      `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('resume_path', ?, CURRENT_TIMESTAMP)`,
      [resumePath]
    );
    saveDb();

    res.json({ message: '简历上传成功', path: resumePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取简历信息（公开）
app.get('/api/resume', (req, res) => {
  try {
    const setting = queryOne("SELECT value FROM settings WHERE key = 'resume_path'");
    if (setting && setting.value) {
      const filePath = path.join(__dirname, setting.value);
      if (fs.existsSync(filePath)) {
        return res.json({ exists: true, path: setting.value });
      }
    }
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除简历（需要认证）
app.delete('/api/resume', authenticateToken, (req, res) => {
  try {
    const setting = queryOne("SELECT value FROM settings WHERE key = 'resume_path'");
    if (setting && setting.value) {
      const filePath = path.join(__dirname, setting.value);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      db.run("DELETE FROM settings WHERE key = 'resume_path'");
      saveDb();
    }
    res.json({ message: '简历已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('API endpoints:');
    console.log('  GET  /api/projects     - Get all projects');
    console.log('  POST /api/login        - Login');
    console.log('  POST /api/projects     - Create project (auth required)');
    console.log('  PUT  /api/projects/:id - Update project (auth required)');
    console.log('  DELETE /api/projects/:id - Delete project (auth required)');
  });
});
