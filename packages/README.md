# markdown-viewer-sdk

Markdown 处理库，支持图表渲染、内置主题和 DOCX 导出。

[![npm version](https://img.shields.io/npm/v/markdown-viewer-sdk.svg)](https://www.npmjs.com/package/markdown-viewer-sdk)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)

## 特性

- **GFM 支持** - 完整的 GitHub Flavored Markdown 支持
- **图表渲染** - Mermaid、Vega、Graphviz、Draw.io、Infographic
- **数学公式** - KaTeX 支持
- **代码高亮** - 100+ 种语言的语法高亮
- **内置主题** - 29 个开箱即用的主题，无需额外配置
- **DOCX 导出** - 导出为 Microsoft Word 文档

## 安装

### npm / yarn / pnpm

```bash
npm install markdown-viewer-sdk

# or
yarn add markdown-viewer-sdk

# or
pnpm add markdown-viewer-sdk
```

### CDN（发布后可用）

```html
<script src="https://cdn.jsdelivr.net/npm/markdown-viewer-sdk/dist/index.iife.min.js"></script>
```

### 本地开发

```bash
# 方式 1: npm link
cd packages
npm link
cd your-project
npm link markdown-viewer-sdk

# 方式 2: 直接引用本地路径
npm install file:../markdown-viewer-extension/packages
```

## 快速开始

### ES Modules

```typescript
import { toHtml, themes } from 'markdown-viewer-sdk';

// 应用主题
themes.apply('default');

// 渲染 Markdown
const html = await toHtml('# Hello World');
document.getElementById('output').innerHTML = html;
```

### 浏览器 (`<script>` 标签)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/markdown-viewer-sdk/dist/index.iife.min.js"></script>
</head>
<body>
  <div id="markdown-content"></div>
  <script>
    // 应用主题
    MarkdownViewer.themes.apply('default');
    
    // 渲染 Markdown
    MarkdownViewer.toHtml('# Hello World').then(html => {
      document.getElementById('markdown-content').innerHTML = html;
    });
  </script>
</body>
</html>
```

## API 参考

### Markdown 处理

#### `toHtml(markdown: string): Promise<string>`

将 Markdown 转换为 HTML（不渲染图表）。

```typescript
import { toHtml } from 'markdown-viewer-sdk';

const html = await toHtml(`
# 标题

这是 **粗体** 和 *斜体*。

- 列表项 1
- 列表项 2
`);
```

#### `toHtmlWithRendering(markdown: string): Promise<string>`

将 Markdown 转换为 HTML，并渲染所有图表（需要先调用 `init()`）。

```typescript
import { init, toHtmlWithRendering } from 'markdown-viewer-sdk';

// 初始化（加载 Mermaid）
await init();

const html = await toHtmlWithRendering(`
# 我的图表

\`\`\`mermaid
flowchart LR
    A-->B-->C
\`\`\`
`);
```

#### `processMarkdownToHtml(markdown: string, options: ProcessMarkdownOptions): Promise<string>`

完整的 Markdown 处理，支持自定义选项。

```typescript
import { processMarkdownToHtml, AsyncTaskManager } from 'markdown-viewer-sdk';

const html = await processMarkdownToHtml(markdown, {
  renderer: myCustomRenderer,
  taskManager: new AsyncTaskManager(),
  frontmatterDisplay: 'show',
  highlightCurrentLine: 5,
});
```

---

### 主题系统

SDK 内置 29 个主题，开箱即用。

#### `themes.list(): ThemeInfo[]`

获取所有可用主题列表。

```typescript
import { themes } from 'markdown-viewer-sdk';

const themeList = themes.list();
console.log(themeList);
// [
//   { id: 'default', name: '默认', category: 'classic', featured: true },
//   { id: 'palatino', name: 'Palatino', category: 'classic', featured: true },
//   ...
// ]
```

#### `themes.listByCategory(): CategoryInfo[]`

按分类获取主题列表。

```typescript
const categories = themes.listByCategory();
// [
//   { id: 'classic', name: '经典', themes: [...] },
//   { id: 'creative', name: '创意', themes: [...] },
//   ...
// ]
```

#### `themes.apply(themeId: string): void`

应用主题到当前文档。

```typescript
// 应用主题
themes.apply('palatino');

// 切换主题
themes.apply('academic');
```

#### `themes.toCSS(themeId: string): string`

获取主题的 CSS 字符串（不应用）。

```typescript
const css = themes.toCSS('default');
console.log(css);
// #markdown-content { font-family: ...; color: ...; }
// #markdown-content h1 { ... }
// ...
```

#### `themes.get(themeId: string): ThemePreset`

获取主题的完整配置。

```typescript
const preset = themes.get('default');
console.log(preset.colorScheme);  // 'light'
console.log(preset.fontScheme);   // { body: {...}, headings: {...} }
```

---

### 图表渲染

#### `init(): Promise<void>`

初始化 SDK，加载 Mermaid 库。

```typescript
import { init } from 'markdown-viewer-sdk';

await init();
// 现在可以使用 toHtmlWithRendering() 渲染 Mermaid 图表
```

#### `initMermaid(): Promise<void>`

手动初始化 Mermaid（`init()` 内部调用）。

#### `isMermaidAvailable(): boolean`

检查 Mermaid 是否可用。

```typescript
if (isMermaidAvailable()) {
  // 可以渲染 Mermaid 图表
}
```

#### `renderers`

内置渲染器数组。

```typescript
import { renderers } from 'markdown-viewer-sdk';

console.log(renderers.map(r => r.type));
// ['mermaid', 'vega-lite', 'vega', 'html', 'svg', 'dot', 'infographic', 'canvas', 'drawio']
```

---

### DOCX 导出

```typescript
import { DocxExporter } from 'markdown-viewer-sdk';

const exporter = new DocxExporter();

// 导出 Markdown 到 DOCX（浏览器自动下载）
await exporter.exportToDocx(
  '# Hello World\n\n这是 **粗体** 文本。',
  'document.docx',
  (current, total) => console.log(`进度: ${current}/${total}`)
);
```

> **注意：** `exportToDocx` 接受 Markdown 字符串（不是 HTML），内部处理转换。

---

## 框架集成

### Vue.js

```vue
<template>
  <div id="markdown-content" v-html="renderedHtml" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { toHtml, themes } from 'markdown-viewer-sdk';

const props = defineProps<{ markdown: string }>();
const renderedHtml = ref('');

onMounted(() => {
  themes.apply('default');
});

watch(() => props.markdown, async (md) => {
  renderedHtml.value = await toHtml(md);
}, { immediate: true });
</script>
```

### React

```tsx
import { useEffect, useState } from 'react';
import { toHtml, themes } from 'markdown-viewer-sdk';

function MarkdownRenderer({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    themes.apply('default');
  }, []);

  useEffect(() => {
    toHtml(markdown).then(setHtml);
  }, [markdown]);

  return <div id="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
```

---

## 浏览器兼容性

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

---

## 本地运行示例

示例需要通过 HTTP 服务器运行：

```bash
cd packages
npx serve .
```

然后打开：

| 示例 | URL | 说明 |
|------|-----|------|
| 主题演示 | http://localhost:3000/examples/all-themes.html | 29 个内置主题切换 |
| 图表演示 | http://localhost:3000/examples/all-diagrams.html | Mermaid 流程图、时序图等 |
| DOCX 导出 | http://localhost:3000/examples/docx-export.html | 导出 Word 文档 |

---

## 注意事项

### 容器 ID

主题 CSS 默认针对 `#markdown-content` 选择器，确保渲染容器使用此 ID：

```html
<div id="markdown-content">
  <!-- 渲染的 HTML 放这里 -->
</div>
```

### 图表渲染

图表渲染需要先初始化：

```typescript
import { init, toHtmlWithRendering } from 'markdown-viewer-sdk';

// 必须先调用 init()
await init();

// 然后使用 toHtmlWithRendering
const html = await toHtmlWithRendering(markdownWithMermaid);
```

或者手动加载 Mermaid：

```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
</script>
```

### DOCX 导出限制

`DocxExporter` 在纯浏览器环境可能有限制。推荐使用场景：

- ✅ 浏览器扩展环境
- ✅ Node.js 环境
- ⚠️ 纯浏览器环境（部分功能受限）

---

## 相关链接

- [Markdown Viewer Extension](https://github.com/nickyc975/markdown-viewer-chrome) - 父项目
- [Chrome Web Store](https://chrome.google.com/webstore/detail/markdown-viewer) - 浏览器扩展

## 许可证

[GPL-3.0](https://opensource.org/licenses/GPL-3.0)
