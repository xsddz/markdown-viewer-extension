# SDK 实施方案

本文档描述 Markdown Viewer SDK 的实施方案和架构设计。

---

## 一、目标

为 Markdown Viewer Extension 提供独立的 SDK 包，使其他项目可以通过 npm 或 CDN 方式使用：

- Markdown 处理和渲染
- 图表渲染（Mermaid、Vega、Graphviz 等）
- 内置主题系统（开箱即用）
- DOCX 导出

### 设计原则

1. **最小化** - 单包包含所有核心功能
2. **零侵入** - 不修改现有 `src/` 代码
3. **自动继承** - 主项目更新时自动获得新功能
4. **开箱即用** - 内置主题，无需额外配置
5. **多格式输出** - 支持 ESM、IIFE

---

## 二、目录结构

```
markdown-viewer-extension/
├── src/                          # 现有核心源码（保持不变）
│   ├── themes/                   # 主题 JSON 配置（唯一数据源）
│   │   ├── presets/              # 主题预设
│   │   ├── color-schemes.json    # 颜色方案
│   │   ├── layout-schemes.json   # 布局方案
│   │   └── ...
│   └── ui/styles.css             # 基础样式（SDK 参考来源）
│
├── packages/                     # SDK 包目录
│   ├── src/
│   │   ├── index.ts              # 入口，重新导出功能
│   │   ├── themes.ts             # 主题 API（list/apply/toCSS）
│   │   ├── themes-data.ts        # 自动生成（CSS + 主题 JSON）（gitignored）
│   │   └── sdk-defaults.ts       # Mermaid CDN 加载工具
│   ├── scripts/
│   │   └── generate-themes.js    # 唯一生成脚本（CSS + JSON → themes-data.ts）
│   ├── dist/                     # 构建输出（gitignored）
│   ├── examples/
│   │   ├── all-diagrams.html     # 图表渲染演示
│   │   ├── all-themes.html       # 主题切换演示（使用 IMPLEMENTATION.md）
│   │   └── docx-export.html      # DOCX 导出演示
│   ├── build.js                  # 构建脚本
│   ├── package.json              # 包配置
│   └── README.md                 # 使用文档
│
└── package.json                  # 根目录配置 workspaces
```

---

## 三、核心架构

### 3.1 零维护成本设计

SDK 使用"单脚本生成"架构，确保与插件完全一致：

```
构建时:
  src/ui/styles.css        ─┬─▶  generate-themes.js  ──▶  themes-data.ts
  src/themes/*.json        ─┘                              │
                                                           ├── BASE_CSS (布局)
运行时:                                                     ├── THEME_* (颜色/字体)
  themes.apply('id')  ──▶  注入 base-styles + theme-colors
```

**零维护原理：**

1. 一个脚本 `generate-themes.js` 同时处理 CSS 和 JSON
2. 生成单个 `themes-data.ts` 包含所有数据
3. `themes.ts` 只是"胶水"代码，不包含任何样式数值

### 3.2 文件职责

| 文件 | 职责 | 维护方式 |
|------|------|---------|
| `src/ui/styles.css` | 布局样式（原生插件使用） | 手动编辑 |
| `src/themes/*.json` | 主题数据（颜色、字体） | 手动编辑 |
| `themes-data.ts` | CSS + 主题数据（SDK 使用） | **自动生成** |
| `themes.ts` | 主题 API + CSS 合成 | 手动维护 |
| `sdk-defaults.ts` | Mermaid CDN 加载 | 手动维护 |

### 3.3 CSS 分层策略

`themes.apply()` 注入两层 CSS：

```
┌─────────────────────────────────────────────────────┐
│ 1. BASE_CSS (布局，来自 themes-data.ts)             │
│    - border-radius, padding, margin 等              │
│    - 直接从 styles.css 提取，与插件完全一致          │
└─────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────┐
│ 2. themes.toCSS() (颜色/字体覆盖)                   │
│    - color, background, font-family, font-size      │
│    - 从主题 JSON 动态生成                            │
└─────────────────────────────────────────────────────┘
```

```typescript
// themes-data.ts 提供布局（自动从 styles.css 提取）
#markdown-content code {
  border-radius: 3px;
  padding: 2px 5px;
}

// themes.toCSS() 只覆盖颜色/字体（从 JSON 生成）
#markdown-content code {
  font-family: ${fontFamily};
  background: ${bgColor};
}
```

---

## 四、构建流程

```bash
npm run build --workspace=packages
```

执行步骤：

1. **生成 SDK 数据** - `scripts/generate-themes.js`
   - 从 `src/ui/styles.css` 提取 `#markdown-content` 相关规则
   - 从 `src/themes/` 读取所有 JSON
   - 生成单个 `src/themes-data.ts`

2. **esbuild 打包** - 三种格式
   - ESM: `dist/index.esm.js`
   - IIFE: `dist/index.iife.js`
   - IIFE.min: `dist/index.iife.min.js`

---

## 五、自动继承机制

使用 `export *` 确保主项目更新时自动继承：

```typescript
export * from '../../src/core/markdown-processor';
```

| 更新类型 | 是否自动继承 |
|---------|------------|
| Bug 修复 | ✅ 自动 |
| 新增函数 | ✅ 自动 |
| 新增参数 | ✅ 自动 |
| 性能优化 | ✅ 自动 |
| 布局样式修改 | ✅ 自动（重新构建后）|
| 新增主题 | ✅ 自动（重新构建后）|
| Breaking changes | ⚠️ 需更新版本号 |

---

## 六、主题维护

### 添加新主题

1. 在 `src/themes/presets/` 添加 JSON 文件
2. 运行 `npm run build --workspace=packages`
3. 新主题自动可用

### 修改颜色/字体

1. 编辑 `src/themes/color-schemes.json` 等
2. 重新构建
3. SDK 自动获得更新

### 修改布局样式

1. 修改 `src/ui/styles.css`（插件和 SDK 共享）
2. 重新构建 SDK
3. SDK 自动获得更新（**零手动同步**）

---

## 七、实施状态

| 功能 | 状态 |
|------|------|
| 核心 Markdown 处理 | ✅ 完成 |
| 图表渲染（Mermaid 等） | ✅ 完成 |
| 内置主题 API | ✅ 完成 |
| 主题数据自动生成 | ✅ 完成 |
| 布局样式自动生成 | ✅ 完成 |
| DOCX 导出 | ✅ 完成 |
| 示例页面 | ✅ 完成 |

### 主题统计

- 29 个主题预设
- 15 个颜色方案
- 6 个布局方案
- 9 个表格样式
- 6 个代码主题

---

## 八、注意事项

1. **base-styles.ts 不要手动编辑** - 它是自动从 styles.css 生成的
2. **themes-data.ts 不要手动编辑** - 它是自动从 JSON 生成的
3. **两个文件已加入 .gitignore** - 每次构建重新生成
4. **Mermaid 从 CDN 加载** - 使用 `init()` 或 `initMermaid()`

---

## 九、与插件的区别

| 特性 | 插件 | SDK |
|------|------|-----|
| 主题加载 | Platform API + fetch | 内联数据 |
| 布局样式 | 直接使用 styles.css | 从 styles.css 自动提取 |
| 颜色/字体 | 从 JSON 动态生成 | 从 JSON 自动生成 |
| Mermaid | 打包进扩展 | CDN 动态加载 |
| UI 组件 | 工具栏、目录树 | 不包含 |
| 使用场景 | 浏览器扩展 | npm/CDN 集成 |
