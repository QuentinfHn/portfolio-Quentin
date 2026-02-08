import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, ExternalLink, X, Car, ArrowUpRight, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import CarGame from './components/CarGame';

// --- Image Loading Logic ---
const projectImagesGlob = import.meta.glob([
  './assets/projects/**/*.{png,jpg,jpeg,webp,svg}',
  './assets/projects/**/*.{PNG,JPG,JPEG,WEBP,SVG}'
], { eager: true, import: 'default', query: '?url' });

const workImagesGlob = import.meta.glob([
  './assets/work-photos/*.png', './assets/work-photos/*.PNG',
  './assets/work-photos/*.jpg', './assets/work-photos/*.JPG',
  './assets/work-photos/*.jpeg', './assets/work-photos/*.JPEG',
  './assets/work-photos/*.webp', './assets/work-photos/*.WEBP',
  './assets/work-photos/*.svg', './assets/work-photos/*.SVG'
], { eager: true, import: 'default', query: '?url' });

const getImagesForProject = (id) => {
  const images = [];
  const prefix = `./assets/projects/${id}/`;
  for (const path in projectImagesGlob) {
    if (path.startsWith(prefix)) {
      images.push(projectImagesGlob[path]);
    }
  }
  return images;
};

const getWorkImages = () => Object.values(workImagesGlob);

// --- Configuration ---
const PROJECTS_DATA = [
  {
    id: 1,
    title: "Signing Awakenings Summerfestival 2025",
    description: "10 signing LED torens aangestuurd vanaf een centraal punt met behulp van NDI",
    longDescription: "Voor dit project was ik verantwoordelijk voor het instellen en configureren van de tien LED-torens en het volledige NDI-netwerk. Ik zorgde ervoor dat alle schermen centraal en betrouwbaar aangestuurd konden worden, inclusief een stabiele verbinding met Resolume en Novastar voor realtime contentbeheer.",
    tags: ["NDI", "Resolume", "Novastar", "Signing"],
    category: "AV",
  },
  {
    id: 2,
    title: "Portfolio 2024",
    description: "Mijn vorige portfolio website, genomineerd voor diverse design awards vanwege de unieke navigatie.",
    longDescription: "Een experimenteel project waarbij ik de grenzen van webanimaties heb opgezocht. Met behulp van WebGL en GSAP heb ik een unieke, vloeiende navigatie-ervaring gecreëerd die de gebruiker meeneemt op een reis door mijn werk. De focus lag op interactie en visuele impact.",
    tags: ["Vue.js", "GSAP", "WebGL"],
    category: "WEB",
  },
  {
    id: 3,
    title: "Task Manager App",
    description: "Een minimalistische to-do applicatie met focus op deep work en productiviteit.",
    longDescription: "Deze applicatie is gebouwd om gebruikers te helpen hun focus te behouden. Het minimalistische design verwijdert alle afleidingen. Features zijn onder andere een Pomodoro timer, taakprioritering en gedetailleerde statistieken over productiviteit.",
    tags: ["React Native", "Firebase", "TypeScript"],
    category: "APP",
  },
  {
    id: 4,
    title: "Dashboard Analytics",
    description: "Real-time data visualisatie dashboard voor SaaS bedrijven.",
    longDescription: "Een krachtig dashboard dat complexe datasets omzet in begrijpelijke visualisaties. Gebruikers kunnen real-time trends volgen, rapporten genereren en diep in de data duiken. Gebouwd met D3.js voor maximale flexibiliteit in grafieken.",
    tags: ["D3.js", "React", "Node.js"],
    category: "WEB",
  }
];

// --- Grain Overlay ---
const GrainOverlay = () => <div className="grain-overlay" />;

// --- Animated Section ---
const Section = ({ children, className = "", id }) => (
  <motion.section
    id={id}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-10%" }}
    variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
    className={`relative z-10 ${className}`}
  >
    {children}
  </motion.section>
);

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay } }
    }}
  >
    {children}
  </motion.div>
);

