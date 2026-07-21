"use client";

import { ArrowLeft, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next") || "/admin";
  const next = requestedNext.startsWith("/admin") ? requestedNext : "/admin";
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function readError(result: unknown, fallback: string) {
    return result && typeof result === "object" && "error" in result
      ? String(result.error)
      : fallback;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        setError(readError(await response.json().catch(() => ({})), "登录失败"));
        return;
      }

      window.location.replace(next);
    } catch {
      setError("无法连接到服务器，请确认项目正在运行。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestCode() {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(readError(result, "验证码发送失败"));
        return;
      }

      setCodeSent(true);
      setSuccess("验证码已发送，请检查邮箱。验证码 10 分钟内有效。");
    } catch {
      setError("无法连接到邮件服务，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codeSent) {
      await requestCode();
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(readError(result, "密码重置失败"));
        return;
      }

      setMode("login");
      setCodeSent(false);
      setCode("");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("密码已修改，请使用新密码登录。");
    } catch {
      setError("无法连接到服务器，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={mode === "login" ? handleLogin : handleReset}
      className="academic-card w-full max-w-md p-7 text-center"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-academic-700">
        {mode === "login" ? <LockKeyhole size={26} /> : <KeyRound size={26} />}
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-slate-950">
        {mode === "login" ? "管理后台登录" : "重置管理密码"}
      </h1>

      <label className="mt-8 grid gap-2 text-left">
        <span className="text-sm font-semibold text-slate-700">邮箱</span>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
          <Mail size={17} className="shrink-0 text-academic-500" />
          <input
            type="email"
            value={email}
            required
            autoComplete="username"
            placeholder="请输入管理员邮箱"
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
      </label>

      {mode === "login" ? (
        <>
          <label className="mt-4 grid gap-2 text-left">
            <span className="text-sm font-semibold text-slate-700">密码</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setError("");
              setSuccess("");
            }}
            className="mt-3 block w-full text-right text-sm font-semibold text-academic-700 hover:text-academic-500"
          >
            忘记密码？
          </button>
        </>
      ) : codeSent ? (
        <div className="mt-4 grid gap-4 text-left">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">6 位验证码</span>
            <input
              value={code}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">新密码</span>
            <input
              type="password"
              value={newPassword}
              autoComplete="new-password"
              onChange={(event) => setNewPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">确认新密码</span>
            <input
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <button
            type="button"
            onClick={requestCode}
            disabled={isSubmitting}
            className="text-left text-sm font-semibold text-academic-700 disabled:opacity-50"
          >
            重新发送验证码
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="primary-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "处理中..."
          : mode === "login"
            ? "登录管理后台"
            : codeSent
              ? "确认修改密码"
              : "发送邮箱验证码"}
      </button>

      {mode === "reset" ? (
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
            setSuccess("");
          }}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          返回登录
        </button>
      ) : null}
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
