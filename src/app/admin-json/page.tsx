import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/adminAuth";
import { readSavedSiteData } from "@/lib/siteDataServer";
import AdminJsonClient from "./AdminJsonClient";

export const dynamic = "force-dynamic";

export default async function AdminJsonPage() {
  const cookieStore = await cookies();
  const isLoggedIn = await verifyAdminToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );

  if (!isLoggedIn) {
    redirect("/admin/login?next=/admin-json");
  }

  const initialData = await readSavedSiteData();
  if (!initialData) {
    return <main className="p-8">网站内容文件不存在，无法进入编辑页面。</main>;
  }

  return <AdminJsonClient initialData={initialData} />;
}
