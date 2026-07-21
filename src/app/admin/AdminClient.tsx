"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Download,
  Home,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  SITE_DATA_STORAGE_KEY,
  type SiteData,
} from "@/lib/siteDataContext";
import { normalizeSiteData } from "@/lib/siteDataDefaults";
import { MultiImageField } from "./MultiImageField";
import { withPublicBasePath } from "@/lib/publicPath";
import {
  orderActivityItems,
  orderNewsItems,
  orderPublicationItems,
} from "@/lib/contentOrdering";

type Path = Array<string | number>;
type Member = SiteData["members"]["masterStudents"][number];
const ADMIN_DRAFT_STORAGE_KEY = "academic-admin-unsaved-draft";
type SaveFeedback = { type: "success" | "error"; text: string } | null;
type StoredAdminDraft = {
  version: 2;
  baseSnapshotId: string;
  data: SiteData;
};
type SectionId =
  | "hero"
  | "about"
  | "research"
  | "news"
  | "publications"
  | "team"
  | "activities"
  | "join"
  | "contact"
  | "sectionText"
  | "advanced";

const sections: Array<{ id: SectionId; label: string; hint: string }> = [
  { id: "hero", label: "首页首屏", hint: "标题、关键词、统计数据" },
  { id: "about", label: "个人简介", hint: "负责人信息、简介、经历" },
  { id: "research", label: "研究方向", hint: "研究方向卡片" },
  { id: "news", label: "新闻动态", hint: "动态时间线" },
  { id: "publications", label: "论文成果", hint: "代表论文卡片" },
  { id: "team", label: "团队成员", hint: "导师团队、学生与毕业去向" },
  { id: "activities", label: "组内活动", hint: "活动图库" },
  { id: "join", label: "招生招聘", hint: "招生方向和要求" },
  { id: "contact", label: "联系方式", hint: "邮箱、地址、链接" },
  { id: "sectionText", label: "板块标题", hint: "各模块标题与说明" },
  { id: "advanced", label: "高级工具", hint: "导入导出完整数据" },
];

const sectionSubtitleFields: Array<{
  key: keyof SiteData["sectionTitles"];
  label: string;
}> = [
  { key: "about", label: "个人简介" },
  { key: "research", label: "研究方向" },
  { key: "news", label: "新闻动态" },
  { key: "publications", label: "代表论文" },
  { key: "team", label: "团队成员" },
  { key: "activities", label: "组内活动" },
  { key: "alumni", label: "毕业去向" },
  { key: "contact", label: "联系方式" },
];

const teamGroupTitleFields: Array<{
  key: keyof SiteData["teamGroupTitles"];
  label: string;
}> = [
  { key: "principalInvestigator", label: "负责人分组" },
  { key: "postdoctoralResearchers", label: "导师团队分组" },
  { key: "phdStudents", label: "博士研究生分组" },
  { key: "masterStudents", label: "硕士研究生分组" },
  { key: "undergraduateInterns", label: "本科实习生分组" },
];

const emptyItems = {
  stat: { value: "0", label: "New Stat" },
  timeline: { year: "年份", title: "经历标题", description: "经历说明" },
  research: {
    title: "新研究方向",
    description: "请输入研究方向简介。",
    tags: ["关键词"],
    image: "/images/research-qd.svg",
    images: ["/images/research-qd.svg"],
    href: "#contact",
    accent: "from-blue-50 via-cyan-50 to-white",
  },
  news: {
    date: "2026-01-01",
    type: "News",
    pinned: false,
    title: "新闻标题",
    description: "新闻简介",
    detail: "新闻详细内容",
    images: [] as string[],
  },
  publication: {
    journal: "Journal",
    year: "2026",
    title: "论文标题",
    authors: "作者信息",
    image: "/images/publication-abstract.svg",
    images: ["/images/publication-abstract.svg"],
    links: { doi: "#" },
  },
  project: {
    name: "项目名称",
    type: "项目类型",
    period: "2026 - 2028",
    leader: "负责人",
    description: "项目简介",
    status: "Ongoing",
    tone: "blue",
  },
  member: {
    name: "成员姓名",
    role: "成员身份",
    focus: "研究方向",
    email: "email@example.com",
    avatar: "/images/member-avatar.svg",
  },
  activity: {
    title: "活动标题",
    date: "2026-01-01",
    type: "Activity",
    description: "活动说明",
    detail: "活动详细内容",
    image: "/images/activity-group.svg",
    images: ["/images/activity-group.svg"],
  },
  piLink: {
    label: "New Link",
    href: "https://example.com",
  },
  contactLink: {
    label: "联系选项",
    href: "https://example.com",
  },
  alumni: {
    name: "姓名或匿名信息",
    year: "届别",
    destination: "去向",
    field: "方向",
  },
};

function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

