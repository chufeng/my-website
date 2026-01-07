/**
 * 批量上传图片到 sm.ms 图床
 * 并更新数据库和代码中的图片路径
 */

const fs = require('fs');
const path = require('path');
const initSqlJs = require('../server/node_modules/sql.js');

const SMMS_TOKEN = '5OPYbt0fkEgaPFeuNaHijAySU78FJzd5';
const IMG_DIR = path.join(__dirname, '../img');
const DB_PATH = path.join(__dirname, '../server/portfolio.db');

// 存储上传结果的映射表
const uploadedMap = {};
const CACHE_FILE = path.join(__dirname, 'smms-cache.json');

// 加载缓存
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  }
  return {};
}

// 保存缓存
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// 上传单个图片到 sm.ms
async function uploadImage(filePath) {
  const fileName = path.basename(filePath);
  console.log(`  上传中: ${fileName}`);

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('smfile', blob, fileName);

  try {
    const res = await fetch('https://sm.ms/api/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': SMMS_TOKEN
      },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      console.log(`  ✅ 成功: ${data.data.url}`);
      return data.data.url;
    } else if (data.code === 'image_repeated') {
      // 图片已存在，返回已有的 URL
      console.log(`  ⚠️  已存在: ${data.images}`);
      return data.images;
    } else {
      console.log(`  ❌ 失败: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`  ❌ 错误: ${error.message}`);
    return null;
  }
}

// 批量上传所有图片
async function uploadAllImages() {
  console.log('\n📤 开始上传图片到 sm.ms\n');

  const cache = loadCache();
  const files = fs.readdirSync(IMG_DIR).filter(f =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );

  console.log(`找到 ${files.length} 个图片文件\n`);

  for (const file of files) {
    const filePath = path.join(IMG_DIR, file);
    const localPath = `/${file}`; // 数据库中存储的路径格式

    // 检查缓存
    if (cache[localPath]) {
      console.log(`  ⏭️  跳过 (已缓存): ${file}`);
      uploadedMap[localPath] = cache[localPath];
      continue;
    }

    const url = await uploadImage(filePath);
    if (url) {
      uploadedMap[localPath] = url;
      cache[localPath] = url;
      saveCache(cache);
    }

    // 避免请求过快
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n✅ 图片上传完成\n');
  return uploadedMap;
}

// 更新数据库中的图片路径
async function updateDatabase(urlMap) {
  console.log('📝 更新数据库图片路径...\n');

  if (!fs.existsSync(DB_PATH)) {
    console.log('  ⚠️  数据库文件不存在，跳过');
    return;
  }

  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(fileBuffer);

  // 获取所有项目
  const result = db.exec('SELECT id, title, image FROM projects');
  if (result.length === 0) {
    console.log('  数据库中没有项目');
    return;
  }

  const columns = result[0].columns;
  const projects = result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });

  let updated = 0;
  for (const project of projects) {
    if (project.image && urlMap[project.image]) {
      const newUrl = urlMap[project.image];
      db.run('UPDATE projects SET image = ? WHERE id = ?', [newUrl, project.id]);
      console.log(`  ✅ ${project.title}: ${project.image} -> ${newUrl}`);
      updated++;
    }
  }

  // 保存数据库
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);

  console.log(`\n  更新了 ${updated} 条记录\n`);
}

// 生成前端代码替换映射
function generateCodeReplacements(urlMap) {
  console.log('📋 代码中需要替换的路径:\n');

  const replacements = [];
  for (const [local, remote] of Object.entries(urlMap)) {
    // 可能的引用格式
    const patterns = [
      local,                    // /xxx.jpg
      `.${local}`,              // ./xxx.jpg
      `img${local}`,            // img/xxx.jpg
      `/img${local}`,           // /img/xxx.jpg
    ];

    console.log(`  ${local} -> ${remote}`);
    replacements.push({ local, remote, patterns });
  }

  // 保存替换映射
  const mapFile = path.join(__dirname, 'url-replacements.json');
  fs.writeFileSync(mapFile, JSON.stringify(urlMap, null, 2));
  console.log(`\n  映射表已保存到: ${mapFile}\n`);

  return replacements;
}

// 主函数
async function main() {
  console.log('========================================');
  console.log('   图片迁移到 sm.ms 图床');
  console.log('========================================');

  // 1. 上传图片
  const urlMap = await uploadAllImages();

  if (Object.keys(urlMap).length === 0) {
    console.log('没有图片需要处理');
    return;
  }

  // 2. 更新数据库
  await updateDatabase(urlMap);

  // 3. 生成代码替换建议
  generateCodeReplacements(urlMap);

  console.log('========================================');
  console.log('✅ 迁移完成！');
  console.log('');
  console.log('下一步：');
  console.log('  1. 运行 node scripts/update-code-paths.js 更新前端代码');
  console.log('  2. 部署后端同步数据库到服务器');
  console.log('  3. 部署前端');
  console.log('========================================\n');
}

main().catch(console.error);
