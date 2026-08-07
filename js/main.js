(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.site-header');

  const saved = localStorage.getItem('portfolio-theme-v5');
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = saved || (prefersDark ? 'dark' : 'light');

  const syncTheme = () => {
    if (themeToggle) themeToggle.textContent = root.dataset.theme === 'dark' ? '☀' : '◐';
  };
  syncTheme();

  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme-v5', root.dataset.theme);
    syncTheme();
  });

  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', scrollY > 6);
  }, { passive: true });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });

  document.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 45}ms`;
    observer.observe(element);
  });
})();


// ==========================================
// Project Data & Modal Logic
// ==========================================
const projectData = {
  "mes": {
    title: "制造业 MES 系统实施",
    meta: "2025–2026 | 核心项目",
    content: `
      <h4>项目背景</h4>
      <p>为提升制造现场的透明度与执行效率，全面实施 MES 系统管控生产全生命周期。</p>
      <h4>核心职责</h4>
      <ul>
        <li><strong>需求梳理：</strong>主导 SMT 与 DIP 车间的业务流程梳理，输出标准化需求文档。</li>
        <li><strong>系统测试与上线：</strong>负责系统功能测试（UAT）、数据准备及现场操作培训。</li>
        <li><strong>优化闭环：</strong>上线后持续跟进异常问题，搭建车间可视化 Dashboard，实现数据驱动管理。</li>
      </ul>
      <h4>成果与沉淀</h4>
      <p>完成 12+ 核心模块的落地，生产效率提升 30%，实现 100% 的平稳上线支持。</p>
    `
  },
  "aps": {
    title: "泰国 APS 项目",
    meta: "2026 | 海外项目",
    content: `
      <h4>项目背景</h4>
      <p>为优化跨国工厂的产能协同，在泰国生产基地推广高级计划与排程（APS）系统。</p>
      <h4>核心职责</h4>
      <ul>
        <li><strong>跨国沟通：</strong>克服语言障碍，与中泰两地业务人员确认排程逻辑与需求。</li>
        <li><strong>数据验证：</strong>协助完成主数据清洗与本地化映射，确保计划准确性。</li>
        <li><strong>现场支持：</strong>提供上线支持，协同各部门确保排程结果在车间得到准确执行。</li>
      </ul>
    `
  },
  "oracle": {
    title: "Oracle / EIP 流程支持",
    meta: "2025–2026 | 业务系统",
    content: `
      <h4>项目背景</h4>
      <p>通过梳理企业内部业务规则，推动 Oracle ERP 与 EIP 系统的深度融合与流程自动化。</p>
      <h4>核心职责</h4>
      <ul>
        <li><strong>流程梳理：</strong>分析跨部门协作痛点，优化系统审批流与业务流转路径。</li>
        <li><strong>问题跟进：</strong>作为业务与研发团队的沟通桥梁，推进系统问题修复与新需求落地。</li>
      </ul>
    `
  },
  "portfolio": {
    title: "Portfolio V5",
    meta: "2026 | 个人项目",
    content: `
      <h4>项目背景</h4>
      <p>个人能力、项目经验与技术沉淀的数字化展示平台。</p>
      <h4>实现细节</h4>
      <ul>
        <li>使用 HTML / CSS / JavaScript 独立开发，无依赖外部重型框架。</li>
        <li>响应式布局设计，支持多端适配与暗黑模式切换。</li>
      </ul>
    `
  }
};

const modal = document.getElementById('project-modal');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalBody = document.getElementById('modal-body');

document.querySelectorAll('.project-card').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const id = card.getAttribute('data-project');
    const data = projectData[id];
    if(data) {
      modalTitle.textContent = data.title;
      modalMeta.textContent = data.meta;
      modalBody.innerHTML = data.content;
      modal.classList.add('active');
    }
  });
});

modalClose?.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal?.addEventListener('click', (e) => {
  if(e.target === modal) modal.classList.remove('active');
});
