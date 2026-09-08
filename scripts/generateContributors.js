/**
 * 构建时脚本：生成文档贡献者数据
 *
 * 扫描 docs/ 目录下所有 .md 文件，通过 git log 提取贡献者信息，
 * 并尝试从内网 GitLab API 获取用户头像，最终生成 contributors.json。
 *
 * 环境变量:
 *   GITLAB_TOKEN - GitLab Personal Access Token（可选，用于获取用户头像）
 *                  创建方式: GitLab -> Settings -> Access Tokens -> read_api 权限
 *
 * 用法: node scripts/generateContributors.js
 *       GITLAB_TOKEN=your_token node scripts/generateContributors.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

/** GitLab 配置（可选内部环境变量） */
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || '';
const GITLAB_TOKEN = process.env.GITLAB_TOKEN || '';

/** 项目路径 */
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'contributors.json');

/** 头像缓存，避免重复请求 */
const avatarCache = new Map();

/**
 * 递归扫描目录下的所有 .md 文件
 * @param {string} dir - 扫描目录
 * @returns {string[]} - md 文件路径数组
 */
function scanMarkdownFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...scanMarkdownFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 通过 git log 获取某个文件的贡献者列表
 * @param {string} filePath - 文件绝对路径
 * @returns {{ name: string, email: string, commits: number }[]} - 贡献者数组
 */
function getFileContributors(filePath) {
  try {
    const relativePath = path.relative(ROOT_DIR, filePath);
    // 获取所有 commit 的作者信息
    const output = execSync(`git log --format="%aN||%aE" -- "${relativePath}"`, {
      cwd: ROOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });

    if (!output.trim()) return [];

    const lines = output.trim().split('\n');
    const authorMap = new Map();

    for (const line of lines) {
      const [name, email] = line.split('||');
      if (!name || !email) continue;

      const key = email.toLowerCase();
      if (authorMap.has(key)) {
        authorMap.get(key).commits += 1;
      } else {
        authorMap.set(key, { name: name.trim(), email: email.trim(), commits: 1 });
      }
    }

    // 按 commit 数降序排列
    return Array.from(authorMap.values()).sort((a, b) => b.commits - a.commits);
  } catch {
    return [];
  }
}

/**
 * 通过 HTTP 请求 GitLab API 获取用户头像（Promise 形式）
 * @param {string} email - 用户邮箱
 * @returns {Promise<string|null>} - 头像 URL 或 null
 */
function fetchGitLabAvatar(email) {
  return new Promise(resolve => {
    if (!GITLAB_BASE_URL) {
      resolve(null);
      return;
    }

    // 检查缓存
    if (avatarCache.has(email)) {
      resolve(avatarCache.get(email));
      return;
    }

    const url = `${GITLAB_BASE_URL}/api/v4/avatar?email=${encodeURIComponent(email)}&size=64`;

    const request = http.get(url, { timeout: 3000 }, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const avatarUrl = json.avatar_url || null;
          avatarCache.set(email, avatarUrl);
          resolve(avatarUrl);
        } catch {
          avatarCache.set(email, null);
          resolve(null);
        }
      });
    });

    request.on('error', () => {
      avatarCache.set(email, null);
      resolve(null);
    });

    request.on('timeout', () => {
      request.destroy();
      avatarCache.set(email, null);
      resolve(null);
    });
  });
}

/**
 * 尝试通过用户的公开主页爬取头像（不需要 Token）
 * @param {string} username - 邮箱前缀作为 GitLab 用户名
 * @returns {Promise<string|null>} - 头像 URL 或 null
 */
function fetchAvatarFromProfile(username) {
  return new Promise(resolve => {
    if (!GITLAB_BASE_URL) {
      resolve(null);
      return;
    }
    const cacheKey = `name:${username}`;
    if (avatarCache.has(cacheKey)) {
      resolve(avatarCache.get(cacheKey));
      return;
    }

    const profileUrl = `${GITLAB_BASE_URL}/${encodeURIComponent(username)}`;

    const request = http.get(profileUrl, { timeout: 5000 }, res => {
      // 只要不是 200，说明可能用户不存在主页
      if (res.statusCode !== 200) {
        // 消费掉 response 数据，否则会内存泄漏
        res.resume();
        avatarCache.set(cacheKey, null);
        resolve(null);
        return;
      }

      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          // 通过正则匹配完整 HTML 文本中的 <meta property="og:image" content="...">
          const match = data.match(/<meta content="([^"]+)" property="og:image">/);
          let result = null;

          if (match && match[1]) {
            let avatarUrl = match[1];

            // 修复 HTML 实体转义问题，避免 &amp; 导致图片失效
            avatarUrl = avatarUrl.replace(/&amp;/g, '&');

            if (avatarUrl.startsWith('/')) {
              // 确保头像是绝对路径
              avatarUrl = `${GITLAB_BASE_URL}${avatarUrl}`;
            }

            result = {
              avatar: avatarUrl,
              url: profileUrl,
            };
          }
          avatarCache.set(cacheKey, result);
          resolve(result);
        } catch {
          avatarCache.set(cacheKey, null);
          resolve(null);
        }
      });
    });

    request.on('error', () => {
      avatarCache.set(cacheKey, null);
      resolve(null);
    });

    request.on('timeout', () => {
      request.destroy();
      avatarCache.set(cacheKey, null);
      resolve(null);
    });
  });
}
// removed fetchGitLabAvatarByName
/**
 * 获取用户头像
 *
 * 策略：
 *   从邮箱中提取前缀作为 GitLab 用户名，直接爬取该用户名的公共主页，
 *   提取 meta 头部的 og:image 图标作为真实内网头像。无需 Token。
 *
 * @param {string} name - git config 配置名（可能不是拼音）
 * @param {string} email - 邮箱
 * @returns {Promise<string|null>}
 */
