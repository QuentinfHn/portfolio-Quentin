import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, ExternalLink, X } from 'lucide-react';

// --- Image Loading Logic ---
// This automatically loads images from src/assets/projects/{id}/*.{jpg,png,etc}
const projectImagesGlob = import.meta.glob([
  './assets/projects/**/*.{png,jpg,jpeg,webp,svg}',
  './assets/projects/**/*.{PNG,JPG,JPEG,WEBP,SVG}'
], { eager: true, as: 'url' });

const workImagesGlob = import.meta.glob([
  './assets/work-photos/*.png', './assets/work-photos/*.PNG',
  './assets/work-photos/*.jpg', './assets/work-photos/*.JPG',
  './assets/work-photos/*.jpeg', './assets/work-photos/*.JPEG',
  './assets/work-photos/*.webp', './assets/work-photos/*.WEBP',
  './assets/work-photos/*.svg', './assets/work-photos/*.SVG'
], { eager: true, as: 'url' });

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

const getWorkImages = () => {
  return Object.values(workImagesGlob);
};

// --- Configuration ---
const PROJECTS_DATA = [
  {
    id: 1,
    title: "Signing Awakenings Summerfestival 2025",
    description: "10 signing LED torens aangestuurd vanaf een centraal punt met behulp van NDI",
    longDescription: "Voor dit project was ik verantwoordelijk voor het instellen en configureren van de tien LED-torens en het volledige NDI-netwerk. Ik zorgde ervoor dat alle schermen centraal en betrouwbaar aangestuurd konden worden, inclusief een stabiele verbinding met Resolume en Novastar voor realtime contentbeheer.",
    tags: ["NDI", "Resolume", "Novastar", "Signing"],
  },
  {
    id: 2,
    title: "Portfolio 2024",
    description: "Mijn vorige portfolio website, genomineerd voor diverse design awards vanwege de unieke navigatie.",
    longDescription: "Een experimenteel project waarbij ik de grenzen van webanimaties heb opgezocht. Met behulp van WebGL en GSAP heb ik een unieke, vloeiende navigatie-ervaring gecreëerd die de gebruiker meeneemt op een reis door mijn werk. De focus lag op interactie en visuele impact.",
    tags: ["Vue.js", "GSAP", "WebGL"],
  },
  {
    id: 3,
    title: "Task Manager App",
    description: "Een minimalistische to-do applicatie met focus op deep work en productiviteit.",
    longDescription: "Deze applicatie is gebouwd om gebruikers te helpen hun focus te behouden. Het minimalistische design verwijdert alle afleidingen. Features zijn onder andere een Pomodoro timer, taakprioritering en gedetailleerde statistieken over productiviteit.",
    tags: ["React Native", "Firebase", "TypeScript"],
  },
  {
    id: 4,
    title: "Dashboard Analytics",
    description: "Real-time data visualisatie dashboard voor SaaS bedrijven.",
    longDescription: "Een krachtig dashboard dat complexe datasets omzet in begrijpelijke visualisaties. Gebruikers kunnen real-time trends volgen, rapporten genereren en diep in de data duiken. Gebouwd met D3.js voor maximale flexibiliteit in grafieken.",
    tags: ["D3.js", "React", "Node.js"],
  }
];

const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50">
    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-400/30 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
    <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-400/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-pink-400/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.svg')] opacity-20 mix-blend-overlay"></div>
  </div>
);

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } }
    }}
  >
    {children}
  </motion.div>
);

const Section = ({ children, className = "" }) => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-10%" }}
    variants={{
      visible: { transition: { staggerChildren: 0.1 } }
    }}
    className={`py-20 md:py-32 flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto relative z-10 rounded-3xl my-8 ${className}`}
  >
    {children}
  </motion.section>
);