// --- Marquee ---
const Marquee = ({ text, reverse = false }) => {
  const content = Array(4).fill(text).join(' — ');
  return (
    <div className="overflow-hidden py-6 border-y border-surface-border">
      <div className={`marquee-track ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        <span className="font-display text-6xl md:text-8xl font-bold text-dark-50 whitespace-nowrap px-8 select-none">
          {content} — {content}
        </span>
      </div>
    </div>
  );
};

// --- Big Text Reveal ---
const BigTextReveal = ({ text, className = "" }) => (
  <div className={`flex overflow-hidden ${className}`}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ y: "120%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block"
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </div>
);

// --- Status Indicator ---
const StatusIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <div className="w-2 h-2 bg-accent-400 rounded-full" />
      <div className="absolute inset-0 w-2 h-2 bg-accent-400 rounded-full animate-ping opacity-75" />
    </div>
    <span className="text-sm text-muted font-medium">Beschikbaar voor projecten</span>
  </div>
);

// --- Project Card (Bento Style) ---
const ProjectCard = ({ project, onClick, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    }}
    onClick={() => onClick(project)}
    className={`group relative bg-surface rounded-2xl border border-surface-border hover:border-lime-400/30 cursor-pointer overflow-hidden transition-all duration-500 ${
      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
    }`}
  >
    {/* Category badge */}
    <div className="absolute top-4 left-4 z-10">
      <span className="px-2 py-1 text-[10px] font-display font-bold tracking-[0.2em] uppercase bg-accent-400/10 text-accent-400 rounded-full border border-accent-400/20">
        {project.category}
      </span>
    </div>

    {/* Arrow */}
    <div className="absolute top-4 right-4 z-10">
      <div className="w-10 h-10 rounded-full border border-surface-border group-hover:border-accent-400/50 flex items-center justify-center transition-all duration-300 group-hover:bg-accent-500 group-hover:scale-110">
        <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
      </div>
    </div>

    {/* Content */}
    <div className={`p-6 md:p-8 flex flex-col justify-end ${index === 0 ? 'min-h-[400px]' : 'min-h-[280px]'}`}>
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, i) => (
            <span key={i} className="text-xs font-medium text-muted bg-dark-100 px-2.5 py-1 rounded-md border border-surface-border">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className={`font-display font-bold text-white group-hover:text-accent-400 transition-colors duration-300 mb-3 ${
          index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'
        }`}>
          {project.title}
        </h3>
        
        <p className="text-muted text-sm leading-relaxed line-clamp-2 max-w-md">
          {project.description}
        </p>
      </div>
    </div>
  </motion.div>
);

// --- Project Modal ---
const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-3xl bg-dark-100 rounded-2xl border border-surface-border shadow-2xl shadow-black/50 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-surface-light rounded-full hover:bg-surface-border transition-colors z-10 border border-surface-border"
        >
          <X className="w-5 h-5 text-muted" />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto">
          <div className="mb-4">
            <span className="px-2 py-1 text-[10px] font-display font-bold tracking-[0.2em] uppercase bg-accent-400/10 text-accent-400 rounded-full border border-accent-400/20">
              {project.category}
            </span>
          </div>

          <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">{project.title}</h3>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-surface text-muted text-sm rounded-lg border border-surface-border font-medium">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            {project.description}
          </p>

          <div className="section-divider mb-8" />

          <h4 className="text-lg font-display font-semibold text-white mb-4">Over dit project</h4>
          <p className="text-gray-400 leading-relaxed mb-8">
            {project.longDescription}
          </p>

          {project.images && project.images.length > 0 ? (
            <div className="grid gap-4">
              {project.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Project screenshot ${idx + 1}`}
                  className="rounded-xl w-full object-cover border border-surface-border"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-48 bg-surface rounded-xl flex items-center justify-center text-muted border border-dashed border-surface-border">
              Nog geen afbeeldingen beschikbaar
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- Timeline Item ---
const TimelineItem = ({ year, title, company, description, icon: Icon }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
    }}
    className="relative pl-8 pb-10 border-l border-surface-border last:pb-0 group"
  >
    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 bg-dark-900 border-2 border-accent-400 rounded-full group-hover:bg-accent-500 transition-colors duration-300" />
    <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-display font-bold tracking-[0.15em] uppercase text-accent-400 bg-accent-400/5 rounded border border-accent-400/15">
      {year}
    </span>
    <h3 className="text-lg font-display font-bold text-white mb-0.5">{title}</h3>
    <div className="text-sm text-muted font-medium mb-2">{company}</div>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </motion.div>
);

