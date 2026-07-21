import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "朱家旗 - 中国科学院大学杭州高等研究院",
  description:
    "朱家旗老师个人主页与光电感知研究方向展示，聚焦红外半导体探测材料与器件、计算光谱学、光电传感芯片和人工智能。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
