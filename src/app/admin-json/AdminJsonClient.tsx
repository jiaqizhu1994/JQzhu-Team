"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Home,
  Loader2,
  LogOut,
  Save,
  Upload,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  SITE_DATA_STORAGE_KEY,
  type SiteData,
} from "@/lib/siteDataContext";
import { normalizeSiteData } from "@/lib/siteDataDefaults";

const ADMIN_JSON_DRAFT_STORAGE_KEY = "academic-admin-json-unsaved-draft";
type SaveFeedback = { type: "success" | "error"; text: string } | null;

function cloneData(data: SiteData): SiteData {
  return JSON.parse(JSON.stringify(data)) as SiteData;
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

export default function AdminPage({ initialData }: { initialData: SiteData }) {
  const [draft, setDraft] = useState<SiteData>(() =>
    normalizeSiteData(initialData),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(initialData, null, 2),
  );
  const [message, setMessage] = useState("当前编辑的是浏览器本地内容。");
  const [jsonError, setJsonError] = useState("");
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback>(null);
  const skipNextDraftWrite = useRef(false);
  const savedSnapshotRef = useRef(
    JSON.stringify(normalizeSiteData(initialData)),
  );

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
          ADMIN_JSON_DRAFT_STORAGE_KEY,
        );

        if (unsavedDraft) {
          const parsedDraft = normalizeSiteData(JSON.parse(unsavedDraft));
          if (JSON.stringify(parsedDraft) !== savedSnapshot) {
            syncDraft(parsedDraft);
            setMessage("检测到未保存草稿，已自动恢复。确认无误后请点击“保存修改”。");
            return;
          }

          window.localStorage.removeItem(ADMIN_JSON_DRAFT_STORAGE_KEY);
        }

        syncDraft(normalizedData);
        setMessage("已读取项目文件夹中的已保存内容。");
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

  const hasUnsavedJsonChange = useMemo(
    () => jsonText !== JSON.stringify(draft, null, 2),
    [draft, jsonText],
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
      window.localStorage.removeItem(ADMIN_JSON_DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ADMIN_JSON_DRAFT_STORAGE_KEY, serializedDraft);
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

  function clearUnsavedDraft() {
    window.localStorage.removeItem(ADMIN_JSON_DRAFT_STORAGE_KEY);
  }

  function persistUnsavedDraft() {
    const serializedDraft = JSON.stringify(draft);

    if (serializedDraft === savedSnapshotRef.current) {
      clearUnsavedDraft();
      return;
    }

    window.localStorage.setItem(ADMIN_JSON_DRAFT_STORAGE_KEY, serializedDraft);
  }

  function redirectToLogin() {
    persistUnsavedDraft();
    window.location.href = `/admin/login?next=${encodeURIComponent(
      window.location.pathname,
    )}`;
  }

  function syncDraft(nextDraft: SiteData) {
    setSaveFeedback(null);
    const normalizedDraft = normalizeSiteData(nextDraft);
    setDraft(normalizedDraft);
    setJsonText(JSON.stringify(normalizedDraft, null, 2));
    setJsonError("");
  }

  function updateProfileField<K extends keyof SiteData["profile"]>(
    key: K,
    value: SiteData["profile"][K],
  ) {
    const nextDraft = cloneData(draft);
    nextDraft.profile[key] = value;
    syncDraft(nextDraft);
  }

  function updatePiField<K extends keyof SiteData["profile"]["pi"]>(
    key: K,
    value: SiteData["profile"]["pi"][K],
  ) {
    const nextDraft = cloneData(draft);
    nextDraft.profile.pi[key] = value;
    syncDraft(nextDraft);
  }

  function updateContactField<K extends keyof SiteData["contact"]>(
    key: K,
    value: SiteData["contact"][K],
  ) {
    const nextDraft = cloneData(draft);
    nextDraft.contact[key] = value;
    syncDraft(nextDraft);
  }

  function updateJoinUsField<K extends keyof SiteData["joinUs"]>(
    key: K,
    value: SiteData["joinUs"][K],
  ) {
    const nextDraft = cloneData(draft);
    nextDraft.joinUs[key] = value;
    syncDraft(nextDraft);
  }

  async function confirmAndSaveDraft() {
    setIsSaving(true);
    setSaveFeedback(null);

    try {
      const parsed = normalizeSiteData(JSON.parse(jsonText));
      const response = await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
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
      const successText = `已保存。自动清理未使用图片 ${deletedCount} 张。`;
      savedSnapshotRef.current = JSON.stringify(parsed);
      window.localStorage.setItem(SITE_DATA_STORAGE_KEY, JSON.stringify(parsed));
      clearUnsavedDraft();
      skipNextDraftWrite.current = true;
      setDraft(parsed);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError("");
      setIsSaveConfirmOpen(false);
      setMessage(successText);
      setSaveFeedback({ type: "success", text: successText });
      window.dispatchEvent(new Event("site-data-updated"));
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : "保存失败，请检查 JSON 内容后重试。";
      setJsonError(error instanceof Error ? error.message : "JSON 格式有误");
      setMessage(errorText);
      setSaveFeedback({ type: "error", text: errorText });
    } finally {
      setIsSaving(false);
    }
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

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
      const nextDraft = normalizeSiteData(JSON.parse(String(reader.result)));
        syncDraft(nextDraft);
        setMessage("JSON 已导入预览，点击保存后才会应用到首页。");
      } catch (error) {
        setJsonError(error instanceof Error ? error.message : "JSON 格式有误");
      }
    };
    reader.readAsText(file);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="section-eyebrow">Admin Console</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              网站内容管理
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              修改后会保存到当前浏览器本地存储。无需改源码即可预览和使用；导出 JSON 后也可以交给开发者同步到源码数据文件。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="secondary-button">
              <Home size={16} className="mr-2" />
              返回首页
            </Link>
            <button type="button" onClick={() => setIsSaveConfirmOpen(true)} disabled={isSaving} className="primary-button disabled:cursor-not-allowed disabled:opacity-60">
              <Save size={16} className="mr-2" />
              保存修改
            </button>
            <button type="button" onClick={logout} className="secondary-button">
              <LogOut size={16} className="mr-2" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <section className="space-y-6">
          <div className="academic-card p-6">
            <h2 className="text-xl font-semibold text-slate-950">
              基础信息
            </h2>
            <div className="mt-5 grid gap-4">
              <TextField
                label="首页大标题"
                value={draft.profile.groupName}
                onChange={(value) => updateProfileField("groupName", value)}
              />
              <TextField
                label="英文副标题"
                value={draft.profile.englishName}
                onChange={(value) => updateProfileField("englishName", value)}
              />
              <TextArea
                label="一句话简介"
                value={draft.profile.tagline}
                rows={3}
                onChange={(value) => updateProfileField("tagline", value)}
              />
              <TextArea
                label="研究关键词，每行一个"
                value={joinLines(draft.profile.keywords)}
                rows={5}
                onChange={(value) =>
                  updateProfileField("keywords", splitLines(value))
                }
              />
            </div>
          </div>

          <div className="academic-card p-6">
            <h2 className="text-xl font-semibold text-slate-950">
              负责人信息
            </h2>
            <div className="mt-5 grid gap-4">
              <TextField
                label="姓名"
                value={draft.profile.pi.displayName}
                onChange={(value) => updatePiField("displayName", value)}
              />
              <TextArea
                label="职称 / 身份（每行一个）"
                value={joinLines(draft.profile.pi.titles)}
                onChange={(value) => updatePiField("titles", splitLines(value))}
              />
              <TextField
                label="单位"
                value={draft.profile.pi.school}
                onChange={(value) => updatePiField("school", value)}
              />
              <TextField
                label="邮箱"
                value={draft.profile.pi.email}
                onChange={(value) => updatePiField("email", value)}
              />
              <TextField
                label="头像路径"
                value={draft.profile.pi.avatar}
                onChange={(value) => updatePiField("avatar", value)}
              />
              <TextArea
                label="个人简介段落，每行一段。可用 **文字** 加粗"
                value={joinLines(draft.profile.aboutParagraphs)}
                rows={7}
                onChange={(value) =>
                  updateProfileField("aboutParagraphs", splitLines(value))
                }
              />
            </div>
          </div>

          <div className="academic-card p-6">
            <h2 className="text-xl font-semibold text-slate-950">
              招生与联系方式
            </h2>
            <div className="mt-5 grid gap-4">
              <TextField
                label="招生模块标题"
                value={draft.joinUs.title}
                onChange={(value) => updateJoinUsField("title", value)}
              />
              <TextArea
                label="招生说明"
                value={draft.joinUs.description}
                rows={4}
                onChange={(value) => updateJoinUsField("description", value)}
              />
              <TextArea
                label="招生方向，每行一个"
                value={joinLines(draft.joinUs.directions)}
                rows={5}
                onChange={(value) =>
                  updateJoinUsField("directions", splitLines(value))
                }
              />
              <TextField
                label="联系邮箱"
                value={draft.contact.email}
                onChange={(value) => updateContactField("email", value)}
              />
              <TextField
                label="地址"
                value={draft.contact.address}
                onChange={(value) => updateContactField("address", value)}
              />
              <TextField
                label="个人主页"
                value={draft.contact.homepage}
                onChange={(value) => updateContactField("homepage", value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="academic-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  完整 JSON 编辑
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  论文、项目、成员、新闻、活动、毕业去向等列表都可以在这里直接修改。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportJson}
                  className="secondary-button px-4 py-2"
                >
                  <Download size={15} className="mr-2" />
                  导出
                </button>
                <label className="secondary-button cursor-pointer px-4 py-2">
                  <Upload size={15} className="mr-2" />
                  导入
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={importJson}
                  />
                </label>
              </div>
            </div>

            <textarea
              value={jsonText}
              onChange={(event) => {
                setJsonText(event.target.value);
                setJsonError("");
                setSaveFeedback(null);
              }}
              spellCheck={false}
              className="mt-5 min-h-[720px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            />
            {jsonError ? (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                JSON 错误：{jsonError}
              </p>
            ) : null}
            {hasUnsavedJsonChange ? (
              <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                完整 JSON 编辑器有未同步内容，点击“保存修改”后会以 JSON 编辑器内容为准。
              </p>
            ) : null}
          </div>

          <div className="academic-card p-6">
            <h2 className="text-xl font-semibold text-slate-950">状态</h2>
            {message ? (
              <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-7 text-academic-700">
                {message}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-7 text-slate-500">
              这是纯前端管理界面，内容保存在当前浏览器。换电脑、换浏览器或清除缓存后，本地修改不会自动同步。正式部署如需多人共享编辑，需要再接入数据库或 CMS。
            </p>
          </div>
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
                  保存后会以当前 JSON 编辑器中的内容为准，覆盖项目文件夹中的网站内容。
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

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}