function createSnapshotId(snapshot: string) {
  let hash = 2166136261;
  for (let index = 0; index < snapshot.length; index += 1) {
    hash ^= snapshot.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${snapshot.length}-${(hash >>> 0).toString(16)}`;
}

function serializeAdminDraft(data: SiteData, baseSnapshot: string) {
  const storedDraft: StoredAdminDraft = {
    version: 2,
    baseSnapshotId: createSnapshotId(baseSnapshot),
    data: normalizeSiteData(data),
  };
  return JSON.stringify(storedDraft);
}

function parseAdminDraft(value: string): StoredAdminDraft | null {
  try {
    const parsed = JSON.parse(value) as Partial<StoredAdminDraft>;
    if (
      parsed.version !== 2 ||
      typeof parsed.baseSnapshotId !== "string" ||
      !parsed.data
    ) {
      return null;
    }

    return {
      version: 2,
      baseSnapshotId: parsed.baseSnapshotId,
      data: normalizeSiteData(parsed.data),
    };
  } catch {
    return null;
  }
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value: string[] | undefined) {
  return (value ?? []).join("\n");
}

function getAtPath(source: unknown, path: Path): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[String(key)];
    }

    return undefined;
  }, source);
}

function assignAtPath(target: Record<string, unknown>, path: Path, value: unknown) {
  let cursor: Record<string, unknown> | unknown[] = target;

  path.slice(0, -1).forEach((key) => {
    cursor = (cursor as Record<string, unknown>)[String(key)] as
      | Record<string, unknown>
      | unknown[];
  });

  const lastKey = path[path.length - 1];

  if (Array.isArray(cursor) && typeof lastKey === "number") {
    cursor[lastKey] = value;
  } else {
    (cursor as Record<string, unknown>)[String(lastKey)] = value;
  }
}

export default function AdminPage({ initialData }: { initialData: SiteData }) {
  const [draft, setDraft] = useState<SiteData>(() =>
    normalizeSiteData(initialData),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [message, setMessage] = useState("修改内容后点击右上角“保存修改”。");
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(initialData, null, 2),
  );
  const [jsonError, setJsonError] = useState("");
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback>(null);
  const [remoteUpdate, setRemoteUpdate] = useState<SiteData | null>(null);
  const [newItemListKey, setNewItemListKey] = useState<string | null>(null);
  const contentRef = useRef<HTMLElement>(null);
  const skipNextDraftWrite = useRef(false);
  const draftRef = useRef(draft);
  const pendingRemoteSnapshotRef = useRef("");
  const savedSnapshotRef = useRef(
    JSON.stringify(normalizeSiteData(initialData)),
  );

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedData() {
      try {
        const response = await fetch("/api/site-data", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as SiteData;
        if (!isMounted) return;

        const normalizedData = normalizeSiteData(data);
        const savedSnapshot = JSON.stringify(normalizedData);
        savedSnapshotRef.current = savedSnapshot;
        const unsavedDraft = window.localStorage.getItem(
          ADMIN_DRAFT_STORAGE_KEY,
        );

        if (unsavedDraft) {
          const storedDraft = parseAdminDraft(unsavedDraft);
          const serverSnapshotId = createSnapshotId(savedSnapshot);
          const draftSnapshot = storedDraft
            ? JSON.stringify(storedDraft.data)
            : "";

          if (
            storedDraft &&
            storedDraft.baseSnapshotId === serverSnapshotId &&
            draftSnapshot !== savedSnapshot
          ) {
            draftRef.current = storedDraft.data;
            setDraft(storedDraft.data);
            setJsonText(JSON.stringify(storedDraft.data, null, 2));
            setMessage("检测到基于当前内容的未保存草稿，已自动恢复。");
          } else {
            window.localStorage.removeItem(ADMIN_DRAFT_STORAGE_KEY);
            draftRef.current = normalizedData;
            setDraft(normalizedData);
            setJsonText(JSON.stringify(normalizedData, null, 2));
            setMessage(
              storedDraft && draftSnapshot === savedSnapshot
                ? "已读取主机上的最新内容。"
                : "主机内容已被其他设备更新，已忽略本机旧草稿并载入最新内容。",
            );
          }
        } else {
          draftRef.current = normalizedData;
          setDraft(normalizedData);
          setJsonText(JSON.stringify(normalizedData, null, 2));
          setMessage("已读取项目文件夹中的已保存内容。");
        }
      } catch {
        setMessage("未读取到已保存文件，当前使用源码默认内容。");
      } finally {
        if (isMounted) {
          skipNextDraftWrite.current = true;
          setIsHydrated(true);
        }
      }
    }

    void loadSavedData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isMounted = true;
    let isChecking = false;

    async function checkForRemoteUpdates() {
      if (isChecking || document.visibilityState === "hidden") {
        return;
      }

      isChecking = true;
      try {
        const response = await fetch("/api/site-data", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const latestData = normalizeSiteData(await response.json());
        const latestSnapshot = JSON.stringify(latestData);
        if (!isMounted || latestSnapshot === savedSnapshotRef.current) {
          return;
        }

        const currentDraftSnapshot = JSON.stringify(
          normalizeSiteData(draftRef.current),
        );
        const hasLocalChanges =
          currentDraftSnapshot !== savedSnapshotRef.current;

        if (hasLocalChanges) {
          if (latestSnapshot !== pendingRemoteSnapshotRef.current) {
            pendingRemoteSnapshotRef.current = latestSnapshot;
            setRemoteUpdate(latestData);
          }
          return;
        }

        savedSnapshotRef.current = latestSnapshot;
        pendingRemoteSnapshotRef.current = "";
        draftRef.current = latestData;
        skipNextDraftWrite.current = true;
        setDraft(latestData);
        setJsonText(JSON.stringify(latestData, null, 2));
        setRemoteUpdate(null);
        clearUnsavedDraft();
        window.localStorage.setItem(
          SITE_DATA_STORAGE_KEY,
          JSON.stringify(latestData),
        );
        window.dispatchEvent(new Event("site-data-updated"));
        setMessage("检测到其他设备保存的新内容，后台已自动同步。");
      } catch {
        // A temporary network interruption should not disturb local editing.
      } finally {
        isChecking = false;
      }
    }

    const interval = window.setInterval(checkForRemoteUpdates, 3000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkForRemoteUpdates();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isHydrated]);

  const activeMeta = useMemo(
    () => sections.find((section) => section.id === activeSection),
    [activeSection],
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (skipNextDraftWrite.current) {
      skipNextDraftWrite.current = false;
      return;
    }

    const serializedDraft = JSON.stringify(draft);

    if (serializedDraft === savedSnapshotRef.current) {
      window.localStorage.removeItem(ADMIN_DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      ADMIN_DRAFT_STORAGE_KEY,
      serializeAdminDraft(draft, savedSnapshotRef.current),
    );
  }, [draft, isHydrated]);

  useEffect(() => {
    if (!saveFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSaveFeedback(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [saveFeedback]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMessage("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    if (!newItemListKey) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const list = document.querySelector(
        `[data-editable-list="${newItemListKey}"]`,
      );
      const field = list?.querySelector<HTMLElement>(
        'article input:not([type="date"]):not([type="checkbox"]):not([type="file"]), article textarea, article select',
      );

      field?.focus();
      setNewItemListKey(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [draft, newItemListKey]);

  function clearUnsavedDraft() {
    window.localStorage.removeItem(ADMIN_DRAFT_STORAGE_KEY);
  }

  function applyRemoteUpdate() {
    if (!remoteUpdate) {
      return;
    }

    const latestData = normalizeSiteData(remoteUpdate);
    const latestSnapshot = JSON.stringify(latestData);
    savedSnapshotRef.current = latestSnapshot;
    pendingRemoteSnapshotRef.current = "";
    draftRef.current = latestData;
    skipNextDraftWrite.current = true;
    setDraft(latestData);
    setJsonText(JSON.stringify(latestData, null, 2));
    setRemoteUpdate(null);
    clearUnsavedDraft();
    window.localStorage.setItem(
      SITE_DATA_STORAGE_KEY,
      JSON.stringify(latestData),
    );
    window.dispatchEvent(new Event("site-data-updated"));
    setMessage("已载入其他设备保存的最新内容。");
  }

  function selectSection(section: SectionId) {
    setActiveSection(section);
    window.requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function persistUnsavedDraft() {
    const serializedDraft = JSON.stringify(draft);

    if (serializedDraft === savedSnapshotRef.current) {
      clearUnsavedDraft();
      return;
    }

    window.localStorage.setItem(
      ADMIN_DRAFT_STORAGE_KEY,
      serializeAdminDraft(draft, savedSnapshotRef.current),
    );
  }

  function redirectToLogin() {
    persistUnsavedDraft();
    window.location.href = `/admin/login?next=${encodeURIComponent(
      window.location.pathname,
    )}`;
  }

  function setByPath(path: Path, value: unknown) {
    setSaveFeedback(null);
    const nextDraft = cloneData(draft) as Record<string, unknown>;
    assignAtPath(nextDraft, path, value);

    const typedDraft = nextDraft as SiteData;
    setDraft(typedDraft);
    setJsonText(JSON.stringify(typedDraft, null, 2));
    setJsonError("");
  }

  function setImageCollection(
    path: Path,
    value: string[],
    primaryField = "image",
  ) {
    setSaveFeedback(null);
    const nextDraft = cloneData(draft) as Record<string, unknown>;
    assignAtPath(nextDraft, path, value);
    assignAtPath(nextDraft, [...path.slice(0, -1), primaryField], value[0] ?? "");

    const typedDraft = nextDraft as SiteData;
    setDraft(typedDraft);
    setJsonText(JSON.stringify(typedDraft, null, 2));
    setJsonError("");
  }

  function setPiTitles(value: string[]) {
    setSaveFeedback(null);
    const nextDraft = cloneData(draft) as Record<string, unknown>;
    assignAtPath(nextDraft, ["profile", "pi", "titles"], value);
    assignAtPath(nextDraft, ["profile", "pi", "title"], value.filter(Boolean).join(" / "));

    const typedDraft = nextDraft as SiteData;
    setDraft(typedDraft);
    setJsonText(JSON.stringify(typedDraft, null, 2));
    setJsonError("");
  }

  function addItem(path: Path, item: unknown) {
    const current = getAtPath(draft, path);
    const nextList = Array.isArray(current) ? [cloneData(item), ...current] : [];
    setNewItemListKey(path.join("."));
    setMessage("已在列表顶部新增内容，请继续填写。");
    setByPath(path, nextList);
  }

  function removeItem(path: Path, index: number) {
    const current = getAtPath(draft, path);
    if (!Array.isArray(current)) return;

    setByPath(
      path,
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function confirmAndSaveDraft() {
    setIsSaving(true);
    setSaveFeedback(null);

    try {
      const normalizedDraft = normalizeSiteData(draft);
      const response = await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedDraft),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error("保存失败，请稍后重试。");
      }

      const result = (await response.json()) as {
        cleanup?: { deleted?: string[] };
      };
      const deletedCount = result.cleanup?.deleted?.length ?? 0;
      const successText = `网站内容已保存。自动清理未使用图片 ${deletedCount} 张。`;
      savedSnapshotRef.current = JSON.stringify(normalizedDraft);
      pendingRemoteSnapshotRef.current = "";
      setRemoteUpdate(null);
      skipNextDraftWrite.current = true;
      draftRef.current = normalizedDraft;
      setDraft(normalizedDraft);
      setJsonText(JSON.stringify(normalizedDraft, null, 2));
      window.localStorage.setItem(
        SITE_DATA_STORAGE_KEY,
        JSON.stringify(normalizedDraft),
      );
      clearUnsavedDraft();
      window.dispatchEvent(new Event("site-data-updated"));
      setIsSaveConfirmOpen(false);
      setMessage(successText);
      setSaveFeedback({ type: "success", text: successText });
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "保存失败，请稍后重试。";
      setMessage(errorText);
      setSaveFeedback({ type: "error", text: errorText });
    } finally {
      setIsSaving(false);
    }
  }

  async function publishToGitHubPages() {
    const currentSnapshot = JSON.stringify(normalizeSiteData(draft));
    if (currentSnapshot !== savedSnapshotRef.current) {
      const text = "检测到未保存的修改，请先点击“保存修改”，再发布到 GitHub Pages。";
      setMessage(text);
      setSaveFeedback({ type: "error", text });
      return;
    }

    setIsPublishing(true);
    setSaveFeedback(null);
    try {
      const response = await fetch("/api/publish", { method: "POST" });
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error || "发布失败，请检查 GitHub 配置。");
      }
      const text = result.message || "已推送到 GitHub，公开网站正在自动更新。";
      setMessage(text);
      setSaveFeedback({ type: "success", text });
    } catch (error) {
      const text = error instanceof Error ? error.message : "发布失败。";
      setMessage(text);
      setSaveFeedback({ type: "error", text });
    } finally {
      setIsPublishing(false);
    }
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.status === 401) {
      redirectToLogin();
      throw new Error("登录已过期");
    }

    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(result.error || "图片上传失败");
    }

    const result = (await response.json()) as { path: string };
    setMessage("图片上传成功。");
    return result.path;
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "site-data-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function cleanupUploads() {
    try {
      const response = await fetch("/api/uploads/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizeSiteData(draft)),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(result.error || "清理图片失败");
      }

      const result = (await response.json()) as {
        cleanup?: { deleted?: string[] };
      };
      const deleted = result.cleanup?.deleted ?? [];
      setMessage(
        deleted.length
          ? `已清理未使用图片 ${deleted.length} 张。`
          : "没有发现未使用图片。",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "清理图片失败。");
    }
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const nextDraft = normalizeSiteData(JSON.parse(String(reader.result)));
        setDraft(nextDraft);
        setJsonText(JSON.stringify(nextDraft, null, 2));
        setJsonError("");
        setMessage("已导入，检查无误后点击“保存修改”。");
      } catch (error) {
        setJsonError(error instanceof Error ? error.message : "JSON 格式有误");
      }
    };
    reader.readAsText(file);
  }

  function applyJsonText() {
    try {
      const nextDraft = normalizeSiteData(JSON.parse(jsonText));
      setDraft(nextDraft);
      setJsonText(JSON.stringify(nextDraft, null, 2));
      setJsonError("");
      setMessage("完整数据已应用到编辑区，点击保存后生效。");
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "JSON 格式有误");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="section-eyebrow">Content Studio</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
              网站内容可视化管理
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              当前模块：{activeMeta?.label} · {activeMeta?.hint}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="secondary-button">
              <Home size={16} className="mr-2" />
              查看首页
            </Link>
            <button type="button" onClick={() => setIsSaveConfirmOpen(true)} disabled={isSaving} className="primary-button disabled:cursor-not-allowed disabled:opacity-60">
              <Save size={16} className="mr-2" />
              保存修改
            </button>
            <button
              type="button"
              onClick={publishToGitHubPages}
              disabled={isPublishing || isSaving}
              className="secondary-button disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <CloudUpload size={16} className="mr-2" />
              )}
              {isPublishing ? "正在发布" : "发布到公网"}
            </button>
            <button type="button" onClick={logout} className="secondary-button">
              <LogOut size={16} className="mr-2" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="h-fit rounded-card border border-slate-200 bg-white p-3 shadow-card lg:sticky lg:top-28 lg:flex lg:max-h-[calc(100vh-8rem)] lg:flex-col">
          <div className="rounded-[18px] bg-gradient-to-br from-academic-700 to-slate-950 p-5 text-white">
            <p className="text-sm font-semibold text-cyan-100">正在编辑</p>
            <h2 className="mt-2 text-xl font-semibold">
              {draft.profile.navTitle || draft.profile.groupName}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-200">
              {draft.profile.groupName}
            </p>
          </div>

          <nav className="admin-sidebar-scroll mt-3 grid gap-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => selectSection(section.id)}
                className={`rounded-2xl px-4 py-3 text-left transition ${
                  activeSection === section.id
                    ? "bg-blue-50 text-academic-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <span className="block text-sm font-semibold">{section.label}</span>
                <span className="mt-1 block text-xs">{section.hint}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section ref={contentRef} className="scroll-mt-28 space-y-6">
          {remoteUpdate ? (
            <div className="flex flex-col gap-4 rounded-card border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">其他设备已经保存了新内容</p>
                <p className="mt-1 leading-6 text-amber-800">
                  当前页面存在未保存修改，因此没有自动覆盖。载入最新内容会放弃本机尚未保存的编辑。
                </p>
              </div>
              <button
                type="button"
                onClick={applyRemoteUpdate}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white px-4 py-2 font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                <RefreshCw size={15} className="mr-2" />
                载入最新内容
              </button>
            </div>
          ) : null}
          {message ? (
            <div className="rounded-card border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-7 text-academic-700">
              {message}
            </div>
          ) : null}

          {activeSection === "hero" && (
            <AdminPanel eyebrow="Hero" title="首页首屏" subtitle="对应首页第一屏的标题、简介、标签和统计数字。">
              <PreviewHero draft={draft} />
              <FieldGrid>
                <TextField label="顶部胶囊小字" value={draft.profile.heroBadge ?? ""} onChange={(value) => setByPath(["profile", "heroBadge"], value)} />
                <ImageField label="导航栏 Logo / 头像" value={draft.profile.navLogo} onChange={(value) => setByPath(["profile", "navLogo"], value)} onUpload={uploadImage} />
                <TextField label="导航栏主标题" value={draft.profile.navTitle} onChange={(value) => setByPath(["profile", "navTitle"], value)} />
                <TextField label="导航栏副标题" value={draft.profile.navSubtitle} onChange={(value) => setByPath(["profile", "navSubtitle"], value)} />
                <TextField label="首页大标题" value={draft.profile.groupName} onChange={(value) => setByPath(["profile", "groupName"], value)} />
                <TextField label="英文副标题" value={draft.profile.englishName} onChange={(value) => setByPath(["profile", "englishName"], value)} />
                <TextArea label="一句话介绍" value={draft.profile.tagline} onChange={(value) => setByPath(["profile", "tagline"], value)} />
                <StringListField label="研究关键词" value={draft.profile.keywords} onChange={(value) => setByPath(["profile", "keywords"], value)} />
              </FieldGrid>
              <EditableList listKey="stats" title="统计数据" addLabel="新增统计" onAdd={() => addItem(["stats"], { ...emptyItems.stat, label: `New Stat ${draft.stats.length + 1}` })}>
                {draft.stats.map((item, index) => (
                  <MiniCard key={`stat-${index}`} title={`统计 ${index + 1}`} onRemove={() => removeItem(["stats"], index)}>
                    <FieldGrid compact>
                      <TextField label="数字" value={item.value} onChange={(value) => setByPath(["stats", index, "value"], value)} />
                      <TextField label="说明" value={item.label} onChange={(value) => setByPath(["stats", index, "label"], value)} />
                    </FieldGrid>
                  </MiniCard>
                ))}
              </EditableList>
            </AdminPanel>
          )}

          {activeSection === "about" && (
            <AdminPanel eyebrow="About PI" title="个人简介" subtitle="对应负责人卡片、个人简介正文和教育/工作经历时间线。">
              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-center">
                  <img src={withPublicBasePath(draft.profile.pi.avatar)} alt="负责人头像" className="mx-auto size-32 rounded-[26px] object-cover" />
                  <h3 className="mt-4 font-semibold text-slate-950">{draft.profile.pi.displayName}</h3>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {draft.profile.pi.titles.map((title, index) => (
                      <span key={`${title}-${index}`} className="blue-chip">{title}</span>
                    ))}
                  </div>
                </div>
                <FieldGrid>
                  <TextField label="姓名" value={draft.profile.pi.displayName} onChange={(value) => setByPath(["profile", "pi", "displayName"], value)} />
                  <EditableStringItemsField label="职称/身份" value={draft.profile.pi.titles} onChange={setPiTitles} addLabel="新增身份" onAdded={() => setMessage("已在顶部新增身份说明，请继续填写。")} />
                  <TextField label="单位" value={draft.profile.pi.school} onChange={(value) => setByPath(["profile", "pi", "school"], value)} />
                  <TextField label="邮箱" value={draft.profile.pi.email} onChange={(value) => setByPath(["profile", "pi", "email"], value)} />
                  <ImageField label="头像图片" value={draft.profile.pi.avatar} onChange={(value) => setByPath(["profile", "pi", "avatar"], value)} onUpload={uploadImage} />
                  <StringListField label="研究标签" value={draft.profile.pi.researchTags} onChange={(value) => setByPath(["profile", "pi", "researchTags"], value)} />
                </FieldGrid>
                <div className="lg:col-span-2">
                  <EditableList listKey="profile.pi.links" title="首屏按钮链接" addLabel="新增链接按钮" onAdd={() => addItem(["profile", "pi", "links"], emptyItems.piLink)}>
                    {draft.profile.pi.links.map((link, index) => (
                      <MiniCard key={`pi-link-${index}`} title={link.label || `链接 ${index + 1}`} onRemove={() => removeItem(["profile", "pi", "links"], index)}>
                        <FieldGrid compact>
                          <TextField label="按钮文字" value={link.label} onChange={(value) => setByPath(["profile", "pi", "links", index, "label"], value)} />
                          <TextField label="跳转地址" value={link.href} onChange={(value) => setByPath(["profile", "pi", "links", index, "href"], value)} />
                        </FieldGrid>
                      </MiniCard>
                    ))}
                  </EditableList>
                </div>
              </div>
              <TextArea label="个人简介段落，每行一段。需要加粗可写 **关键词**" value={joinLines(draft.profile.aboutParagraphs)} rows={8} onChange={(value) => setByPath(["profile", "aboutParagraphs"], splitLines(value))} />
              <EditableList listKey="timeline" title="教育 / 工作经历" addLabel="新增经历" onAdd={() => addItem(["timeline"], emptyItems.timeline)}>
                {draft.timeline.map((item, index) => (
                  <MiniCard key={`timeline-${index}`} title={item.year || `经历 ${index + 1}`} onRemove={() => removeItem(["timeline"], index)}>
                    <FieldGrid>
                      <TextField label="年份" value={item.year} onChange={(value) => setByPath(["timeline", index, "year"], value)} />
                      <TextField label="标题" value={item.title} onChange={(value) => setByPath(["timeline", index, "title"], value)} />
                      <TextArea label="说明" value={item.description} onChange={(value) => setByPath(["timeline", index, "description"], value)} />
                    </FieldGrid>
                  </MiniCard>
                ))}
              </EditableList>
            </AdminPanel>
          )}

          {activeSection === "research" && (
            <ListSection listKey="researchAreas" eyebrow="Research" title="研究方向" subtitle="对应首页研究方向卡片。" addLabel="新增方向" onAdd={() => addItem(["researchAreas"], emptyItems.research)}>
              {draft.researchAreas.map((item, index) => (
                <MiniCard key={`research-${index}`} title={item.title} image={item.images[0] ?? item.image} onRemove={() => removeItem(["researchAreas"], index)}>
                  <FieldGrid>
                    <TextField label="标题" value={item.title} onChange={(value) => setByPath(["researchAreas", index, "title"], value)} />
                    <MultiImageField label="图片" value={item.images} onChange={(value) => setImageCollection(["researchAreas", index, "images"], value)} onUpload={uploadImage} />
                    <TextArea label="简介" value={item.description} onChange={(value) => setByPath(["researchAreas", index, "description"], value)} />
                    <StringListField label="关键词标签" value={item.tags} onChange={(value) => setByPath(["researchAreas", index, "tags"], value)} />
                  </FieldGrid>
                </MiniCard>
              ))}
            </ListSection>
          )}

          {activeSection === "news" && (
              <ListSection listKey="news" eyebrow="News" title="新闻动态" subtitle="首页新闻分页列表。" addLabel="新增新闻" onAdd={() => addItem(["news"], emptyItems.news)}>
                {orderNewsItems(draft.news).map(({ item, index }) => (
                  <MiniCard key={`news-${index}`} title={item.title} badge={item.date} image={item.images[0]} onRemove={() => removeItem(["news"], index)}>
                    <FieldGrid>
                      <DateField label="日期" value={item.date} onChange={(value) => setByPath(["news", index, "date"], value)} />
                      <NewsTypeField value={item.type} onChange={(value) => setByPath(["news", index, "type"], value)} />
                      <label className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                        <input
                          type="checkbox"
                          checked={item.pinned}
                          onChange={(event) => setByPath(["news", index, "pinned"], event.target.checked)}
                          className="size-4 accent-amber-600"
                        />
                        置顶显示
                      </label>
                      <TextField label="标题" value={item.title} onChange={(value) => setByPath(["news", index, "title"], value)} />
                      <TextArea label="列表摘要" value={item.description} onChange={(value) => setByPath(["news", index, "description"], value)} />
                      <TextArea label="详细内容" value={item.detail} rows={7} onChange={(value) => setByPath(["news", index, "detail"], value)} />
                      <MultiImageField label="详情图片" value={item.images} onChange={(value) => setByPath(["news", index, "images"], value)} onUpload={uploadImage} />
                    </FieldGrid>
                  </MiniCard>
                ))}
              </ListSection>
          )}

          {activeSection === "publications" && (
            <ListSection listKey="publications" eyebrow="Publications" title="论文成果" subtitle="代表论文卡片。" addLabel="新增论文" onAdd={() => addItem(["publications"], emptyItems.publication)}>
              {orderPublicationItems(draft.publications).map(({ item, index }) => (
                <MiniCard key={`publication-${index}`} title={item.title} badge={`${item.journal} · ${item.year}`} image={item.images[0] ?? item.image} onRemove={() => removeItem(["publications"], index)}>
                  <FieldGrid>
                    <TextField label="期刊" value={item.journal} onChange={(value) => setByPath(["publications", index, "journal"], value)} />
                    <YearField label="年份" value={item.year} onChange={(value) => setByPath(["publications", index, "year"], value)} />
                    <TextField label="标题" value={item.title} onChange={(value) => setByPath(["publications", index, "title"], value)} />
                    <HighlightedAuthorsField value={item.authors} onChange={(value) => setByPath(["publications", index, "authors"], value)} />
                    <MultiImageField label="图片" value={item.images} onChange={(value) => setImageCollection(["publications", index, "images"], value)} onUpload={uploadImage} />
                    <TextField label="DOI 链接" value={item.links.doi} onChange={(value) => setByPath(["publications", index, "links", "doi"], value)} />
                  </FieldGrid>
                </MiniCard>
              ))}
            </ListSection>
          )}

          {activeSection === "team" && (
            <AdminPanel eyebrow="Team" title="团队成员" subtitle="负责人、导师团队、学生都可以在这里维护。">
              <MiniCard title="负责人卡片">
                <FieldGrid>
                  <TextField label="姓名" value={draft.members.principalInvestigator.name} onChange={(value) => setByPath(["members", "principalInvestigator", "name"], value)} />
                  <TextField label="身份" value={draft.members.principalInvestigator.role} onChange={(value) => setByPath(["members", "principalInvestigator", "role"], value)} />
                  <TextField label="方向" value={draft.members.principalInvestigator.focus} onChange={(value) => setByPath(["members", "principalInvestigator", "focus"], value)} />
                  <TextField label="邮箱" value={draft.members.principalInvestigator.email} onChange={(value) => setByPath(["members", "principalInvestigator", "email"], value)} />
                  <ImageField label="头像图片" value={draft.members.principalInvestigator.avatar} onChange={(value) => setByPath(["members", "principalInvestigator", "avatar"], value)} onUpload={uploadImage} />
                </FieldGrid>
              </MiniCard>
              <MemberList title="导师团队" path={["members", "postdoctoralResearchers"]} members={draft.members.postdoctoralResearchers} addItem={addItem} removeItem={removeItem} setByPath={setByPath} onUpload={uploadImage} />
              <MemberList title="博士研究生" path={["members", "phdStudents"]} members={draft.members.phdStudents} addItem={addItem} removeItem={removeItem} setByPath={setByPath} onUpload={uploadImage} />
              <MemberList title="硕士研究生" path={["members", "masterStudents"]} members={draft.members.masterStudents} addItem={addItem} removeItem={removeItem} setByPath={setByPath} onUpload={uploadImage} />
              <MemberList title="本科实习生" path={["members", "undergraduateInterns"]} members={draft.members.undergraduateInterns} addItem={addItem} removeItem={removeItem} setByPath={setByPath} onUpload={uploadImage} />
              <div className="border-t border-slate-200 pt-6">
                <EditableList listKey="alumni" title="毕业生去向" addLabel="新增毕业去向" onAdd={() => addItem(["alumni"], emptyItems.alumni)}>
                  {draft.alumni.map((item, index) => (
                    <MiniCard key={`alumni-${index}`} title={item.destination} badge={item.year} onRemove={() => removeItem(["alumni"], index)}>
                      <FieldGrid>
                        <TextField label="姓名/匿名" value={item.name} onChange={(value) => setByPath(["alumni", index, "name"], value)} />
                        <TextField label="届别" value={item.year} onChange={(value) => setByPath(["alumni", index, "year"], value)} />
                        <TextField label="去向" value={item.destination} onChange={(value) => setByPath(["alumni", index, "destination"], value)} />
                        <TextField label="方向" value={item.field} onChange={(value) => setByPath(["alumni", index, "field"], value)} />
                      </FieldGrid>
                    </MiniCard>
                  ))}
                </EditableList>
              </div>
            </AdminPanel>
          )}

          {activeSection === "activities" && (
            <ListSection listKey="activities" eyebrow="Gallery" title="组内活动" subtitle="活动图库卡片。" addLabel="新增活动" onAdd={() => addItem(["activities"], emptyItems.activity)}>
              {orderActivityItems(draft.activities).map(({ item, index }) => (
                <MiniCard key={`activity-${index}`} title={item.title} badge={item.date} image={item.images[0] ?? item.image} onRemove={() => removeItem(["activities"], index)}>
                  <FieldGrid>
                    <TextField label="标题" value={item.title} onChange={(value) => setByPath(["activities", index, "title"], value)} />
                    <DateField label="日期" value={item.date} onChange={(value) => setByPath(["activities", index, "date"], value)} />
                    <TextField label="类型" value={item.type} onChange={(value) => setByPath(["activities", index, "type"], value)} />
                    <MultiImageField label="图片" value={item.images} onChange={(value) => setImageCollection(["activities", index, "images"], value)} onUpload={uploadImage} />
                    <TextArea label="说明" value={item.description} onChange={(value) => setByPath(["activities", index, "description"], value)} />
                    <TextArea label="详情正文" value={item.detail} rows={7} onChange={(value) => setByPath(["activities", index, "detail"], value)} />
                  </FieldGrid>
                </MiniCard>
              ))}
            </ListSection>
          )}

          {activeSection === "join" && (
            <AdminPanel eyebrow="Join Us" title="招生招聘" subtitle="对应深蓝色招生横幅。">
              <FieldGrid>
                <TextField label="标题" value={draft.joinUs.title} onChange={(value) => setByPath(["joinUs", "title"], value)} />
                <TextArea label="正文" value={draft.joinUs.description} rows={5} onChange={(value) => setByPath(["joinUs", "description"], value)} />
                <StringListField label="招生方向" value={draft.joinUs.directions} onChange={(value) => setByPath(["joinUs", "directions"], value)} />
                <StringListField label="要求" value={draft.joinUs.requirements} onChange={(value) => setByPath(["joinUs", "requirements"], value)} />
              </FieldGrid>
            </AdminPanel>
          )}

          {activeSection === "contact" && (
            <AdminPanel eyebrow="Contact" title="联系方式" subtitle="对应首页联系信息卡片。">
              <FieldGrid>
                <TextField label="邮箱" value={draft.contact.email} onChange={(value) => setByPath(["contact", "email"], value)} />
                <TextField label="地址" value={draft.contact.address} onChange={(value) => setByPath(["contact", "address"], value)} />
                <TextField label="办公室" value={draft.contact.office} onChange={(value) => setByPath(["contact", "office"], value)} />
                <TextField label="学校/学院" value={draft.contact.school} onChange={(value) => setByPath(["contact", "school"], value)} />
                <MultiImageField label="地图/校园图" value={draft.contact.mapImages} onChange={(value) => setImageCollection(["contact", "mapImages"], value, "map")} onUpload={uploadImage} />
              </FieldGrid>
              <EditableList listKey="contact.links" title="联系选项" addLabel="新增联系选项" onAdd={() => addItem(["contact", "links"], emptyItems.contactLink)}>
                {draft.contact.links.map((link, index) => (
                  <MiniCard key={`contact-link-${index}`} title={link.label || `联系选项 ${index + 1}`} onRemove={() => removeItem(["contact", "links"], index)}>
                    <FieldGrid compact>
                      <TextField label="按钮文字" value={link.label} onChange={(value) => setByPath(["contact", "links", index, "label"], value)} />
                      <TextField label="跳转地址" value={link.href} onChange={(value) => setByPath(["contact", "links", index, "href"], value)} />
                    </FieldGrid>
                  </MiniCard>
                ))}
              </EditableList>
            </AdminPanel>
          )}

          {activeSection === "sectionText" && (
            <AdminPanel eyebrow="Section Text" title="板块标题与说明" subtitle="对应首页每个模块的大标题和标题下方的小字说明。">
              <FieldGrid>
                {sectionSubtitleFields.map((field, index) => (
                  <div
                    key={field.key}
                    className={`grid gap-4 lg:col-span-2 ${
                      index > 0 ? "border-t-2 border-blue-200 pt-8" : ""
                    }`}
                  >
                    <TextField
                      label={`${field.label}英文眉题`}
                      value={draft.sectionEyebrows[field.key]}
                      onChange={(value) =>
                        setByPath(["sectionEyebrows", field.key], value)
                      }
                    />
                    <TextField
                      label={`${field.label}标题`}
                      value={draft.sectionTitles[field.key]}
                      onChange={(value) =>
                        setByPath(["sectionTitles", field.key], value)
                      }
                    />
                    <TextArea
                      label={`${field.label}说明`}
                      value={draft.sectionSubtitles[field.key]}
                      rows={3}
                      onChange={(value) =>
                        setByPath(["sectionSubtitles", field.key], value)
                      }
                    />
                  </div>
                ))}
                <div className="grid gap-4 border-t-2 border-blue-200 pt-8 lg:col-span-2">
                  <p className="text-sm font-semibold text-slate-700">
                    个人简介内页标题
                  </p>
                  <FieldGrid compact>
                    <TextField
                      label="个人简介正文眉题"
                      value={draft.aboutContentTitles.biographyEyebrow}
                      onChange={(value) =>
                        setByPath(
                          ["aboutContentTitles", "biographyEyebrow"],
                          value,
                        )
                      }
                    />
                    <TextField
                      label="经历时间线眉题"
                      value={draft.aboutContentTitles.timelineEyebrow}
                      onChange={(value) =>
                        setByPath(
                          ["aboutContentTitles", "timelineEyebrow"],
                          value,
                        )
                      }
                    />
                    <TextField
                      label="经历时间线标题"
                      value={draft.aboutContentTitles.timelineTitle}
                      onChange={(value) =>
                        setByPath(
                          ["aboutContentTitles", "timelineTitle"],
                          value,
                        )
                      }
                    />
                  </FieldGrid>
                </div>
                <div className="grid gap-4 border-t-2 border-blue-200 pt-8 lg:col-span-2">
                  <p className="text-sm font-semibold text-slate-700">
                    团队成员分组标题
                  </p>
                  <FieldGrid compact>
                    {teamGroupTitleFields.map((field) => (
                      <TextField
                        key={field.key}
                        label={field.label}
                        value={draft.teamGroupTitles[field.key]}
                        onChange={(value) =>
                          setByPath(["teamGroupTitles", field.key], value)
                        }
                      />
                    ))}
                  </FieldGrid>
                </div>
                <div className="border-t-2 border-blue-200 pt-8 lg:col-span-2">
                  <TextArea
                    label="招生招聘"
                    value={draft.joinUs.description}
                    rows={4}
                    onChange={(value) =>
                      setByPath(["joinUs", "description"], value)
                    }
                  />
                </div>
              </FieldGrid>
            </AdminPanel>
          )}

          {activeSection === "advanced" && (
            <AdminPanel eyebrow="Advanced" title="高级工具" subtitle="一般不需要使用。适合整体导出备份，或由开发者批量导入数据。">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={exportJson} className="secondary-button">
                  <Download size={16} className="mr-2" />
                  导出 JSON
                </button>
                <button type="button" onClick={cleanupUploads} className="secondary-button">
                  <Trash2 size={16} className="mr-2" />
                  清理未使用图片
                </button>
                <label className="secondary-button cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  导入 JSON
                  <input type="file" accept="application/json,.json" className="hidden" onChange={importJson} />
                </label>
                <button type="button" onClick={applyJsonText} className="primary-button">
                  应用 JSON 到编辑区
                </button>
              </div>
              <textarea value={jsonText} onChange={(event) => { setJsonText(event.target.value); setJsonError(""); setSaveFeedback(null); }} spellCheck={false} className="min-h-[640px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100" />
              {jsonError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">JSON 错误：{jsonError}</p> : null}
            </AdminPanel>
          )}
        </section>
      </div>
      {saveFeedback ? <SaveToast feedback={saveFeedback} /> : null}
      {isSaveConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[26px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-academic-700">
                <AlertTriangle size={24} />
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-slate-950">
                  确认保存修改？
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  保存后会覆盖项目文件夹中的当前网站内容，并同步刷新首页展示。
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsSaveConfirmOpen(false)}
                disabled={isSaving}
                className="secondary-button disabled:cursor-not-allowed disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmAndSaveDraft}
                disabled={isSaving}
                className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {isSaving ? "保存中..." : "确认保存"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SaveToast({ feedback }: { feedback: NonNullable<SaveFeedback> }) {
  return (
    <div className="fixed left-1/2 top-24 z-[60] w-[min(440px,calc(100vw-2rem))] -translate-x-1/2">
      <div
        className={`rounded-[22px] border px-5 py-4 text-sm font-semibold leading-7 shadow-2xl backdrop-blur ${
          feedback.type === "success"
            ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
            : "border-red-200 bg-red-50/95 text-red-700"
        }`}
      >
        <div className="flex items-center justify-center gap-3 text-center">
          {feedback.type === "success" ? (
            <CheckCircle2 className="shrink-0" size={20} />
          ) : (
            <AlertTriangle className="shrink-0" size={20} />
          )}
          <span>{feedback.text}</span>
        </div>
      </div>
    </div>
  );
}

function PreviewHero({ draft }: { draft: SiteData }) {
  return (
    <div className="overflow-hidden rounded-[26px] bg-academic-950 p-6 text-white">
      <div className="grid gap-5 md:grid-cols-[1fr_220px] md:items-center">
        <div>
          <p className="inline-flex rounded-full border border-cyan-200/25 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            {draft.profile.heroBadge ||
              "Quantum dots · Optoelectronics · Intelligent sensing"}
          </p>
          <p className="text-sm font-semibold text-cyan-200">{draft.profile.englishName}</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">{draft.profile.groupName}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">{draft.profile.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {draft.profile.keywords.slice(0, 5).map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-cyan-50">{item}</span>
            ))}
          </div>
        </div>
        <div className="rounded-[22px] border border-white/15 bg-white/10 p-4 text-center">
          <img src={withPublicBasePath(draft.profile.pi.avatar)} alt="负责人头像" className="mx-auto size-20 rounded-2xl object-cover" />
          <p className="mt-3 font-semibold">{draft.profile.pi.displayName}</p>
          <div className="mt-2 space-y-1 text-xs text-cyan-100">
            {draft.profile.pi.titles.map((title, index) => (
              <p key={`${title}-${index}`}>{title}</p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {draft.profile.pi.links.map((link, index) => (
              <span
                key={`${link.label}-${index}`}
                className="rounded-full border border-white/15 bg-slate-950/20 px-3 py-1 text-[11px] font-semibold text-cyan-50"
              >
                {link.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="academic-card p-5 sm:p-7">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}

function ListSection({ listKey, eyebrow, title, subtitle, addLabel, onAdd, children }: { listKey: string; eyebrow: string; title: string; subtitle: string; addLabel: string; onAdd: () => void; children: ReactNode }) {
  return (
    <AdminPanel eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <EditableList listKey={listKey} title={title} addLabel={addLabel} onAdd={onAdd}>{children}</EditableList>
    </AdminPanel>
  );
}

function EditableList({ listKey, title, addLabel, onAdd, children }: { listKey: string; title: string; addLabel: string; onAdd: () => void; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <button type="button" onClick={onAdd} className="secondary-button">
          <Plus size={16} className="mr-2" />
          {addLabel}
        </button>
      </div>
      <div data-editable-list={listKey} className="space-y-4">{children}</div>
    </div>
  );
}

function MiniCard({ title, badge, image, onRemove, children }: { title: string; badge?: string; image?: string; onRemove?: () => void; children: ReactNode }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          {image ? <img src={withPublicBasePath(image)} alt="" className="size-16 rounded-2xl border border-slate-100 object-cover" /> : null}
          <div>
            {badge ? <span className="blue-chip">{badge}</span> : null}
            <h4 className="mt-2 line-clamp-2 font-semibold text-slate-950">{title}</h4>
          </div>
        </div>
        {onRemove ? (
          <button type="button" onClick={onRemove} className="inline-flex items-center justify-center rounded-full border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100">
            <Trash2 size={15} className="mr-2" />
            删除
          </button>
        ) : null}
      </div>
      {children}
    </article>
  );
}

function FieldGrid({ compact = false, children }: { compact?: boolean; children: ReactNode }) {
  return <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "lg:grid-cols-2"}`}>{children}</div>;
}

function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function YearField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min="1900"
        max="2100"
        step="1"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value.slice(0, 4))}
        placeholder="例如：2026"
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

const presetNewsTypes = [
  "News",
  "Paper",
  "Award",
  "Project",
  "Conference",
  "Group",
];

function NewsTypeField({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const normalizedValue = value ?? "";
  const isPreset = presetNewsTypes.includes(normalizedValue);

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">类型</span>
      <select
        value={isPreset ? normalizedValue : "custom"}
        onChange={(event) =>
          onChange(event.target.value === "custom" ? "" : event.target.value)
        }
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      >
        {presetNewsTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
        <option value="custom">自定义类型</option>
      </select>
      {!isPreset ? (
        <input
          value={normalizedValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder="输入自定义类型"
          autoFocus
          className="rounded-2xl border border-blue-200 bg-blue-50/40 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      ) : null}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function renderHighlightedText(value: string) {
  return value.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const isHighlighted = part.startsWith("**") && part.endsWith("**");

    return isHighlighted ? (
      <strong key={`${part}-${index}`} className="font-semibold text-academic-700">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

function HighlightedAuthorsField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">
          作者（用 **文字** 突出显示）
        </span>
        <input
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="例如：张三, **朱家旗**, 李四"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm leading-6 text-slate-500">
        <span className="font-semibold text-slate-700">显示预览：</span>
        {renderHighlightedText(value || "作者信息")}
      </div>
    </div>
  );
}

function TextArea({ label, value, rows = 3, onChange }: { label: string; value?: string; rows?: number; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 lg:col-span-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea value={value ?? ""} rows={rows} onChange={(event) => onChange(event.target.value)} className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadedPath = await onUpload(file);
      onChange(uploadedPath);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {value ? (
            <img
              src={withPublicBasePath(value)}
              alt=""
              className="size-20 rounded-2xl border border-slate-100 object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-academic-700 transition hover:bg-blue-100">
                <Upload size={14} className="mr-2" />
                {isUploading ? "上传中..." : "上传图片"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              {value ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={14} className="mr-2" />
                  移除图片
                </button>
              ) : null}
            </div>
            {error ? (
              <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableStringItemsField({
  label,
  value,
  onChange,
  addLabel,
  onAdded,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  addLabel: string;
  onAdded?: () => void;
}) {
  const newItemRef = useRef<HTMLInputElement>(null);

  function addValue() {
    onChange(["", ...value]);
    onAdded?.();
    window.requestAnimationFrame(() => newItemRef.current?.focus());
  }

  return (
    <div className="grid gap-3 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <button
          type="button"
          onClick={addValue}
          className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-academic-700 transition hover:bg-blue-100"
        >
          <Plus size={14} className="mr-2" />
          {addLabel}
        </button>
      </div>
      <div className="grid gap-3">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              ref={index === 0 ? newItemRef : undefined}
              value={item}
              onChange={(event) =>
                onChange(
                  value.map((current, itemIndex) =>
                    itemIndex === index ? event.target.value : current,
                  ),
                )
              }
              placeholder={`身份说明 ${index + 1}`}
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() =>
                onChange(value.filter((_, itemIndex) => itemIndex !== index))
              }
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
              aria-label={`删除身份说明 ${index + 1}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StringListField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  const [draftValue, setDraftValue] = useState(() => joinLines(value));

  useEffect(() => {
    const externalValue = joinLines(value);
    const normalizedDraftValue = joinLines(splitLines(draftValue));

    if (externalValue !== normalizedDraftValue) {
      setDraftValue(externalValue);
    }
  }, [draftValue, value]);

  return (
    <TextArea
      label={`${label}，每行一个`}
      value={draftValue}
      rows={5}
      onChange={(nextValue) => {
        setDraftValue(nextValue);
        onChange(splitLines(nextValue));
      }}
    />
  );
}

function MemberList({ title, path, members, addItem, removeItem, setByPath, onUpload }: { title: string; path: Path; members: Member[]; addItem: (path: Path, item: unknown) => void; removeItem: (path: Path, index: number) => void; setByPath: (path: Path, value: unknown) => void; onUpload: (file: File) => Promise<string> }) {
  return (
    <EditableList listKey={path.join(".")} title={title} addLabel="新增成员" onAdd={() => addItem(path, emptyItems.member)}>
      {members.map((member, index) => (
        <MiniCard key={`member-${path.join("-")}-${index}`} title={member.name} badge={member.role} image={member.avatar} onRemove={() => removeItem(path, index)}>
          <FieldGrid>
            <TextField label="姓名" value={member.name} onChange={(value) => setByPath([...path, index, "name"], value)} />
            <TextField label="身份" value={member.role} onChange={(value) => setByPath([...path, index, "role"], value)} />
            <TextField label="方向" value={member.focus} onChange={(value) => setByPath([...path, index, "focus"], value)} />
            <TextField label="邮箱" value={member.email} onChange={(value) => setByPath([...path, index, "email"], value)} />
            <ImageField label="头像图片" value={member.avatar} onChange={(value) => setByPath([...path, index, "avatar"], value)} onUpload={onUpload} />
          </FieldGrid>
        </MiniCard>
      ))}
    </EditableList>
  );
}
