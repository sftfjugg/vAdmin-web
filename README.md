### vAdmin-web[前端] -- CICD过程指标度量、自动化收集、可视化呈现

#### 开发

```bash
# install dependency
npm install

# run develop
npm run dev
```

## 发布

```bash
# install dependency
npm install

# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod

```bash
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
