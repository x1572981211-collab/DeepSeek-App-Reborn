# 如何连接并登录 GitHub

要将这个项目连接到你的 GitHub 并且把代码推上去，你可以按照以下步骤操作：

## 第一步：在 GitHub 上创建新仓库
1. 登录你的 [GitHub 账号](https://github.com/)。
2. 点击右上角的 **+** 号图标，选择 **New repository** (新建仓库)。
3. 填写仓库名称（例如 `deepseek-app-reborn`）。
4. （可选）填写描述。
5. 仓库类型选择 **Public** (公开) 或 **Private** (私有)。
6. **不要**勾选 "Initialize this repository with a README"（因为你本地已经有代码了）。
7. 点击 **Create repository**。

## 第二步：在本地登录并配置 Git 账号
如果你还没有在当前电脑上用过 Git，你需要先设置你的名字和邮箱：

1. 按 `Win + R` 打开运行，输入 `cmd` 打开命令行。
2. 输入以下命令并回车（替换成你自己的名字和邮箱）：
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## 第三步：连接远程并推送代码

因为你的项目目前已经有了本地仓库（`git status` 显示你在 main 分支上有未提交的更改），所以你只需要把改动提交并推送到刚才新建的 GitHub 仓库即可。

### 方法 1：使用 Git 命令行 (推荐)
在当前 `deepseek-app-reborn` 目录下的命令行窗口执行：

```bash
# 1. 暂存所有现有更改
git add .

# 2. 提交更改
git commit -m "Update docs and fix backend deployment bugs"

# 3. 关联你的 GitHub 仓库（把你新建仓库的链接复制过来替换下面的 URL）
git remote add origin https://github.com/你的用户名/deepseek-app-reborn.git

# 4. 推送到 GitHub
git push -u origin main
```
*在第 4 步执行时，如果这是你第一次推送，Windows 会弹出一个 GitHub 登录窗口。点击 "Sign in with your browser"（用浏览器登录），在弹出的网页上授权即可完成账号登录。*

---

### 方法 2：使用我为你写好的自动推送脚本

我在当前文件夹下为你生成了一个名为 `1_推送到GitHub.bat` 的脚本文件。

如果你已经完成了**第一步（创建好仓库）**和**第二步（配置好账号）**，并且获取到了类似 `https://github.com/用户名/仓库名.git` 的地址，请直接双击运行我刚写好的 `1_推送到GitHub.bat` 文件。

它会自动引导你填写地址，并完成所有的提交流程！会自动唤起刚才提到的浏览器授权界面进行登录！
