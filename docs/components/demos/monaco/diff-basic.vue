<script setup lang="ts">
import { YMonacoDiff } from '@yss-ui/components';
import { ref } from 'vue';

const original = ref<string>(`-- v1: 用户表（旧版）
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL,
  status TINYINT DEFAULT 1,
  created_at DATETIME
);

-- 初始数据
INSERT INTO users (username, password, status) VALUES
  ('admin', 'admin123', 1),
  ('tester', '123456', 0);

-- 常用查询
SELECT user_id, username
FROM users
WHERE status = 1;

-- 保留配置（无变化）
CREATE INDEX idx_users_name ON users(username);
`);

const value = ref<string>(`-- v2: 用户表（安全升级）
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 初始数据
INSERT INTO users (username, password_hash, email, is_active) VALUES
  ('admin', '$2b$12$Kw...', 'admin@yss.com', TRUE),
  ('tester', '$2b$12$Hb...', NULL, FALSE);

-- 常用查询
SELECT user_id, username, email
FROM users
WHERE is_active = TRUE;

-- 保留配置（无变化）
CREATE INDEX idx_users_name ON users(username);
`);
</script>

<template>
  <YMonacoDiff v-model:value="value" :original="original" language="sql" height="380" />
  <div class="diff-note">变更点：密码字段升级、邮箱字段新增、状态字段从 status 调整为 is_active。</div>
</template>

<style scoped>
.diff-note {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
}
</style>
