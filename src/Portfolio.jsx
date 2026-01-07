import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Download,
  ExternalLink,
  Palette,
  Layout,
  PenTool,
  Monitor,
  Briefcase,
  Award,
  Layers,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle,
  Code,
  Sun,
  Moon,
  Smartphone,
  ShoppingBag,
  Star
} from 'lucide-react';

// API 配置 - 生产环境改成你的服务器地址
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const Portfolio = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentProjectImage, setCurrentProjectImage] = useState('');
  const [theme, setTheme] = useState('dark');
  const [projects, setProjects] = useState([]);
  const [resumePath, setResumePath] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 从 API 加载作品数据
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/projects`);
        if (res.ok) {
          const data = await res.json();
          // 将 API 数据转换为前端格式
          const formattedProjects = data.map(p => ({
            title: p.title,
            category: p.category,
            color: getCategoryColor(p.category),
            desc: p.description,
            imageUrl: p.image
          }));
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.log('Using default projects data');
      }
    };
    fetchProjects();
  }, []);

  // 从 API 加载简历状态
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`${API_BASE}/resume`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setResumePath(data.path);
          }
        }
      } catch (error) {
        console.log('Resume not available');
      }
    };
    fetchResume();
  }, []);

  // 根据分类返回颜色
  const getCategoryColor = (category) => {
    if (category.includes('B端') || category.includes('移动')) return 'from-indigo-600 to-purple-500';
    if (category.includes('数据') || category.includes('可视化')) return 'from-blue-600 to-cyan-400';
    if (category.includes('品牌') || category.includes('运营') || category.includes('IP')) return 'from-amber-400 to-orange-500';
    return 'from-pink-500 to-rose-400';
  };

  const profile = {
    name: "王越",
    role: "资深 UI/视觉设计师",
    experience: "6年",
    location: "上海",
    phone: "195-1236-7660",
    email: "3282909675@qq.com",
    university: "山东理工大学",
    tags: ["B端系统专家", "数据可视化", "IP周边设计", "全链路UI"],
    resumeLink: "#"
  };

  const skills = [
    { name: "Figma & Sketch", level: 95, icon: <Layout size={18} /> },
    { name: "Photoshop & AI", level: 90, icon: <Palette size={18} /> },
    { name: "C4D & 3D", level: 75, icon: <Layers size={18} /> },
    { name: "Axure & Prototyping", level: 85, icon: <Monitor size={18} /> },
    { name: "Procreate / 手绘", level: 80, icon: <PenTool size={18} /> },
  ];

  const experiences = [
    {
      company: "平面设计师",
      role: "电商及展会视觉设计",
      period: "2025.04 - 至今",
      description: "专注于高视觉冲击力的品牌物料与IP衍生品设计。",
      achievements: [
        "IP衍生品开发与出版物设计",
        "线下展会与摊位视觉设计",
        "电商平台视觉升级"
      ]
    },
    {
      company: "兴业银行数字金融服务",
      role: "UI设计师",
      period: "2024.02 - 2025.03",
      description: "负责核心金融B端产品的用户体验与界面规范。",
      achievements: [
        "主导'兴*查'公共数据模块PC及APP双端设计",
        "建立团队平面设计素材库，提升设计输出效率",
        "输出标准化UI规范文档，确保开发还原度100%"
      ]
    },
    {
      company: "上海天跃科技",
      role: "UI设计师",
      period: "2020.10 - 2024.01",
      description: "全流程负责SaaS产品与数据可视化大屏设计。",
      achievements: [
        "完成'智慧考拉'APP/PC端10+版本迭代，服务中行农行等客户",
        "设计中心数据可视化大屏，提升用户决策效率20%",
        "运营微信公众号，粉丝自然增长至3000+"
      ]
    }
  ];

  // 默认作品数据（API 未返回数据时使用）
  const defaultProjects = [
    { title: "兴安云智能移动端", category: "B端系统 / APP", color: "from-indigo-600 to-purple-500", desc: "金融行业移动端解决方案", imageUrl: "https://s2.loli.net/2026/01/07/u4zXbdlFrOJpeWv.jpg" },
    { title: "金智云鼎 APP", category: "B端系统 / APP", color: "from-indigo-600 to-purple-500", desc: "面向企业客户的业务管理端", imageUrl: "https://s2.loli.net/2026/01/07/BZYHgkST8xoXCFV.jpg" },
    { title: "可视化大屏", category: "数据可视化", color: "from-blue-600 to-cyan-400", desc: "实时数据驾驶舱", imageUrl: "https://s2.loli.net/2026/01/07/clMVZtEbjufaqTi.jpg" },
    { title: "运营设计", category: "品牌 / 平面", color: "from-amber-400 to-orange-500", desc: "活动与转化目标的视觉物料", imageUrl: "https://s2.loli.net/2026/01/07/1yLBjnrei3RaFIf.jpg" },
  ];

  // 如果 API 没有返回数据，使用默认数据
  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  const openProjectModal = (imageUrl) => {
    setCurrentProjectImage(imageUrl);
    setShowProjectModal(true);
  };

  const isLight = theme === 'light';
  const surface = isLight ? 'bg-white border-neutral-200' : 'bg-neutral-800 border-neutral-700';
  const subtleSurface = isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-white/5 border-white/10';

  return (
    <div className={`${isLight ? 'bg-[#FAF7F2] text-neutral-900' : 'bg-neutral-900 text-white'} min-h-screen font-sans selection:bg-indigo-500 selection:text-white`}>
      {/* SVG Filter for Liquid Glass refraction effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquid-glass" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <nav className="fixed w-full z-50 py-4 px-4">
        <div className={`relative max-w-4xl mx-auto px-6 py-3 flex justify-between items-center rounded-[20px] transition-all duration-500 overflow-hidden ${
          scrolled ? 'opacity-100' : 'opacity-100'
        }`}
        style={{
          background: scrolled
            ? (isLight
                ? 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)')
            : 'transparent',
          backdropFilter: scrolled ? 'blur(40px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(40px) saturate(180%)' : 'none',
          border: scrolled
            ? (isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.18)')
            : 'none',
          boxShadow: scrolled
            ? (isLight
                ? '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.2)'
                : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)')
            : 'none',
        }}>
          {/* Specular highlight - top edge glow */}
          {scrolled && (
            <div
              className="absolute inset-x-0 top-0 h-[1px] pointer-events-none"
              style={{
                background: isLight
                  ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 80%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 80%, transparent 100%)',
              }}
            />
          )}
          {/* Inner glow for 3D depth */}
          {scrolled && (
            <div
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              style={{
                background: isLight
                  ? 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 60%)'
                  : 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)',
              }}
            />
          )}
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <img src="https://s2.loli.net/2026/01/07/lEZVjNrO6odPnQI.png" alt="logo" className="h-8 w-8 object-cover rounded-lg" />
            <span>Selected Works<span className="text-indigo-500">.</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-400">
            <a href="#home" className={`${isLight ? 'hover:text-neutral-900' : 'hover:text-white'} transition-colors`}>首页</a>
            <a href="#skills" className={`${isLight ? 'hover:text-neutral-900' : 'hover:text-white'} transition-colors`}>专业技能</a>
            <a href="#experience" className={`${isLight ? 'hover:text-neutral-900' : 'hover:text-white'} transition-colors`}>工作经历</a>
            <a href="#projects" className={`${isLight ? 'hover:text-neutral-900' : 'hover:text-white'} transition-colors`}>精选作品</a>
          </div>
          <div className="hidden md:flex">
            <button onClick={() => window.location.href = `mailto:${profile.email}`} className={`${isLight ? 'bg-indigo-500/80 text-white hover:bg-indigo-500 shadow-[0_4px_16px_rgba(99,102,241,0.3)]' : 'bg-white/90 text-neutral-950 hover:bg-white shadow-[0_4px_16px_rgba(255,255,255,0.2)]'} px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 backdrop-blur-sm`}>
              <Phone size={16} /> 联系我
            </button>
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-neutral-900 border-b border-white/10 p-6 flex flex-col gap-4">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300">首页</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300">工作经历</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="text-neutral-300">精选作品</a>
            <button onClick={() => { setMobileMenuOpen(false); window.location.href = `mailto:${profile.email}`; }} className="bg-indigo-600 w-full py-3 rounded-lg mt-2">联系我</button>
          </div>
        )}
      </nav>

      <header id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isLight ? 'bg-neutral-100 border-neutral-200 text-indigo-600' : 'bg-white/5 border-white/10 text-indigo-300'} text-sm font-medium mb-6`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              可立即入职
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              多维视野 <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">创造有生命力的</span>
              <br/> 视觉体验
            </h1>
            <p className="text-neutral-400 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
              {profile.experience}资深多维设计师（Visual / UI Designer）。
              <br />拒绝单一维度的定义。深耕B端系统与C端产品体验，同时活跃于品牌电商及二次元文创领域。
              <br />擅长在严谨的交互逻辑中注入细腻的视觉情感，无论是一套庞大的后台系统，还是一件触动粉丝的周边小物，都能提供精准且富有生命力的设计方案。
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#projects" className={`${isLight ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-neutral-950 hover:bg-neutral-200'} px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 flex items-center gap-2`}>
                查看作品 <ChevronDown size={18} />
              </a>
              {resumePath ? (
                <a href={resumePath} download="王越-交互设计师简历" className={`${isLight ? 'bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-50' : 'bg-transparent border border-white/20 text-white hover:bg-white/10'} px-8 py-3 rounded-full font-bold transition-colors flex items-center gap-2`}>
                  下载简历 <Download size={18} />
                </a>
              ) : (
                <span className={`${isLight ? 'bg-transparent border border-neutral-200 text-neutral-400' : 'bg-transparent border border-white/10 text-neutral-500'} px-8 py-3 rounded-full font-bold flex items-center gap-2 cursor-not-allowed`}>
                  简历准备中 <Download size={18} />
                </span>
              )}
            </div>
            <div className="mt-12 flex items-center gap-8 text-neutral-500 text-sm">
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-indigo-400" /> B端后台/C端应用
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-indigo-400" /> 电商主图/运营物料
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-indigo-400" /> 二次元周边/创意设计
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative z-10 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl group" style={{ aspectRatio: '454/550' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center transform translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                <img src="https://s2.loli.net/2026/01/07/rhRGcfkSKHYI4b8.jpg" alt="Design Preview" className="w-[90%] h-[90%] object-fill rounded-xl shadow-2xl border border-white/10" />
              </div>
              <div className="absolute -right-4 top-20 bg-neutral-800/90 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-xl transform rotate-3 group-hover:rotate-6 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Award size={20}/></div>
                  <div>
                    <div className="text-xs text-neutral-400">营收贡献</div>
                    <div className="text-lg font-bold text-white">¥300万+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="skills" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">核心技能</h2>
              <p className="text-neutral-400">工具只是手段，解决问题才是核心</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              {profile.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">#{tag}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <div className={`md:col-span-2 rounded-2xl p-8 border hover:border-indigo-500/30 transition-colors group ${surface}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="text-indigo-500"/> 设计工具
              </h3>
              <div className="space-y-5">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-300 flex items-center gap-2">{skill.icon} {skill.name}</span>
                      <span className="text-neutral-500">{skill.level}%</span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isLight ? 'bg-neutral-200' : 'bg-neutral-800'}`}>
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" style={{width: `${skill.level}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-2xl overflow-hidden border transition-colors relative ${surface}`} style={{ aspectRatio: '270/378' }}>
              <img src="https://s2.loli.net/2026/01/07/wZ2xsWNY5Bkrqy1.jpg" alt="B端系统" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-4xl font-bold mb-1 text-white">100%</div>
                <div className="text-white/80 text-sm">视觉包装和字体设计</div>
              </div>
            </div>
            <div className={`rounded-2xl overflow-hidden border transition-colors relative ${surface}`} style={{ aspectRatio: '270/378' }}>
              <img src="https://s2.loli.net/2026/01/07/fBTzhKiUXIxVwOb.jpg" alt="视觉设计" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-4xl font-bold mb-1 text-white">10+</div>
                <div className="text-white/80 text-sm">B端/SaaS系统项目交付</div>
              </div>
            </div>
            <div className={`md:col-span-4 rounded-2xl p-8 border flex flex-col md:flex-row items-center justify-between gap-6 ${isLight ? 'bg-gradient-to-r from-[#FAF7F2] to-neutral-100 border-neutral-200' : 'bg-gradient-to-r from-neutral-900 to-neutral-800 border-white/5'}`}>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>不仅是 UI，更是全链路设计师</h3>
                <p className="text-neutral-400 max-w-2xl">从抽象的逻辑构思到具象的视觉呈现，我专注于打通设计的每一个环节。 拥有 B 端系统的架构思维，同时具备 C 端与二次元领域的敏锐审美，为不同类型的产品提供从 0 到 1 的全案设计支持。</p>
              </div>
              <div className="shrink-0">
                <button onClick={() => setShowSkillsModal(true)} className={`${isLight ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900' : 'bg-white/10 hover:bg-white/20 text-white'} px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2`}>查看详细技能树 <BookOpen size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className={`py-20 px-6 ${isLight ? 'bg-transparent' : 'bg-neutral-900'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">工作经历</h2>
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-500 before:to-transparent">
            {experiences.map((exp, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 ${isLight ? 'border-[#FAF7F2] shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-neutral-950 shadow-[0_0_15px_rgba(79,70,229,0.5)]'} bg-indigo-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  <Briefcase size={16} className="text-white" />
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border shadow-lg hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 ${surface}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                    <h3 className="font-bold text-lg text白">{exp.company}</h3>
                    <span className="text-xs font-mono bg白/5 px-2 py-1 rounded text-indigo-300 border border白/5">{exp.period}</span>
                  </div>
                  <div className="text-indigo-400 font-medium text-sm mb-3">{exp.role}</div>
                  <p className="text-neutral-400 text-sm mb-4">{exp.description}</p>
                  <ul className="space-y-2">
                    {exp.achievements.map((item, i) => (
                      <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className={`py-20 px-6 ${isLight ? 'bg-transparent' : 'bg-neutral-900'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold">精选作品</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {displayProjects.map((project, index) => {
              const hasImage = !!project.imageUrl;
              return (
                <div
                  key={index}
                  onClick={() => hasImage && openProjectModal(project.imageUrl)}
                  className={`group relative rounded-2xl overflow-hidden border ${hasImage ? 'cursor-pointer' : 'cursor-default'} ${surface}`}
                >
                  {hasImage ? (
                    <div
                      className={`h-64 w-full bg-cover bg-center ${index !== 3 ? 'object-cover' : 'object-contain bg-neutral-800'}`}
                      style={{ backgroundImage: `url(${project.imageUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'top' }}
                    >
                      <div className="absolute inset-0 bg-neutral-900/40 group-hover:bg-neutral-900/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 bg-white text-neutral-950 rounded-full text-sm font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">点击查看</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 w-full bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center">
                      <span className="text-neutral-500 text-sm">暂无图片</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{project.category}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{project.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className={`${isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-800 border-white/5'} border-t py-16 px-6`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">期待与您共事</h2>
          <p className="text-neutral-400 mb-8 max-w-lg mx-auto">我正在寻找新的职业机会。如果您正在寻找一位既懂商业逻辑又具备出色视觉表现力的设计师，请联系我。</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mb-12">
            <a href={`mailto:${profile.email}`} className="flex items-center justify-center gap-3 bg-white text-neutral-950 px-8 py-4 rounded-xl font-bold hover:bg-neutral-200 transition-colors"><Mail size={20} />{profile.email}</a>
            <a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-3 bg-neutral-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-neutral-700 transition-colors border border-white/5"><Phone size={20} />{profile.phone}</a>
          </div>
          <div className="text-neutral-600 text-sm">
            <p>© 2025 Wang Yue. Designed & Developed for portfolio showcase.</p>
          </div>
        </div>
      </footer>

      {showSkillsModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl border border-white/10 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
            <button onClick={() => setShowSkillsModal(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"><X size={24} /></button>
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-3"><BookOpen className="text-indigo-500" size={28}/> 详细技能树</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2"><Layout size={20}/> 专业工具</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {['Figma', 'Sketch', 'Photoshop', 'Illustrator', 'Axure RP', 'C4D', 'Procreate', 'After Effects'].map((tool, i) => (
                    <span key={i} className="px-4 py-2 bg-neutral-800 rounded-lg text-sm flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> {tool}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2"><Zap size={20}/> 设计流程与能力</h4>
                <ul className="space-y-3 text-neutral-300">
                  <li className="flex items-start gap-3"><Sparkles size={18} className="text-yellow-400 shrink-0"/> <strong>用户研究与需求分析</strong>：能够深入理解用户需求与业务目标，产出PRD/MRD。</li>
                  <li className="flex items-start gap-3"><Monitor size={18} className="text-cyan-400 shrink-0"/> <strong>交互设计</strong>：熟练进行用户流程梳理、信息架构设计、原型绘制（线框图/高保真），输出完整的交互文档。</li>
                  <li className="flex items-start gap-3"><Palette size={18} className="text-pink-400 shrink-0"/> <strong>视觉设计</strong>：精通界面设计、组件库搭建、设计系统规范制定，确保品牌一致性与视觉美感。</li>
                  <li className="flex items-start gap-3"><Layers size={18} className="text-orange-400 shrink-0"/> <strong>动效设计</strong>：能利用AE等工具制作微交互动画与页面转场，提升产品活跃度。</li>
                  <li className="flex items-start gap-3"><Code size={18} className="text-green-400 shrink-0"/> <strong>设计协作与开发对接</strong>：熟悉开发流程，能与团队高效沟通，保证设计方案的落地性与还原度。</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-4 text-orange-400 flex items-center gap-2"><Award size={20}/> 软技能与学习经历</h4>
                <ul className="space-y-3 text-neutral-300">
                  <li className="flex items-start gap-3"><CheckCircle size={18} className="text-gray-400 shrink-0"/> <strong>高效沟通与团队协作</strong>：积极主动，能与产品、研发、运营团队顺畅沟通协作。</li>
                  <li className="flex items-start gap-3"><CheckCircle size={18} className="text-gray-400 shrink-0"/> <strong>解决问题能力</strong>：具备独立思考与快速解决问题的能力，能够应对复杂多变的设计挑战。</li>
                  <li className="flex items-start gap-3"><BookOpen size={18} className="text-gray-400 shrink-0"/> <strong>持续学习</strong>：关注设计趋势，不断学习新工具与新技术，保持设计前瞻性。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className={`fixed inset-0 ${isLight ? 'bg-[#FAF7F2]/90' : 'bg-neutral-900/90'} backdrop-blur-md z-[100] flex items-center justify-center p-4`} onClick={() => setShowProjectModal(false)}>
          <div className={`relative w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl border flex flex-col ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-white/10'}`} onClick={e => e.stopPropagation()}>
            <div className={`flex justify-between items-center p-4 border-b ${isLight ? 'border-neutral-200 bg-neutral-50' : 'border-white/10 bg-neutral-900/50'}`}>
              <h3 className={`font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>项目预览</h3>
              <button onClick={() => setShowProjectModal(false)} className={`${isLight ? 'text-neutral-600 hover:text-neutral-900 bg-neutral-200 hover:bg-neutral-300' : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'} transition-colors p-2 rounded-full`}><X size={20} /></button>
            </div>
            <div className={`flex-1 overflow-y-auto ${isLight ? 'bg-[#FAF7F2]' : 'bg-neutral-900'}`}>
              <img src={currentProjectImage} alt="Project Preview" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setTheme(isLight ? 'dark' : 'light')}
        className={`fixed bottom-4 right-4 z-[200] rounded-full shadow-lg px-4 py-3 flex items-center gap-2 transition-colors ${isLight ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-white text-neutral-900 hover:bg-neutral-100'}`}
        aria-label="切换主题"
      >
        {isLight ? <Moon size={18}/> : <Sun size={18}/>}
        <span className="text-sm font-semibold">{isLight ? '夜间' : '日间'}</span>
      </button>

    </div>
  );
};

export default Portfolio;