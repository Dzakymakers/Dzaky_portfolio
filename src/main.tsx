import { StrictMode, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  ArrowUp,
  ArrowUpRight,
  Brain,
  CalendarDays,
  ChevronDown,
  Code,
  Download,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Moon,
  Phone,
  Presentation,
  Rocket,
  Sigma,
  Sun,
  Trophy,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import "./styles.css";

type Theme = "light" | "dark";
type IconType = typeof GraduationCap;

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

const navigation = [
  ["About", "about"],
  ["Education", "education"],
  ["Achievements", "achievements"],
  ["Experience", "experience"],
  ["Skills", "skills"],
  ["Contact", "contact"],
] as const;

const education = [
  {
    school: "Universitas Mikroskil",
    qualification: "Bachelor of Informatics Engineering",
    period: "2026–Present",
    detail: "Undergraduate study focused on computing, analytical reasoning, and software development.",
  },
  {
    school: "SMA Swasta Kartika I-2 Medan",
    qualification: "Science (IPA)",
    period: "2023–2026",
    detail: "Graduation Average Score: 88/100",
  },
];

const achievements = [
  {
    rank: "Top 3",
    title: "Indonesia Social & Science Competition (ISSC) 2025",
    organizer: "HIMAFIS UNIMED",
    date: "November 2025",
    certificate: "/images/certificates/issc-2025.jpg",
  },
  {
    rank: "Top 10",
    title: "Senior High School Academic Olympiad (SEHSCO) 2026",
    organizer: "HIMATEK USU",
    date: "January 2026",
    certificate: "/images/certificates/sehsco-2026.jpg",
  },
  {
    rank: "Top 10",
    title: "HIMATEK USU Student Competition (HUSC) 2025",
    organizer: "HIMATEK USU",
    date: "May 2025",
    certificate: "/images/certificates/husc-2025.jpg",
  },
  {
    rank: "Silver",
    title: "Indonesian Olympiad Battle (IOB) Math Prelim 2 Season 1 — Grade 12",
    organizer: "Indonesian Olympiad Battle",
    date: "January 2026",
    certificate: "/images/certificates/iob-2026.jpg",
  },
  {
    rank: "Top 10",
    title: "International Edu Science Competition (IESC) 2025",
    organizer: "Elite Scholars ID × POPI.IDN",
    date: "October 2025",
    certificate: "/images/certificates/iesc-2025.jpg",
  },
  {
    rank: "Top 10",
    title: "Indonesia Student Olympiad (INASO) 2025",
    organizer: "INASO × POPI.IDN",
    date: "July 2025",
    certificate: "/images/certificates/inaso-2025.jpg",
  },
];

const featuredAchievementCount = 3;

const stats: { value: number; label: string; icon: IconType }[] = [
  { value: 2, label: "Education", icon: GraduationCap },
  { value: 3, label: "Achievements", icon: Trophy },
  { value: 1, label: "Organization", icon: Users },
  { value: 1, label: "Seminar", icon: Presentation },
];

const skills: { title: string; icon: IconType; description?: string; items: string[] }[] = [
  {
    title: "Mathematics & Analytical",
    icon: Sigma,
    description: "Olympiad-level problem solving and a structured approach to complex challenges.",
    items: ["Mathematical reasoning", "Problem-solving", "Logical reasoning", "Olympiad competitor"],
  },
  {
    title: "Currently Learning",
    icon: Code,
    description: "Building a technical foundation step by step.",
    items: ["Python — Learning", "Web Development — Learning"],
  },
  {
    title: "Soft Skills & Initiative",
    icon: Rocket,
    description: "Proactive, dependable, and always looking to grow beyond the classroom.",
    items: ["Teamwork", "Adaptability", "Attention to Detail", "Discipline", "Self-directed learning", "Seeking competitions & seminars"],
  },
  {
    title: "Languages",
    icon: Languages,
    description: "Clear written communication and comprehension.",
    items: ["Bahasa Indonesia — Native", "English — Passive (Reading & Writing)"],
  },
];

function TypedName({ lines }: { lines: [string, string] }) {
  const total = lines[0].length + lines[1].length;
  const [count, setCount] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? total : 0,
  );

  useEffect(() => {
    if (count >= total) return;
    const delay = count === 0 ? 800 : count === lines[0].length ? 450 : 150 + Math.random() * 80;
    const timer = window.setTimeout(() => setCount((value) => value + 1), delay);
    return () => window.clearTimeout(timer);
  }, [count, total, lines]);

  const first = lines[0].slice(0, Math.min(count, lines[0].length));
  const second = lines[1].slice(0, Math.max(0, count - lines[0].length));
  const done = count >= total;
  const caret = <span className={`type-caret${done ? " is-done" : ""}`} />;

  return (
    <>
      <span aria-hidden="true">{first}{count <= lines[0].length && caret}{"\u200b"}</span>
      <br aria-hidden="true" />
      <span className="name-outline" aria-hidden="true">{second}{count > lines[0].length && caret}{"\u200b"}</span>
    </>
  );
}