// --- Work Gallery ---
const WorkGallery = ({ scrollRef }) => {
  const images = useMemo(() => getWorkImages(), []);
  const localRef = useRef(null);
  const containerRef = scrollRef || localRef;
  const baseWidthRef = useRef(0);

  const displayImages = images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
  ];

  const loopImages = useMemo(() => {
    if (displayImages.length === 0) return [];
    return [...displayImages, ...displayImages, ...displayImages];
  }, [displayImages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loopImages.length === 0) return;

    const setBaseWidth = () => {
      if (!containerRef.current) return;
      const baseWidth = containerRef.current.scrollWidth / 3;
      baseWidthRef.current = baseWidth;
      if (containerRef.current.scrollLeft === 0) {
        containerRef.current.scrollLeft = baseWidth;
      }
    };

    let animationFrameId;
    let scrollPos = 0;

    const animate = () => {
      if (!containerRef.current) return;
      if (Math.abs(containerRef.current.scrollLeft - scrollPos) > 5) {
        scrollPos = containerRef.current.scrollLeft;
      }
      scrollPos += 0.5;
      containerRef.current.scrollLeft = scrollPos;
      const baseWidth = baseWidthRef.current;
      if (baseWidth > 0) {
        if (scrollPos >= baseWidth * 2) {
          scrollPos = baseWidth;
          containerRef.current.scrollLeft = baseWidth;
        } else if (scrollPos <= 0) {
          scrollPos = baseWidth;
          containerRef.current.scrollLeft = baseWidth;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    setTimeout(() => {
      setBaseWidth();
      if (containerRef.current) scrollPos = containerRef.current.scrollLeft;
      animate();
    }, 100);

    window.addEventListener('resize', setBaseWidth);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setBaseWidth);
    };
  }, [loopImages.length]);

  return (
    <div className="w-full py-8">
      <div
        ref={containerRef}
        className="flex overflow-x-hidden gap-5 px-6 md:px-20 pb-6"
        style={{ scrollBehavior: 'auto' }}
      >
        {loopImages.map((img, index) => (
          <motion.div
            key={index}
            className="min-w-[80vw] max-w-[80vw] md:min-w-[600px] md:max-w-[600px] aspect-[4/3] rounded-2xl overflow-hidden relative group flex-shrink-0 border border-surface-border bg-surface"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <img
              src={img}
              alt={`Work ${index + 1}`}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const galleryRef = useRef(null);

  const handleCarUpdate = ({ x, y, velocity, rotation }) => {
    if (!galleryRef.current) return;
    const galleryRect = galleryRef.current.getBoundingClientRect();
    if (y + 70 > galleryRect.top - 50 && y < galleryRect.bottom + 50) {
      const horizontalVelocity = Math.sin(rotation * Math.PI / 180) * velocity;
      if (Math.abs(horizontalVelocity) > 0.1) {
        galleryRef.current.scrollLeft += horizontalVelocity * 1.5;
      }
    }
  };

  const projects = useMemo(() => {
    return PROJECTS_DATA.map(p => ({ ...p, images: getImagesForProject(p.id) }));
  }, []);

  return (
    <div className="relative text-white font-sans min-h-screen bg-dark-900">
      <GrainOverlay />

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between px-6 md:px-12 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">Q</span>
            </div>
            <span className="font-display font-bold tracking-tight text-white text-sm hidden md:block">QUENTIN FABRIE</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted font-medium hidden md:flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Utrecht, NL — {currentTime}
            </span>
            <div className="w-px h-4 bg-surface-border hidden md:block" />
            <a href="mailto:hello@quentinfabrie.nl" className="text-sm font-medium text-muted hover:text-accent-400 transition-colors duration-300">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <Section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <StatusIndicator />
          </motion.div>

          <div className="mb-6">
            <BigTextReveal
              text="Creative"
              className="font-display text-6xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-bold tracking-tighter text-white leading-[0.9]"
            />
            <BigTextReveal
              text="Developer"
              className="font-display text-6xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-bold tracking-tighter gradient-text leading-[0.9]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <p className="text-lg md:text-xl text-gray-400 max-w-lg font-light leading-relaxed">
              <span className="text-white font-medium">Videospecialist</span> die naast werk{' '}
              <span className="text-white font-medium">Technische Bedrijfskunde</span> studeert in Utrecht.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-2 text-muted"
            >
              <ArrowDown className="w-4 h-4 animate-bounce" />
              <span className="text-sm">Scroll om meer te ontdekken</span>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* Marquee Divider */}
      <Marquee text="AV SPECIALIST • DEVELOPER • VIDEOTECH" />

      {/* About */}
      <Section className="py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="section-number mb-8">01 — Over mij</div>
          </Reveal>

          <div className="grid md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <Reveal>
                <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                  Passie voor
                  <span className="gradient-text"> techniek</span>
                </h2>
              </Reveal>
            </div>
            <div className="md:col-span-7">
              <Reveal delay={0.2}>
                <p className="text-lg text-gray-400 font-light leading-relaxed mb-6">
                  Mijn interesse ligt bij videotechniek. Ik vind het leuk om nieuwe producten te testen en te ontdekken hoe ik ze in de praktijk kan toepassen. Naast mijn studie Technische Bedrijfskunde leer ik veel tijdens mijn stage bij Axians én in mijn werk bij Ledlease, waar ik theorie en praktijk dagelijks combineer.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <p className="text-lg text-gray-400 font-light leading-relaxed">
                  Met een passie voor techniek en verbetering zoek ik steeds naar slimme, praktische oplossingen.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* Experience & Education */}
      <Section className="py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="section-number mb-8">02 — Ervaring</div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-accent-400" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">Werkervaring</h2>
                </div>
              </Reveal>
              <TimelineItem
                year="2020 — Heden"
                title="Videospecialist"
                company="Ledlease BV"
                description="Videospecialist bij Ledlease BV in Bodegraven."
              />
              <TimelineItem
                year="2025 — Heden"
                title="Stagiair Quality & Risk"
                company="Axians NL"
                description="Stagiair Quality & Risk bij Axians in Capelle aan den IJssel."
              />
              <TimelineItem
                year="2020 — 2025"
                title="Zeilinstructeur"
                company="RZV Gouda"
                description="Hoofdinstructeur van de RSFeva groep."
              />
            </div>

            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-accent-400" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">Opleiding</h2>
                </div>
              </Reveal>
              <TimelineItem
                year="2024 — Heden"
                title="Bachelor Technische Bedrijfskunde"
                company="Hogeschool Utrecht"
                description="Bachelor's degree in Technische Bedrijfskunde."
              />
              <TimelineItem
                year="2017 — 2023"
                title="Havo"
                company="Antoniuscollege Gouda"
                description="Middelbare School, Hoger algemeen voortgezet onderwijs."
              />
            </div>
          </div>
        </div>
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* Projects */}
      <Section className="py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="section-number mb-8">03 — Projecten</div>
          </Reveal>
          <Reveal>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-16">
              Geselecteerd <span className="gradient-text">werk</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={setSelectedProject}
                index={index}
              />
            ))}
          </div>
        </div>
      </Section>

      <Marquee text="FOTO'S • WERKZAAMHEDEN • BEHIND THE SCENES" reverse />

      {/* Work Gallery */}
      <Section className="py-16 md:py-24 !px-0 !max-w-none">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <Reveal>
            <div className="section-number mb-8">04 — Gallery</div>
          </Reveal>
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Foto's van mijn <span className="gradient-text">werkzaamheden</span>
            </h2>
          </Reveal>
          {!isMobile && (
            <Reveal delay={0.2}>
              <p className="text-muted mb-8 flex items-center gap-2 text-sm">
                <span className="inline-block px-2 py-1 bg-surface border border-surface-border rounded text-xs font-display font-medium text-accent-400">Pijltjestoetsen</span>
                om de auto te besturen en door de foto's te scrollen
              </p>
            </Reveal>
          )}
        </div>
        <WorkGallery scrollRef={galleryRef} />
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* Contact */}
      <Section className="py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="section-number mb-8">05 — Contact</div>
          </Reveal>
          <Reveal>
            <h2 className="font-display text-5xl md:text-[5.5rem] font-bold tracking-tight text-white leading-[1] mb-8">
              Laten we<br />
              <span className="gradient-text">samenwerken</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed mb-12 max-w-2xl">
              Heb je een project in gedachten of wil je gewoon hallo zeggen? Ik sta altijd open voor nieuwe uitdagingen.
            </p>
          </Reveal>

          <div className="flex flex-col sm:flex-row gap-4">
            <Reveal delay={0.3}>
              <a href="mailto:hello@quentinfabrie.nl" className="group flex items-center gap-3 px-6 py-3 bg-accent-500 text-white rounded-xl font-display font-bold text-sm hover:bg-accent-600 transition-all duration-300">
                <Mail className="w-4 h-4" />
                Email me
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </Reveal>
            <Reveal delay={0.4}>
              <a href="#" className="group flex items-center gap-3 px-6 py-3 bg-surface border border-surface-border text-white rounded-xl font-display font-medium text-sm hover:border-accent-400/30 transition-all duration-300">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Reveal>
            <Reveal delay={0.5}>
              <a href="#" className="group flex items-center gap-3 px-6 py-3 bg-surface border border-surface-border text-white rounded-xl font-display font-medium text-sm hover:border-accent-400/30 transition-all duration-300">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent-500 rounded-md flex items-center justify-center">
              <span className="font-display font-bold text-white text-[10px]">Q</span>
            </div>
            <span className="text-sm text-muted">&copy; 2025 Quentin Fabrie</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted hover:text-accent-400 transition-colors">GitHub</a>
            <a href="#" className="text-sm text-muted hover:text-accent-400 transition-colors">LinkedIn</a>
            <a href="mailto:hello@quentinfabrie.nl" className="text-sm text-muted hover:text-accent-400 transition-colors">Email</a>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence mode="wait">
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* Car Game */}
      <CarGame onUpdate={handleCarUpdate} />
    </div>
  );
}

export default App;
