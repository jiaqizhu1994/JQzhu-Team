import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = await mkdtemp(path.join(os.tmpdir(), "academic-pages-"));
const outputRoot = path.join(root, "out");
const excludedRoots = [
  ".git",
  ".next",
  ".pages-build",
  "node_modules",
  "out",
  path.join("src", "app", "admin"),
  path.join("src", "app", "admin-json"),
  path.join("src", "app", "api"),
];

function isExcluded(source) {
  const relative = path.relative(root, source);
  if (!relative) return false;
  if (relative === "middleware.ts" || relative === ".env.local") return true;
  if (/^\.env\..*\.local$/.test(relative)) return true;
  if (
    relative === path.join("content", "admin-auth.json") ||
    relative === path.join("content", "admin-password-reset.json")
  ) {
    return true;
  }
  return excludedRoots.some(
    (entry) => relative === entry || relative.startsWith(`${entry}${path.sep}`),
  );
}

async function makePublicPagesStatic() {
  const homePage = path.join(buildRoot, "src", "app", "page.tsx");
  const homeSource = await readFile(homePage, "utf8");
  await writeFile(
    homePage,
    homeSource.replace('export const dynamic = "force-dynamic";', ""),
    "utf8",
  );

  const siteData = JSON.parse(
    await readFile(path.join(buildRoot, "content", "site-data.json"), "utf8"),
  );
  const detailRoutes = [
    {
      section: "news",
      count: siteData.news?.length ?? 0,
      client: "NewsDetailClient",
      prop: "newsIndex",
    },
    {
      section: "activities",
      count: siteData.activities?.length ?? 0,
      client: "ActivityDetailClient",
      prop: "activityIndex",
    },
  ];

  for (const route of detailRoutes) {
    const sectionRoot = path.join(buildRoot, "src", "app", route.section);
    await rm(path.join(sectionRoot, "[index]", "page.tsx"), { force: true });
    for (let index = 0; index < route.count; index += 1) {
      const pageRoot = path.join(sectionRoot, String(index));
      await mkdir(pageRoot, { recursive: true });
      const source = `import { ${route.client} } from "../[index]/${route.client}";
import { SiteDataProvider } from "@/lib/siteDataContext";
import { readSavedSiteData } from "@/lib/siteDataServer";

export default async function StaticDetailPage() {
  const initialData = await readSavedSiteData();
  if (!initialData) return null;
  return (
    <SiteDataProvider initialData={initialData}>
      <${route.client} ${route.prop}={${index}} />
    </SiteDataProvider>
  );
}
`;
      await writeFile(path.join(pageRoot, "page.tsx"), source, "utf8");
    }
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with code ${code}`)),
    );
  });
}

await rm(outputRoot, { recursive: true, force: true });

try {
  await cp(root, buildRoot, {
    recursive: true,
    filter: (source) => !isExcluded(source),
  });
  await cp(path.join(root, "node_modules"), path.join(buildRoot, "node_modules"), {
    recursive: true,
  });
  await makePublicPagesStatic();

  const nextBin = path.join(
    buildRoot,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  await run(process.execPath, [nextBin, "build", "--webpack"], {
    cwd: buildRoot,
    env: { ...process.env, GITHUB_PAGES_EXPORT: "true" },
  });

  await cp(path.join(buildRoot, "out"), outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, ".nojekyll"), "", "utf8");
  console.log(`\nGitHub Pages static site generated at ${outputRoot}`);
} finally {
  await rm(buildRoot, { recursive: true, force: true });
}
