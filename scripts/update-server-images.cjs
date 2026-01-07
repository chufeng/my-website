/**
 * 更新服务器数据库中的图片路径为 sm.ms CDN 地址
 */

const fs = require('fs');
const path = require('path');

const SERVER_URL = 'https://satoshin.site';
const USERNAME = 'admin';
const PASSWORD = 'xumo1115';

// 图片映射表
const imageMap = {
  '/兴安云智能移动端.jpg': 'https://s2.loli.net/2026/01/07/u4zXbdlFrOJpeWv.jpg',
  '/金智云鼎APP.jpg': 'https://s2.loli.net/2026/01/07/BZYHgkST8xoXCFV.jpg',
  '/可视化大屏.jpg': 'https://s2.loli.net/2026/01/07/clMVZtEbjufaqTi.jpg',
  '/运营设计.jpg': 'https://s2.loli.net/2026/01/07/1yLBjnrei3RaFIf.jpg',
  '/金智云鼎APP2.jpg': 'https://s2.loli.net/2026/01/07/n569J24jWsIYDtx.jpg',
  '/可视化大屏2.jpg': 'https://s2.loli.net/2026/01/07/IM4Po8mZSO9g6Cd.jpg',
  '/数据中台.jpg': 'https://s2.loli.net/2026/01/07/hlIAYsP916RTq8g.jpg',
  '/兴安云智能移动端2.jpg': 'https://s2.loli.net/2026/01/07/nKlFxS1uV5dfELt.jpg',
  '/运营设计2.jpg': 'https://s2.loli.net/2026/01/07/su1XwmUKQfz4ArZ.jpg'
};

async function main() {
  console.log('📦 更新服务器图片路径为 CDN 地址\n');

  // 1. 登录获取 token
  console.log('🔐 登录服务器...');
  const loginRes = await fetch(`${SERVER_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });

  if (!loginRes.ok) {
    console.log('❌ 登录失败');
    return;
  }

  const { token } = await loginRes.json();
  console.log('✅ 登录成功\n');

  // 2. 获取服务器现有作品
  console.log('📥 获取服务器作品...');
  const serverRes = await fetch(`${SERVER_URL}/api/projects`);
  const projects = await serverRes.json();
  console.log(`   找到 ${projects.length} 个作品\n`);

  // 3. 更新每个作品的图片路径
  let updated = 0;
  for (const project of projects) {
    const newImageUrl = imageMap[project.image];

    if (newImageUrl) {
      console.log(`📤 更新: ${project.title}`);
      console.log(`   ${project.image} -> ${newImageUrl}`);

      const formData = new FormData();
      formData.append('title', project.title);
      formData.append('category', project.category);
      formData.append('description', project.description || '');
      formData.append('tags', JSON.stringify(project.tags || []));
      formData.append('link', project.link || '');
      formData.append('sort_order', project.sort_order || 0);
      formData.append('image_path', newImageUrl);

      const updateRes = await fetch(`${SERVER_URL}/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (updateRes.ok) {
        console.log(`   ✅ 成功\n`);
        updated++;
      } else {
        const err = await updateRes.json();
        console.log(`   ❌ 失败: ${err.error}\n`);
      }
    } else if (project.image && !project.image.startsWith('http')) {
      console.log(`⚠️  跳过: ${project.title} (无映射: ${project.image})`);
    }
  }

  console.log('========================================');
  console.log(`✅ 更新完成！共更新 ${updated} 个作品`);
  console.log('========================================\n');
}

main().catch(console.error);