const ProjectCard = ({ project, onClick }) => (
  <motion.div 
    layoutId={`card-container-${project.id}`}
    onClick={() => onClick(project)}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm hover:shadow-xl border border-white/50 hover:border-primary-200 cursor-pointer overflow-hidden transition-all"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-accent-50/30 opacity-100 transition-opacity duration-500" />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <motion.h3 layoutId={`project-title-${project.id}`} className="text-2xl font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
          {project.title}
        </motion.h3>
        <div className="p-2 bg-white/50 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
        </div>
      </div>
      
      <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
        {project.description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag, index) => (
          <span key={index} className="px-3 py-1 bg-white/60 text-slate-600 text-sm font-medium rounded-full border border-white/50 group-hover:border-primary-200 group-hover:bg-white/90 transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        layoutId={`card-container-${project.id}`}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-6 h-6 text-slate-600" />
        </motion.button>

        <div className="p-8 md:p-12 overflow-y-auto">
          <motion.h3 layoutId={`project-title-${project.id}`} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{project.title}</motion.h3>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
          >
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-100">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              {project.description}
            </p>

            <div className="prose prose-slate max-w-none">
              <h4 className="text-xl font-semibold text-slate-800 mb-4">Over dit project</h4>
              <p className="text-slate-600 leading-relaxed mb-8">
                {project.longDescription}
              </p>
              
              {project.images && project.images.length > 0 ? (
                <div className="grid gap-4">
                  {project.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Project screenshot ${idx + 1}`}
                      className="rounded-xl w-full object-cover shadow-md"
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-64 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                  Nog geen afbeeldingen beschikbaar
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const BigTextReveal = ({ text, className = "" }) => {
  return (
    <div className={`flex overflow-hidden ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{
            duration: 1,
            delay: i * 0.03,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
};

const TimelineItem = ({ year, title, company, description }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
    }}
    className="relative pl-8 pb-12 border-l-2 border-primary-100 last:pb-0 last:border-l-0"
  >
    <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-4 border-primary-500 rounded-full shadow-sm" />
    <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-wider text-primary-700 uppercase bg-primary-50 rounded-full">{year}</span>
    <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
    <div className="text-slate-500 font-medium mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
      {company}
    </div>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
);

const WorkGallery = () => {
  const images = useMemo(() => getWorkImages(), []);
  const containerRef = useRef(null);
  const baseWidthRef = useRef(0);

  // Fallback placeholders if no images are found
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
      containerRef.current.scrollLeft = baseWidth;
    };

    const handleScroll = () => {
      const containerEl = containerRef.current;
      const baseWidth = baseWidthRef.current;
      if (!containerEl || !baseWidth) return;

      const left = containerEl.scrollLeft;
      if (left <= baseWidth * 0.1) {
        containerEl.scrollLeft = left + baseWidth;
      } else if (left >= baseWidth * 2.9) {
        containerEl.scrollLeft = left - baseWidth;
      }
    };

    setBaseWidth();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', setBaseWidth);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', setBaseWidth);
    };
  }, [loopImages.length]);

  return (
    <div className="w-full py-10">
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-6 px-6 md:px-20 pb-8 snap-x snap-mandatory hide-scrollbar"
      >
        {loopImages.map((img, index) => (
          <motion.div 
            key={index}
            className="min-w-[80vw] max-w-[80vw] md:min-w-[640px] md:max-w-[640px] aspect-[4/3] rounded-3xl overflow-hidden shadow-lg relative group snap-center flex-shrink-0 border border-white/50 bg-slate-200 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <img 
              src={img} 
              alt={`Work ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center gap-2 mt-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-white/40 px-4 py-2 rounded-full backdrop-blur-sm">
           <ArrowDown className="w-4 h-4 rotate-[-90deg]" /> Swipe voor meer
        </div>
      </div>
    </div>
  );
};

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Merge static data with dynamic images
  const projects = useMemo(() => {
    return PROJECTS_DATA.map(p => ({
      ...p,
      images: getImagesForProject(p.id)
    }));
  }, []);

  return (
    <div className="text-slate-900 font-sans selection:bg-primary-200 selection:text-primary-900 min-h-screen">
      <Background />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation (Floating Pill) */}
      <nav className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-6 px-6 py-3 bg-white/30 backdrop-blur-md rounded-full shadow-sm border border-white/40 hover:bg-white/50 transition-all duration-300">
          <span className="font-bold tracking-tight text-slate-900">QUENTIN</span>
          <div className="w-px h-4 bg-slate-900/10" />
          <a href="mailto:contact@example.com" className="text-sm font-medium text-slate-700 hover:text-primary-700 transition-colors">
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <Section className="relative min-h-screen">
        <div className="mb-8">
          <BigTextReveal 
            text="Quentin" 
            className="text-6xl md:text-9xl font-bold tracking-tighter text-slate-900 leading-none"
          />
          <BigTextReveal 
            text="Fabrie" 
            className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 leading-none"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl font-light leading-relaxed">
            Ik ben een <span className="font-medium text-slate-900">Videospecialist</span>, die naast werk <span className="font-medium text-slate-900">Technische Bedrijfskunde</span> studeert in Utrecht.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ArrowDown className="w-6 h-6 text-slate-400" />
        </motion.div>
      </Section>


      {/* About Section */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-slate-900">Over Mij</h2>
          </Reveal>
          <div>
            <Reveal delay={0.2}>
              <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed mb-6">
              Mijn interesse ligt bij videotechniek. Ik vind het leuk om nieuwe producten te testen en te ontdekken hoe ik ze in de praktijk kan toepassen. Naast mijn studie Technische Bedrijfskunde leer ik veel tijdens mijn stage bij Axians én in mijn werk bij Ledlease, waar ik theorie en praktijk dagelijks combineer.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
              Met een passie voor techniek en verbetering zoek ik steeds naar slimme, praktische oplossingen.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Experience & Education Section */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-slate-900">Ervaring</h2>
            </Reveal>
            <div className="space-y-0">
              <TimelineItem 
                year="Jan 2020 - Heden"
                title="Videospecialist"
                company="Ledlease BV"
                description="Videospecialist bij Ledlease BV in Bodegraven."
              />
              <TimelineItem 
                year="Sep 2025 - Heden"
                title="Stagiair Quality & Risk"
                company="Axians NL"
                description="Stagiair Quality & Risk bij Axians in Capelle aan den IJssel."
              />
              <TimelineItem 
                year="Aug 2020 - Mei 2025"
                title="Zeilinstructeur"
                company="Roei- & Zeilvereniging 'Gouda'"
                description="Hoofdinstructeur van de RSFeva groep."
              />
            </div>
          </div>
          
          <div>
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-slate-900">Opleiding</h2>
            </Reveal>
            <div className="space-y-0">
              <TimelineItem 
                year="Sep 2024 - Heden"
                title="Bachelor Technische Bedrijfskunde"
                company="Hogeschool Utrecht"
                description="Bachelor's degree in Technische Bedrijfskunde."
              />
              <TimelineItem 
                year="Aug 2017 - Jul 2023"
                title="Havo"
                company="Antoniuscollege Gouda"
                description="Middelbare School, Hoger algemeen voortgezet onderwijs."
              />
            </div>
          </div>
        </div>
      </Section>



      {/* Projects Section */}
      <Section>
        <Reveal>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-12 text-slate-900">Projecten</h2>
        </Reveal>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              onClick={setSelectedProject}
            />
          ))}
        </div>
      </Section>

      {/* Work Gallery Section */}
      <Section className="!px-0 !max-w-none">
        <div className="px-6 md:px-20 max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-12 text-slate-900">Foto's van mijn werkzaamheden</h2>
          </Reveal>
        </div>
        <WorkGallery />
      </Section>

      {/* Contact Section */}
      <Section>
        <div className="max-w-4xl">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-slate-900">Laten we samenwerken</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl md:text-3xl text-slate-600 font-light leading-relaxed mb-10">
              Heb je een project in gedachten of wil je gewoon hallo zeggen? Ik sta altijd open voor nieuwe uitdagingen.
            </p>
          </Reveal>
          
          <div className="flex gap-8">
            <Reveal delay={0.4}>
              <a href="#" className="flex items-center gap-2 text-lg text-slate-600 hover:text-primary-600 transition-colors">
                <Mail className="w-5 h-5" /> Email
              </a>
            </Reveal>
            <Reveal delay={0.5}>
              <a href="#" className="flex items-center gap-2 text-lg text-slate-600 hover:text-primary-600 transition-colors">
                <Github className="w-5 h-5" /> GitHub
              </a>
            </Reveal>
            <Reveal delay={0.6}>
              <a href="#" className="flex items-center gap-2 text-lg text-slate-600 hover:text-primary-600 transition-colors">
                <Linkedin className="w-5 h-5" /> LinkedIn
              </a>
            </Reveal>
          </div>
        </div>
      </Section>

      <footer className="py-8 text-center text-slate-400 text-sm">
        &copy; 2025 Quentin. Alle rechten voorbehouden.
      </footer>

      <AnimatePresence mode="wait">
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
