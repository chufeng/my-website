/**
 * 同步脚本：将本地数据库的作品通过 API 上传到服务器
 *
 * 使用方法：
 * 1. 先在服务器后台登录获取 token，或者在下面填写账号密码
 * 2. 运行: node sync-to-server.js
 */

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// ========== 配置 ==========
const SERVER_URL = 'https://satoshin.site'; // 服务器地址
const USERNAME = 'admin';  // 后台账号
const PASSWORD = 'xumo1115'; // 后台密码（改成你的）
// ==========================

const dbPath = path.join(__dirname, 'portfolio.db');

async function main() {
  console.log('📦 同步本地作品到服务器\n');

  // 1. 读取本地数据库
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 本地数据库不存在，请先运行后端服务创建数据库');
    return;
  }

  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  // 查询本地作品
  const result = db.exec('SELECT * FROM projects ORDER BY sort_order ASC');
  if (result.length === 0 || result[0].values.length === 0) {
    console.log('⚠️  本地数据库没有作品');
    return;
  }

  const columns = result[0].columns;
  const localProjects = result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });

  console.log(`📋 本地有 ${localProjects.length} 个作品\n`);

  // 2. 登录获取 token
  console.log('🔐 登录服务器...');
  const loginRes = await fetch(`${SERVER_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });

  if (!loginRes.ok) {
    console.log('❌ 登录失败，请检查账号密码');
    return;
  }

  const { token } = await loginRes.json();
  console.log('✅ 登录成功\n');

  // 3. 获取服务器现有作品
  console.log('📥 获取服务器现有作品...');
  const serverRes = await fetch(`${SERVER_URL}/api/projects`);
  const serverProjects = await serverRes.json();
  console.log(`   服务器有 ${serverProjects.length} 个作品\n`);

  // 4. 对比并上传
  let uploaded = 0;
  let skipped = 0;

  for (const local of localProjects) {
    // 检查服务器是否已有同名作品
    const exists = serverProjects.find(s => s.title === local.title);

    if (exists) {
      console.log(`⏭️  跳过: ${local.title} (已存在)`);
      skipped++;
      continue;
    }

    // 上传新作品
    console.log(`📤 上传: ${local.title}`);

    const formData = new FormData();
    formData.append('title', local.title);
    formData.append('category', local.category);
    formData.append('description', local.description || '');
    formData.append('tags', local.tags || '[]');
    formData.append('link', local.link || '');
    formData.append('sort_order', local.sort_order || 0);

    // 图片路径处理
    if (local.image) {
      if (local.image.startsWith('/uploads/')) {
        // 本地上传的图片，尝试读取并上传
        const imagePath = path.join(__dirname, local.image);
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const blob = new Blob([imageBuffer]);
          formData.append('image', blob, path.basename(local.image));
        }
      }
      // 静态资源路径会通过 image_path 字段传递
      formData.append('image_path', local.image);
    }

    const uploadRes = await fetch(`${SERVER_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (uploadRes.ok) {
      console.log(`   ✅ 上传成功`);
      uploaded++;
    } else {
      const err = await uploadRes.json();
      console.log(`   ❌ 上传失败: ${err.error}`);
    }
  }

  console.log('\n========================================');
  console.log(`📊 同步完成！`);
  console.log(`   上传: ${uploaded} 个`);
  console.log(`   跳过: ${skipped} 个 (已存在)`);
  console.log('========================================\n');

  // 5. 同步简历
  const resumeResult = db.exec("SELECT value FROM settings WHERE key = 'resume_path'");
  if (resumeResult.length > 0 && resumeResult[0].values.length > 0) {
    const resumePath = resumeResult[0].values[0][0];
    const localResumePath = path.join(__dirname, resumePath);

    if (fs.existsSync(localResumePath)) {
      console.log('📄 发现本地简历，正在上传...');

      const resumeBuffer = fs.readFileSync(localResumePath);
      const resumeBlob = new Blob([resumeBuffer]);
      const resumeForm = new FormData();
      resumeForm.append('resume', resumeBlob, path.basename(resumePath));

      const resumeRes = await fetch(`${SERVER_URL}/api/resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: resumeForm
      });

      if (resumeRes.ok) {
        console.log('✅ 简历上传成功');
      } else {
        console.log('❌ 简历上传失败');
      }
    }
  }

  db.close();
}

main().catch(console.error);
