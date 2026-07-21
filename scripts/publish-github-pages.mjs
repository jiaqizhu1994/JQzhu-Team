import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function git(args, acceptedCodes = [0]) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (acceptedCodes.includes(code ?? -1)) {
        resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new Error(stderr.trim() || stdout.trim() || "Git command failed"));
      }
    });
  });
}

try {
  await git(["rev-parse", "--is-inside-work-tree"]);
} catch {
  throw new Error("尚未初始化 Git 仓库，请先按照 README 完成 GitHub 首次配置。");
}

const remote = await git(["remote", "get-url", "origin"]).catch(() => null);
if (!remote?.stdout) {
  throw new Error("尚未配置 GitHub 远程仓库 origin，请先按照 README 完成首次配置。");
}

await git(["add", "--", "content/site-data.json", "public/uploads"]);
const diff = await git(["diff", "--cached", "--quiet"], [0, 1]);
if (diff.code === 1) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await git(["commit", "-m", `content: publish ${timestamp}`]);
}

await git(["push"]);
console.log(
  diff.code === 1
    ? "内容已推送，GitHub Pages 正在自动更新。"
    : "没有新的内容变更，已确认 GitHub 仓库为最新状态。",
);
