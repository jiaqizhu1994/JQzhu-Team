"use client";

import { ChangeEvent, useState } from "react";
import { Upload, X } from "lucide-react";
import { withPublicBasePath } from "@/lib/publicPath";

type MultiImageFieldProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  onUpload: (file: File) => Promise<string>;
};

export function MultiImageField({
  label,
  value,
  onChange,
  onUpload,
}: MultiImageFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const paths = value.filter(Boolean);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadedPaths = await Promise.all(files.map((file) => onUpload(file)));
      onChange(Array.from(new Set([...paths, ...uploadedPaths])));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "上传失败");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-2 lg:col-span-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-3">
          {paths.map((path, index) => (
            <div key={`${path}-${index}`} className="relative">
              <img
                src={withPublicBasePath(path)}
                alt=""
                className="size-20 rounded-2xl border border-slate-100 bg-slate-50 object-contain p-1"
              />
              <button
                type="button"
                onClick={() =>
                  onChange(paths.filter((_, pathIndex) => pathIndex !== index))
                }
                className="absolute -right-2 -top-2 inline-flex size-6 items-center justify-center rounded-full border border-red-100 bg-white text-red-600 shadow-sm transition hover:bg-red-50"
                aria-label="删除图片"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-academic-700 transition hover:bg-blue-100">
            <Upload size={14} className="mr-2" />
            {isUploading ? "上传中..." : "批量上传图片"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <span className="text-xs text-slate-500">
            可一次选择多张图片，当前共 {paths.length} 张
          </span>
        </div>
        {error ? (
          <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
