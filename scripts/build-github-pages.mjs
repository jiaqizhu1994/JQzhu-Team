import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = await mkdtemp(path.join(os.tmpdir(), "academic-pages-"));
const outputRoot = path.join(root, "out");
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] || "JQzhu-Team";
const siteBaseUrl = `https://jiaqizhu1994.github.io/${repositoryName}/`;
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

function collectImagePaths(value, paths = new Set()) {
  if (typeof value === "string") {
    if (/^\/(?:images|uploads)\/.*\.(?:jpe?g|png|webp)$/i.test(value)) {
      paths.add(value);
    }
    return paths;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectImagePaths(item, paths));
    return paths;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectImagePaths(item, paths));
  }
  return paths;
}

function replaceAssetPaths(value, replacements) {
  if (typeof value === "string") {
    return replacements.get(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceAssetPaths(item, replacements));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceAssetPaths(item, replacements),
      ]),
    );
  }
  return value;
}

async function optimizePublicImages() {
  const dataPath = path.join(buildRoot, "content", "site-data.json");
  const siteData = JSON.parse(await readFile(dataPath, "utf8"));
  const imagePaths = [...collectImagePaths(siteData)];
  const replacements = new Map();
  let originalBytes = 0;
  let optimizedBytes = 0;

  for (const imagePath of imagePaths) {
    const source = path.join(buildRoot, "public", imagePath.slice(1));
    let sourceStats;
    try {
      sourceStats = await stat(source);
    } catch {
      continue;
    }

    if (sourceStats.size < 180 * 1024) {
      continue;
    }

    const parsed = path.posix.parse(imagePath);
    const optimizedPath = `/_optimized${parsed.dir}/${parsed.name}.webp`;
    const target = path.join(buildRoot, "public", optimizedPath.slice(1));
    await mkdir(path.dirname(target), { recursive: true });

    await sharp(source)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 84, effort: 5, smartSubsample: true })
      .toFile(target);

    const targetStats = await stat(target);
    if (targetStats.size >= sourceStats.size * 0.92) {
      await rm(target, { force: true });
      continue;
    }

    replacements.set(imagePath, optimizedPath);
    originalBytes += sourceStats.size;
    optimizedBytes += targetStats.size;
  }

  if (replacements.size) {
    await writeFile(
      dataPath,
      `${JSON.stringify(replaceAssetPaths(siteData, replacements), null, 2)}\n`,
      "utf8",
    );
  }

  const savedMb = (originalBytes - optimizedBytes) / 1024 / 1024;
  console.log(
    `Optimized ${replacements.size} public images; reduced page image payload by ${savedMb.toFixed(1)} MB.`,
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

async function writeSeoFiles() {
  const siteData = JSON.parse(
    await readFile(path.join(root, "content", "site-data.json"), "utf8"),
  );
  const urls = [siteBaseUrl];

  for (let index = 0; index < (siteData.news?.length ?? 0); index += 1) {
    urls.push(`${siteBaseUrl}news/${index}/`);
  }
  for (let index = 0; index < (siteData.activities?.length ?? 0); index += 1) {
    urls.push(`${siteBaseUrl}activities/${index}/`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteBaseUrl}sitemap.xml
`;

  await writeFile(path.join(outputRoot, "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(outputRoot, "robots.txt"), robots, "utf8");
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
  await optimizePublicImages();
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
  await writeSeoFiles();
  await writeFile(path.join(outputRoot, ".nojekyll"), "", "utf8");
  console.log(`\nGitHub Pages static site generated at ${outputRoot}`);
} finally {
  await rm(buildRoot, { recursive: true, force: true });
}
