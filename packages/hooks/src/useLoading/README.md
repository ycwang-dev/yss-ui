# useLoading Hook 重构说明

## 📁 文件结构

```
useLoading/
├── index.ts       # 主逻辑实现
└── constant.ts    # 类型定义
```

## ✨ 改进内容

### 1. 代码健壮性增强

#### ✅ 类型安全
- 新增 `UseLoadingReturn` 接口，明确返回值类型
- 新增 `WithLoadingOptions` 接口，规范配置选项
- 完整的 TypeScript 类型标注

#### ✅ 并发控制
- 引入 `activeCount` 计数器，追踪活跃的异步操作
- 防止多次并发调用时状态不一致
- 只有所有异步操作完成后才重置 loading 状态

#### ✅ 错误处理
- 新增 `keepLoadingOnError` 选项：错误时是否保持 loading 状态
- 新增 `onError` 回调：处理错误情况
- 新增 `onFinally` 回调：无论成功失败都执行
- 错误后自动重新抛出，保持错误处理链完整

### 2. API 增强

#### `withLoading` 方法新增配置项

```typescript
withLoading(asyncFn, {
  onSuccess: (result) => {},  // ✨ 成功回调（可获取返回值）
  onError: (error) => {},     // 错误回调
  onFinally: () => {},        // 完成回调（无论成功/失败）
  keepLoadingOnError: false,  // 错误时是否保持 loading
  rethrowError: false,        // 是否重新抛出错误（默认 false，防止白屏）
})
```

#### 📝 回调函数说明

| 回调 | 触发时机 | 参数 | 用途 |
|------|---------|------|------|
| `onSuccess` | 异步函数成功执行后 | `result: T` | 处理返回数据、显示成功提示 |
| `onError` | 异步函数抛出错误时 | `error: Error` | 错误提示、日志上报 |
| `onFinally` | 无论成功或失败 | - | 清理操作、关闭弹窗 |

```typescript
// ✅ 推荐用法：使用 onSuccess 处理返回数据
await withLoading(
  async () => {
    const res = await fetchUserInfo();
    return res.data;
  },
  {
    onSuccess: (userData) => {
      // 成功时处理数据
      user.value = userData;
      message.success('加载成功');
    },
    onError: (err) => {
      // 错误时提示
      message.error(err.message);
    },
    onFinally: () => {
      // 无论成功失败都执行
      console.log('请求结束');
    },
  }
);
```

#### 🛡️ 防止白屏机制

**问题**：在 Vue 中，未捕获的 Promise rejection 会导致应用白屏。

**解决方案**：
- `withLoading` 默认会**吞掉错误**（`rethrowError: false`），不再重新抛出
- 通过 `onError` 回调处理错误提示，无需外层 try-catch
- 只有在明确需要错误传递时，才设置 `rethrowError: true`

```typescript
// ❌ 旧版本：未 catch 会导致白屏
withLoading(async () => {
  throw new Error('网络错误');
});

// ✅ 新版本：默认不会白屏
withLoading(
  async () => {
    throw new Error('网络错误');
  },
  {
    onError: (err) => message.error(err.message), // 错误会被捕获并提示
  }
);

// ⚠️ 如果需要外层捕获错误，设置 rethrowError: true
try {
  await withLoading(fetchData, { rethrowError: true });
} catch (error) {
  // 自定义错误处理
}
```

### 3. Demo 交互优化

#### 手动控制 Demo (`use-loading-manual.vue`)
- ✅ 使用 `a-spin` 组件替代静态文本标签
- ✅ 增强视觉反馈，loading 时显示旋转动画
- ✅ 优化布局，使用卡片式展示
- ✅ 增加状态值显示（true/false）

#### 基础使用 Demo (`use-loading-basic.vue`)
- ✅ 新增错误场景演示
- ✅ 展示 `onError` 和 `onFinally` 回调用法
- ✅ 使用 `a-space` 优化按钮布局

## 📊 对比

### 旧版本
```typescript
const { loading, withLoading } = useLoading();

// 简单包装，无法处理错误
await withLoading(async () => {
  await fetchData();
});
```

### 新版本
```typescript
const { loading, withLoading } = useLoading();

// 支持错误处理和回调
await withLoading(
  async () => {
    await fetchData();
  },
  {
    onError: (err) => message.error(err.message),
    onFinally: () => console.log('完成'),
  }
);
```

## 🔧 使用建议

1. **普通场景**：直接使用 `withLoading` 包装异步函数
2. **需要错误处理**：配置 `onError` 回调
3. **需要清理操作**：配置 `onFinally` 回调
4. **手动控制**：使用 `setLoading` 和 `toggleLoading`
5. **并发请求**：Hook 会自动处理计数，无需手动管理

## 📝 注意事项

- 手动调用 `setLoading(false)` 会重置并发计数器
- 错误会自动重新抛出，不影响外层的 try-catch
- 所有回调都是可选的，保持向后兼容