const revealSelector = [
  ".section-heading",
  ".about-copy",
  ".stat-card",
  ".timeline-card",
  ".achievement-card",
  ".feature-card",
  ".skill-card",
  ".contact-inner > *",
].join(", ");

function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="section-intro">{description}</p>}
    </div>
  );
}

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      setCount(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        const started = performance.now();
        const duration = 700;
        const tick = (now: number) => {
          const progress = Math.min((now - started) / duration, 1);
          setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={elementRef}>{count}</span>;
}

function ActionLink({
  href,
  children,
  className = "button primary",
  download,
  newTab,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  download?: string;
  newTab?: boolean;
}) {
  return (
    <a
      className={className}
      href={href}
      download={download}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMoreAchievements, setShowMoreAchievements] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setTheme(next);
      return;
    }

    if (typeof document.startViewTransition !== "function") {
      root.classList.add("theme-transition");
      setTheme(next);
      window.setTimeout(() => root.classList.remove("theme-transition"), 450);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${radius}px`);

    const transition = document.startViewTransition(() => {
      root.dataset.theme = next;
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    });

    transition.finished.finally(() => {
      root.style.removeProperty("--vt-x");
      root.style.removeProperty("--vt-y");
      root.style.removeProperty("--vt-r");
    });
  };

  useLayoutEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    const counts = new Map<Element | null, number>();
    targets.forEach((el) => {
      const index = counts.get(el.parentElement) ?? 0;
      counts.set(el.parentElement, index + 1);
      el.classList.add("reveal");
      el.style.setProperty("--d", `${Math.min(index, 5) * 0.08}s`);
    });
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!lightbox) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightbox]);

  const renderAchievement = (achievement: (typeof achievements)[number], index: number) => (
    <article className="achievement-card" key={achievement.title}>
      <div className="achievement-head"><span className="rank">{achievement.rank}</span><span className="card-number">{String(index + 1).padStart(2, "0")}</span></div>
      <button
        type="button"
        className="certificate-thumb"
        onClick={() => setLightbox({ src: achievement.certificate, title: achievement.title })}
        aria-label={`Lihat sertifikat ${achievement.title}`}
      >
        <img src={achievement.certificate} alt={`Sertifikat ${achievement.title}`} loading="lazy" />
        <span className="certificate-zoom"><ZoomIn size={15} aria-hidden="true" /> Lihat sertifikat</span>
      </button>
      <p className="category">Mathematics Olympiad</p>
      <h3>{achievement.title}</h3>
      <div className="achievement-meta"><span>{achievement.organizer}</span><span><CalendarDays size={14} /> {achievement.date}</span></div>
    </article>
  );

  const closeMenu = () => setMenuOpen(false);
  const backToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    headerRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header" ref={headerRef} tabIndex={-1} id="top">
        <div className="nav-wrap">
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              ref={menuButtonRef}
              className="icon-button menu-button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <nav
          id="mobile-menu"
          className={`mobile-nav ${menuOpen ? "open" : ""}`}
          aria-label="Mobile navigation"
          aria-hidden={!menuOpen}
        >
          {navigation.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>{label}</a>
          ))}
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-glow" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="availability"><span /> Open to internships & opportunities</div>
              <p className="hero-kicker">Hello, I’m</p>
              <h1 id="hero-title" aria-label="Dzaky Habibi."><TypedName lines={["Dzaky", "Habibi."]} /></h1>
              <p className="tagline">Informatics Engineering Student <i /> Problem Solver <i /> Mathematics Olympiad Participant</p>
              <div className="hero-meta">
                <a href="https://maps.google.com/?q=Medan,Sumatera+Utara" target="_blank" rel="noreferrer"><MapPin size={16} /> Medan, Sumatera Utara</a>
                <a href="mailto:dzakyhabibi93@gmail.com"><Mail size={16} /> dzakyhabibi93@gmail.com</a>
              </div>
              <div className="hero-actions">
                <ActionLink href="/cv/dzaky-habibi-cv.pdf" download="Dzaky-Habibi-CV.pdf"><Download size={17} /> Download CV</ActionLink>
                <ActionLink href="https://www.linkedin.com/in/dzaky-habibi-91373035b" className="button secondary" newTab><Linkedin size={17} /> LinkedIn <ArrowUpRight size={15} /></ActionLink>
              </div>
            </div>
            <div className="portrait-wrap">
              <div className="portrait-frame">
                <img src="/images/profile-placeholder.jpg" alt="Portrait placeholder for Dzaky Habibi" width="720" height="900" fetchPriority="high" />
                <div className="portrait-label"><span>Based in</span><strong>Medan, Indonesia</strong></div>
              </div>
              <div className="orbit-note note-one"><Trophy size={16} /><span><strong>3×</strong> Math achievements</span></div>
              <div className="orbit-note note-two"><Brain size={16} /><span>Analytical thinker</span></div>
            </div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-grid">
            <SectionHeading eyebrow="01 / About" title="Curious by nature. Driven by progress." />
            <div className="about-copy">
              <p>Highly motivated Informatics Engineering student at Universitas Mikroskil with strong analytical thinking, mathematical reasoning, and problem-solving skills.</p>
              <p>Recognized through multiple national mathematics olympiad achievements and experienced in collaborating through school organizations. Quick learner with excellent adaptability, attention to detail, and a strong interest in technology, software development, and continuous professional development.</p>
            </div>
          </div>
          <div className="container stats-grid" aria-label="Portfolio highlights">
            {stats.map(({ value, label, icon: Icon }) => (
              <article className="stat-card" key={label}>
                <Icon size={20} aria-hidden="true" />
                <strong><Counter value={value} /><sup>+</sup></strong>
                <span>{label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section alternate" id="education">
          <div className="container">
            <SectionHeading eyebrow="02 / Education" title="Building a strong foundation." description="A learning path grounded in science, mathematics, and technology." />
            <div className="timeline">
              {education.map((item, index) => (
                <article className="timeline-item" key={item.school}>
                  <div className="timeline-marker"><GraduationCap size={20} /></div>
                  <div className="timeline-card">
                    <div className="timeline-top"><span>{index === 0 ? "University" : "Senior High School"}</span><time>{item.period}</time></div>
                    <h3>{item.school}</h3>
                    <p className="qualification">{item.qualification}</p>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="achievements">
          <div className="container">
            <SectionHeading eyebrow="03 / Achievements" title="Mathematics, measured in milestones." description="National and regional olympiad results reflecting consistent analytical performance." />
            <div className="achievement-grid">
              {achievements.slice(0, featuredAchievementCount).map((achievement, index) => renderAchievement(achievement, index))}
            </div>
            <div className={`achievement-more${showMoreAchievements ? " open" : ""}`} id="more-achievements" inert={!showMoreAchievements}>
              <div className="achievement-more-inner">
                <div className="achievement-grid">
                  {achievements.slice(featuredAchievementCount).map((achievement, index) => renderAchievement(achievement, index + featuredAchievementCount))}
                </div>
              </div>
            </div>
            <div className="achievement-toggle">
              <button
                type="button"
                className="button secondary"
                onClick={() => setShowMoreAchievements((open) => !open)}
                aria-expanded={showMoreAchievements}
                aria-controls="more-achievements"
              >
                {showMoreAchievements ? "See less" : `See more (${achievements.length - featuredAchievementCount})`}
                <ChevronDown size={16} className={`toggle-chevron${showMoreAchievements ? " open" : ""}`} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {lightbox && (
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title} onClick={() => setLightbox(null)}>
            <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Tutup"><X size={20} /></button>
            <img src={lightbox.src} alt={`Sertifikat ${lightbox.title}`} onClick={(event) => event.stopPropagation()} />
          </div>
        )}

        <section className="section alternate" id="experience">
          <div className="container">
            <SectionHeading eyebrow="04 / Experience" title="Learning through involvement." description="Collaboration beyond the classroom through organization and professional learning." />
            <div className="experience-grid">
              <article className="feature-card organization-card">
                <div className="feature-icon"><Users size={23} /></div>
                <div className="feature-content">
                  <p className="category">Organizational Experience</p>
                  <h3>Member — Student Council (OSIS)</h3>
                  <p className="place">SMA Kartika I-2 Medan <span>2023–2026</span></p>
                  <p>Actively participated in student organization activities and school events, collaborating with fellow members to execute school programs and extracurricular initiatives.</p>
                </div>
              </article>
              <article className="feature-card seminar-card">
                <div className="feature-icon"><Presentation size={23} /></div>
                <button
                  type="button"
                  className="certificate-thumb"
                  onClick={() => setLightbox({ src: "/images/certificates/data-or-die-2025.jpg", title: "“Data or Die” Seminar" })}
                  aria-label="Lihat sertifikat “Data or Die” Seminar"
                >
                  <img src="/images/certificates/data-or-die-2025.jpg" alt="Sertifikat peserta “Data or Die” Seminar" loading="lazy" />
                  <span className="certificate-zoom"><ZoomIn size={15} aria-hidden="true" /> Lihat sertifikat</span>
                </button>
                <div className="feature-content">
                  <p className="category">Seminar & Training</p>
                  <h3>“Data or Die” Seminar</h3>
                  <p className="place">Participant <span>July 2025</span></p>
                  <p>“Survival Guide Anti Hoax di Era Information Overload,” organized by Himpunan Mahasiswa Sains Data, FIKTI UMSU.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="skills">
          <div className="container">
            <SectionHeading eyebrow="05 / Skills" title="Capabilities with room to grow." description="A balanced toolkit for thoughtful work, productive teams, and continuous development." />
            <div className="skills-grid">
              {skills.map(({ title, icon: Icon, description, items }) => (
                <article className="skill-card" key={title}>
                  <div className="skill-icon"><Icon size={22} /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-inner">
            <div>
              <p className="eyebrow light">06 / Contact</p>
              <h2>Let’s build something<br /><span>meaningful.</span></h2>
              <p>I’m open to internships, scholarships, university collaborations, and entry-level opportunities where I can learn and contribute.</p>
              <ActionLink href="mailto:dzakyhabibi93@gmail.com?subject=Opportunity%20for%20Dzaky%20Habibi" className="button contact-button"><Mail size={17} /> Start a conversation <ArrowUpRight size={16} /></ActionLink>
            </div>
            <div className="contact-links">
              <a href="mailto:dzakyhabibi93@gmail.com"><span><Mail size={19} /><small>Email</small><strong>dzakyhabibi93@gmail.com</strong></span><ArrowUpRight size={18} /></a>
              <a href="tel:+6289635857544"><span><Phone size={19} /><small>Phone</small><strong>0896-3585-7544</strong></span><ArrowUpRight size={18} /></a>
              <a href="https://www.linkedin.com/in/dzaky-habibi-91373035b" target="_blank" rel="noreferrer"><span><Linkedin size={19} /><small>LinkedIn</small><strong>Connect with Dzaky</strong></span><ArrowUpRight size={18} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div><strong>Dzaky Habibi</strong><span>Informatics Engineering Student</span></div>
          <p>© {new Date().getFullYear()} Dzaky Habibi. Built with purpose.</p>
          <button type="button" onClick={backToTop} aria-label="Back to top">Back to top <ArrowUp size={15} /></button>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode><App /></StrictMode>,
);
