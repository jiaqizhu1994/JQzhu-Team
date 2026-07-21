import { siteData as zhujiaqiSiteData } from "./zhujiaqi";

export { zhujiaqiSiteData as siteData };

const templateSiteData = {
  nav: [
    { label: "首页", href: "#home", id: "home" },
    { label: "个人简介", href: "#about", id: "about" },
    { label: "研究方向", href: "#research", id: "research" },
    { label: "新闻动态", href: "#news", id: "news" },
    { label: "论文成果", href: "#publications", id: "publications" },
    { label: "团队成员", href: "#team", id: "team" },
    { label: "加入我们", href: "#join", id: "join" },
    { label: "联系方式", href: "#contact", id: "contact" },
  ],
  sectionTitles: {
    about: "个人简介",
    research: "研究方向",
    news: "最新动态",
    publications: "代表论文",
    projects: "科研项目",
    team: "团队成员",
    activities: "组内活动",
    alumni: "毕业生去向",
    contact: "联系方式",
  },
  profile: {
    groupAbbr: "AOMIS Lab",
    heroBadge: "Quantum dots · Optoelectronics · Intelligent sensing",
    groupName: "智能光电材料与先进感知课题组",
    englishName:
      "Advanced Optoelectronic Materials and Intelligent Sensing Group",
    tagline:
      "聚焦环境友好型量子点材料、光电探测器件、智能感知系统与交叉应用研究。",
    keywords: [
      "Eco-friendly Quantum Dots",
      "Optoelectronic Devices",
      "Intelligent Sensing",
      "Photodetectors",
      "Bio/Environmental Applications",
    ],
    pi: {
      name: "张明远",
      displayName: "张明远 研究员",
      title: "研究员 / 博士生导师",
      titles: ["研究员", "博士生导师"],
      school: "某高校 · 材料科学与工程学院",
      email: "example.pi@university.edu.cn",
      office: "先进材料楼 A-1208",
      address: "某省某市大学路 100 号",
      avatar: "/images/pi-avatar.svg",
      links: [
        { label: "Google Scholar", href: "#" },
        { label: "ORCID", href: "#" },
        { label: "Homepage", href: "#" },
      ],
      researchTags: [
        "量子点材料",
        "光电探测",
        "红外感知",
        "智能光谱分析",
      ],
    },
    aboutParagraphs: [
      "【示例数据】负责人长期围绕环境友好型胶体量子点、低维光电材料和智能感知器件开展研究，重点关注材料可控制备、表界面调控、器件集成与跨场景应用。",
      "【示例数据】相关工作面向**国家自然科学基金**等科研任务需求，探索从材料化学到器件物理再到智能分析算法的完整研究链条。示例成果类型涵盖 **Advanced Materials**、**JACS**、**Nano Letters** 等国际期刊方向，但当前页面不代表真实发表记录。",
      "【示例数据】课题组鼓励材料、物理、化学、微电子、人工智能和生命健康等背景交叉合作，强调严谨实验、可复现数据和面向真实问题的科研训练。",
    ],
  },
  stats: [
    { value: "30+", label: "Publications" },
    { value: "10+", label: "Projects" },
    { value: "15+", label: "Patents" },
    { value: "20+", label: "Members" },
  ],
  timeline: [
    {
      year: "2021 - 至今",
      title: "某高校 / 材料科学与工程学院，研究员",
      description: "【示例数据】建设智能光电材料与先进感知方向科研团队。",
    },
    {
      year: "2019 - 2021",
      title: "某高校，副教授",
      description: "【示例数据】开展环境友好型量子点与光电器件研究。",
    },
    {
      year: "2017 - 2019",
      title: "某高校，博士后",
      description: "【示例数据】聚焦单量子点光物理与界面态调控。",
    },
    {
      year: "2012 - 2017",
      title: "某高校，博士",
      description: "【示例数据】研究胶体纳米晶合成与发光机制。",
    },
  ],
  researchAreas: [
    {
      title: "环境友好型胶体量子点材料",
      description:
        "发展低毒、无镉、可控合成的胶体量子点材料，研究其结构、表界面调控与发光特性。",
      tags: ["InP QDs", "InSb QDs", "Surface Passivation"],
      image: "/images/research-qd.svg",
      href: "#contact",
      accent: "from-blue-50 via-cyan-50 to-white",
    },
    {
      title: "新型量子点发光与光电探测芯片",
      description:
        "面向显示、红外探测与片上光电应用，构建高性能量子点发光器件与光电探测器。",
      tags: ["QLED", "Photodetector", "Infrared Sensing"],
      image: "/images/research-device.svg",
      href: "#contact",
      accent: "from-sky-50 via-indigo-50 to-white",
    },
    {
      title: "单分子与单量子点光物理机制",
      description:
        "研究单量子点闪烁、激子动力学、界面态与载流子行为，揭示微观光电机制。",
      tags: ["Single QD", "Blinking", "Exciton Dynamics"],
      image: "/images/research-single.svg",
      href: "#contact",
      accent: "from-emerald-50 via-cyan-50 to-white",
    },
    {
      title: "纳米光电材料交叉应用",
      description:
        "结合生物传感、环境监测和智能识别，探索纳米光电材料在交叉场景中的应用。",
      tags: ["Biosensing", "Environmental Monitoring", "AI Analysis"],
      image: "/images/research-sensing.svg",
      href: "#contact",
      accent: "from-slate-50 via-blue-50 to-white",
    },
  ],
  news: [
    {
      date: "2026.03",
      type: "Paper",
      title: "【示例数据】量子点红外探测方向论文发表于 Advanced Materials",
      description: "围绕低毒量子点阵列与高灵敏光电探测器件的示例新闻。",
    },
    {
      date: "2026.01",
      type: "Project",
      title: "【示例数据】国家自然科学基金项目获批",
      description: "项目主题为环境友好型量子点表界面调控与器件机制。",
    },
    {
      date: "2025.11",
      type: "Award",
      title: "【示例数据】研究生获得国家奖学金",
      description: "表彰其在光电材料实验与智能光谱分析中的阶段性成果。",
    },
    {
      date: "2025.08",
      type: "Conference",
      title: "【示例数据】课题组参加全国量子点大会",
      description: "多名成员围绕单量子点光物理和红外成像应用进行报告。",
    },
    {
      date: "2025.05",
      type: "Group",
      title: "【示例数据】欢迎新同学加入课题组",
      description: "新成员将参与纳米光电器件、传感系统与 AI 分析方向。",
    },
    {
      date: "2025.03",
      type: "Paper",
      title: "【示例数据】智能光谱识别方向论文被接收",
      description: "探索机器学习辅助光谱特征提取与材料状态识别。",
    },
  ],
  publications: [
    {
      journal: "Advanced Materials",
      year: "2026",
      title:
        "【示例数据】Eco-friendly quantum-dot heterostructures for high-gain infrared photodetection",
      authors:
        "Mingyuan Zhang*, Li Chen, Rui Wang, and AOMIS Lab members",
      highlight:
        "提出低毒量子点异质结构与界面钝化策略，实现高增益红外探测响应。",
      image: "/images/publication-abstract.svg",
      links: { doi: "#", pdf: "#", bibtex: "#" },
    },
    {
      journal: "JACS",
      year: "2025",
      title:
        "【示例数据】Surface-state engineering in cadmium-free colloidal quantum dots",
      authors: "Li Chen, Mingyuan Zhang*, and collaborators",
      highlight:
        "解析表面配体与缺陷态对量子点发光效率和稳定性的影响。",
      image: "/images/publication-abstract.svg",
      links: { doi: "#", pdf: "#", bibtex: "#" },
    },
    {
      journal: "Nano Letters",
      year: "2025",
      title:
        "【示例数据】Single-quantum-dot blinking statistics reveal carrier trapping dynamics",
      authors: "Rui Wang, Xiaoyu Liu, Mingyuan Zhang*",
      highlight: "从单颗粒尺度建立闪烁统计与载流子俘获动力学的关联。",
      image: "/images/publication-abstract.svg",
      links: { doi: "#", pdf: "#", bibtex: "#" },
    },
    {
      journal: "ACS Nano",
      year: "2024",
      title:
        "【示例数据】Integrated quantum-dot photodetector arrays for intelligent spectral sensing",
      authors: "AOMIS Lab members and collaborators",
      highlight:
        "构建阵列化量子点探测芯片，并结合算法实现多场景光谱识别。",
      image: "/images/publication-abstract.svg",
      links: { doi: "#", pdf: "#", bibtex: "#" },
    },
    {
      journal: "Small",
      year: "2024",
      title:
        "【示例数据】Bioinspired nanophotonic sensing platform based on emissive quantum dots",
      authors: "Xiaoyu Liu, Li Chen, Mingyuan Zhang*",
      highlight:
        "面向生物与环境样品检测，设计发光量子点传感平台和读出方法。",
      image: "/images/publication-abstract.svg",
      links: { doi: "#", pdf: "#", bibtex: "#" },
    },
  ],
  projects: [
    {
      name: "【示例数据】低毒量子点表界面调控与红外探测机制研究",
      type: "国家级",
      period: "2026 - 2029",
      leader: "张明远",
      description:
        "围绕无镉量子点材料合成、界面缺陷调控和红外光电响应机制开展基础研究。",
      status: "Ongoing",
      tone: "blue",
    },
    {
      name: "【示例数据】面向环境监测的智能光谱传感芯片",
      type: "省部级",
      period: "2025 - 2027",
      leader: "张明远",
      description:
        "发展可集成光电传感芯片与 AI 辅助光谱识别方法，用于复杂环境样品检测。",
      status: "Ongoing",
      tone: "cyan",
    },
    {
      name: "【示例数据】量子点发光器件可靠性提升",
      type: "校级",
      period: "2024 - 2026",
      leader: "李晨",
      description:
        "针对器件寿命、能量转移和界面稳定性问题，建立多尺度表征和优化流程。",
      status: "Ongoing",
      tone: "green",
    },
    {
      name: "【示例数据】红外成像模组联合开发",
      type: "企业合作",
      period: "2023 - 2025",
      leader: "张明远",
      description:
        "开展量子点红外探测材料与成像模组的示例性产学研合作。",
      status: "Completed",
      tone: "slate",
    },
    {
      name: "【示例数据】单颗粒光谱平台建设",
      type: "平台建设",
      period: "2023 - 2026",
      leader: "王瑞",
      description:
        "建设单量子点光谱、寿命和低温测试平台，用于微观光物理机制研究。",
      status: "Ongoing",
      tone: "purple",
    },
    {
      name: "【示例数据】AI 辅助纳米材料数据分析",
      type: "交叉项目",
      period: "2024 - 2027",
      leader: "刘晓雨",
      description:
        "将机器学习用于光谱降噪、图像识别和材料制备参数推荐。",
      status: "Ongoing",
      tone: "amber",
    },
  ],
  members: {
    principalInvestigator: {
      name: "张明远",
      role: "Principal Investigator",
      focus: "环境友好型量子点、红外探测、智能感知",
      email: "example.pi@university.edu.cn",
      avatar: "/images/pi-avatar.svg",
    },
    postdoctoralResearchers: [
      {
        name: "李晨",
        role: "博士后 / 示例数据",
        focus: "量子点表面化学与器件稳定性",
        email: "chen.li@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
    ],
    phdStudents: [
      {
        name: "王瑞",
        role: "博士生 / 示例数据",
        focus: "单量子点光谱与激子动力学",
        email: "rui.wang@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
      {
        name: "刘晓雨",
        role: "博士生 / 示例数据",
        focus: "AI 辅助光谱分析",
        email: "xiaoyu.liu@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
    ],
    masterStudents: [
      {
        name: "陈一诺",
        role: "硕士生 / 示例数据",
        focus: "光电探测器件制备",
        email: "yinuo.chen@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
      {
        name: "赵予安",
        role: "硕士生 / 示例数据",
        focus: "生物与环境传感",
        email: "yuan.zhao@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
      {
        name: "周清禾",
        role: "硕士生 / 示例数据",
        focus: "纳米材料表征",
        email: "qinghe.zhou@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
    ],
    undergraduateInterns: [
      {
        name: "孙同学",
        role: "本科实习生 / 示例数据",
        focus: "实验自动化与数据整理",
        email: "student.sun@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
      {
        name: "杨同学",
        role: "本科实习生 / 示例数据",
        focus: "量子点合成入门训练",
        email: "student.yang@example.edu.cn",
        avatar: "/images/member-avatar.svg",
      },
    ],
  },
  activities: [
    {
      title: "【示例数据】课题组年度合影",
      date: "2026.06",
      type: "Group Photo",
      description: "记录课题组阶段性建设与成员成长。",
      image: "/images/activity-group.svg",
    },
    {
      title: "【示例数据】全国量子点大会报告",
      date: "2025.08",
      type: "Conference",
      description: "围绕低毒量子点与红外探测进行学术交流。",
      image: "/images/activity-conference.svg",
    },
    {
      title: "【示例数据】实验室开放交流",
      date: "2025.06",
      type: "Lab Exchange",
      description: "与兄弟课题组交流器件制备和光谱表征经验。",
      image: "/images/activity-lab.svg",
    },
    {
      title: "【示例数据】学生学术海报获奖",
      date: "2025.04",
      type: "Award",
      description: "展示智能光谱识别方向的阶段性训练成果。",
      image: "/images/activity-conference.svg",
    },
    {
      title: "【示例数据】毕业季交流会",
      date: "2024.06",
      type: "Graduation",
      description: "分享科研经历、求职经验和继续深造规划。",
      image: "/images/activity-group.svg",
    },
    {
      title: "【示例数据】课题组聚餐",
      date: "2024.12",
      type: "Group",
      description: "在轻松氛围中回顾一年的科研与生活。",
      image: "/images/activity-lab.svg",
    },
  ],
  joinUs: {
    title: "Join Us / 加入我们",
    description:
      "课题组长期招收博士后、博士生、硕士生、联合培养学生及优秀本科实习生。欢迎具有材料、光电、半导体、物理、化学、微电子、人工智能等背景的同学加入。",
    directions: [
      "量子点材料合成",
      "光电探测器件",
      "红外探测与成像",
      "生物/环境传感",
      "AI 辅助光谱与图像分析",
    ],
    requirements: [
      "对科研有热情",
      "具有良好的学习能力和团队合作精神",
      "有光电、材料、器件、算法或实验背景者优先",
    ],
    image: "/images/join-us.svg",
  },
  alumni: [
    {
      name: "某同学",
      year: "2025 届硕士 / 示例数据",
      destination: "高校继续读博",
      field: "纳米光电材料",
    },
    {
      name: "某同学",
      year: "2024 届硕士 / 示例数据",
      destination: "华为",
      field: "智能感知与算法",
    },
    {
      name: "某同学",
      year: "2024 届博士 / 示例数据",
      destination: "科研院所",
      field: "红外探测器件",
    },
    {
      name: "某同学",
      year: "2023 届硕士 / 示例数据",
      destination: "长江存储",
      field: "半导体工艺",
    },
    {
      name: "某同学",
      year: "2023 届硕士 / 示例数据",
      destination: "海康威视",
      field: "光电成像",
    },
    {
      name: "某同学",
      year: "2022 届本科 / 示例数据",
      destination: "上海集成电路",
      field: "微电子方向",
    },
  ],
  contact: {
    email: "example.pi@university.edu.cn",
    address: "某省某市大学路 100 号 先进材料楼",
    office: "A-1208 办公室 / B-310 光谱实验室",
    school: "某高校 · 材料科学与工程学院",
    googleScholar: "#",
    orcid: "#",
    homepage: "#",
    groupHomepage: "#",
    qrcode: "/images/member-avatar.svg",
    map: "/images/campus-map.svg",
  },
};
