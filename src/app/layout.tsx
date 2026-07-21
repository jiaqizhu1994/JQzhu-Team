import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://jiaqizhu1994.github.io/JQzhu-Team/";

export const metadata: Metadata = {
  metadataBase: new URL("https://jiaqizhu1994.github.io"),
  title: "朱家旗个人主页 | 中国科学院大学杭州高等研究院",
  description:
    "朱家旗，中国科学院大学杭州高等研究院特聘副研究员、硕士生导师。研究方向包括红外半导体探测材料与器件、动态视觉传感、计算光谱学、光电传感芯片和人工智能。",
  keywords: [
    "朱家旗",
    "朱家旗个人主页",
    "Jiaqi Zhu",
    "JQZhu Team",
    "中国科学院大学杭州高等研究院",
    "国科大杭州高等研究院",
    "红外半导体探测",
    "光电传感芯片",
    "计算光谱学",
    "动态视觉传感",
  ],
  authors: [{ name: "朱家旗", url: siteUrl }],
  creator: "朱家旗",
  publisher: "JQZhu Team",
  alternates: { canonical: siteUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "profile",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "JQZhu Team",
    title: "朱家旗个人主页 | 中国科学院大学杭州高等研究院",
    description:
      "朱家旗老师个人主页、研究方向、代表论文、团队成员与课题组动态。",
    images: [
      {
        url: "/JQzhu-Team/images/zhujiaqi-ucas.jpg",
        width: 400,
        height: 520,
        alt: "朱家旗",
      },
    ],
  },
};

const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "朱家旗",
  alternateName: ["Jiaqi Zhu", "JQ Zhu"],
  url: siteUrl,
  image: "https://jiaqizhu1994.github.io/JQzhu-Team/images/zhujiaqi-ucas.jpg",
  email: "mailto:jiaqizhu@ucas.ac.cn",
  jobTitle: ["特聘副研究员", "硕士生导师"],
  affiliation: {
    "@type": "EducationalOrganization",
    name: "中国科学院大学杭州高等研究院",
    alternateName: "Hangzhou Institute for Advanced Study, UCAS",
    url: "http://hias.ucas.ac.cn/",
  },
  sameAs: ["https://people.ucas.ac.cn/~0071430"],
  knowsAbout: [
    "红外半导体探测材料与器件",
    "动态视觉传感",
    "计算光谱学",
    "光电传感芯片",
    "人工智能",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