async function getAvatar(name, email) {
  // 从邮箱提取真正的 GitLab 用户名，如 wangyancong@ysstech.com -> wangyancong
  let username = name;
  if (email && email.includes('@')) {
    username = email.split('@')[0];
  }

  // 通过主页抓取头像（不需要任何认证）
  const userInfo = await fetchAvatarFromProfile(username);

  if (userInfo) {
    return userInfo;
  }

  return { avatar: null, url: null };
}

/**
 * 将文件路径转换为 dumi 路由路径（dumi 默认将驼峰转为中划线）
 * 例: docs/components/editTable.md => /components/edit-table
 * @param {string} filePath - 文件绝对路径
 * @returns {string} - 路由路径
 */
function filePathToRoutePath(filePath) {
  const relative = path.relative(DOCS_DIR, filePath);
  // 移除扩展名，将 index 处理为目录路径
  let routePath = '/' + relative.replace(/\.md$/, '').replace(/\\/g, '/');

  // 处理驼峰命名到 kebab-case (如 editTable -> edit-table)
  routePath = routePath
    .split('/')
    .map(segment => {
      return segment.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    })
    .join('/');

  if (routePath.endsWith('/index')) {
    routePath = routePath.replace(/\/index$/, '');
  }
  return routePath || '/';
}

/**
 * 主函数
 */
async function main() {
  console.log('📝 开始生成文档贡献者数据...');

  // 1. 扫描所有 .md 文件
  const mdFiles = scanMarkdownFiles(DOCS_DIR);
  console.log(`   找到 ${mdFiles.length} 个文档文件`);

  // 2. 提取每个文件的贡献者
  const contributorsMap = {};

  for (const file of mdFiles) {
    const routePath = filePathToRoutePath(file);
    const contributors = getFileContributors(file);

    if (contributors.length > 0) {
      contributorsMap[routePath] = contributors;
    }
  }

  console.log(`   提取了 ${Object.keys(contributorsMap).length} 个页面的贡献者数据`);

  // 3. 收集所有唯一的贡献者，获取头像
  const allContributors = new Map();
  for (const contributors of Object.values(contributorsMap)) {
    for (const c of contributors) {
      if (!allContributors.has(c.email)) {
        allContributors.set(c.email, { name: c.name, email: c.email });
      }
    }
  }

  console.log(`   共 ${allContributors.size} 个唯一贡献者，正在获取头像...`);

  // 4. 批量获取头像
  const avatarMap = new Map();
  const entries = Array.from(allContributors.values());

  // 并发获取，每批 5 个
  for (let i = 0; i < entries.length; i += 5) {
    const batch = entries.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async ({ name, email }) => {
        const info = await getAvatar(name, email);
        return { email, info };
      })
    );
    for (const { email, info } of results) {
      avatarMap.set(email, info);
    }
  }

  const avatarSuccessCount = Array.from(avatarMap.values()).filter(i => i && i.avatar).length;
  console.log(`   成功获取 ${avatarSuccessCount}/${allContributors.size} 个头像`);

  // 5. 将头像和个人主页注入到贡献者数据中
  for (const [routePath, contributors] of Object.entries(contributorsMap)) {
    contributorsMap[routePath] = contributors.map(c => {
      const info = avatarMap.get(c.email) || { avatar: null, url: null };
      return {
        ...c,
        avatar: info.avatar,
        url: info.url,
      };
    });
  }

  // 6. 确保输出目录存在并写入文件
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(contributorsMap, null, 2), 'utf-8');
  console.log(`\n✅ 贡献者数据已生成: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`   文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('❌ 生成贡献者数据失败:', err.message);
  // 生成空的兜底文件，不阻断 dev 启动
  const fallbackDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, '{}', 'utf-8');
  console.log('⚠️  已生成空的兜底文件，文档站可正常启动');
});
