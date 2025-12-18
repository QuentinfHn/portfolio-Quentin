import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, ExternalLink, X, Car } from 'lucide-react';
import CarGame from './components/CarGame';

// --- Image Loading Logic ---
// This automatically loads images from src/assets/projects/{id}/*.{jpg,png,etc}
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

// ...existing code...
const Background = () => (
  <div className="fixed inset-0 -z-10 bg-asphalt">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
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
    className={`py-20 md:py-32 flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto relative z-10 my-8 ${className}`}
  >
    {children}
  </motion.section>
);

const ProjectCard = ({ project, onClick }) => (
  <motion.div 
    layoutId={`card-container-${project.id}`}
    onClick={() => onClick(project)}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group relative bg-asphalt-light p-8 border border-white/10 hover:border-acid cursor-pointer overflow-hidden transition-colors"
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <motion.h3 layoutId={`project-title-${project.id}`} className="text-2xl font-display font-bold text-steel group-hover:text-acid transition-colors">
          {project.title}
        </motion.h3>
        <div className="p-2 bg-white/5 rounded-full group-hover:bg-acid group-hover:text-asphalt transition-all">
            <ExternalLink className="w-5 h-5 text-steel-dim group-hover:text-asphalt transition-colors" />
        </div>
      </div>
      
      <p className="text-steel-dim mb-6 leading-relaxed line-clamp-3 font-light">
        {project.description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag, index) => (
          <span key={index} className="px-3 py-1 bg-white/5 text-steel-dim text-sm font-medium border border-white/10 group-hover:border-acid/50 transition-colors">
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
        className="absolute inset-0 bg-asphalt/90 backdrop-blur-sm"
      />
      <motion.div 
        layoutId={`card-container-${project.id}`}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl bg-asphalt-light border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-acid hover:text-asphalt transition-colors z-10 rounded-full"
        >
          <X className="w-6 h-6 text-steel" />
        </motion.button>

        <div className="p-8 md:p-12 overflow-y-auto">
          <motion.h3 layoutId={`project-title-${project.id}`} className="text-3xl md:text-4xl font-display font-bold text-steel mb-4">{project.title}</motion.h3>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
          >
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-acid/10 text-acid text-sm border border-acid/20">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xl text-steel-dim mb-8 leading-relaxed font-light">
              {project.description}
            </p>

            <div className="prose prose-invert max-w-none">
              <h4 className="text-xl font-display font-semibold text-steel mb-4">Over dit project</h4>
              <p className="text-steel-dim leading-relaxed mb-8">
                {project.longDescription}
              </p>
              
              {project.images && project.images.length > 0 ? (
                <div className="grid gap-4">
                  {project.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Project screenshot ${idx + 1}`}
                      className="w-full object-cover border border-white/10"
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-64 bg-white/5 flex items-center justify-center text-steel-dim border border-dashed border-white/10">
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
    className="relative pl-8 pb-12 border-l border-white/10 last:pb-0 last:border-l-0"
  >
    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-asphalt border border-acid rounded-full" />
    <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-wider text-asphalt uppercase bg-acid">{year}</span>
    <h3 className="text-xl font-display font-bold text-steel mb-1">{title}</h3>
    <div className="text-steel-dim font-medium mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-acid" />
      {company}
    </div>
    <p className="text-steel-dim leading-relaxed font-light">{description}</p>
  </motion.div>
);

const WorkGallery = ({ scrollRef }) => {
  const images = useMemo(() => getWorkImages(), []);
  const localRef = useRef(null);
  const containerRef = scrollRef || localRef;
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
      
      // Initial position
      if (containerRef.current.scrollLeft === 0) {
          containerRef.current.scrollLeft = baseWidth;
      }
    };

    // Auto-scroll animation
    let animationFrameId;
    let scrollPos = 0;

    const animate = () => {
      if (!containerRef.current) return;
      
      // Sync with DOM if external change detected (e.g. Car Game)
      if (Math.abs(containerRef.current.scrollLeft - scrollPos) > 5) {
        scrollPos = containerRef.current.scrollLeft;
      }

      // Scroll speed (pixels per frame) - reduced to 0.5 for smoother/slower animation
      scrollPos += 0.5;
      containerRef.current.scrollLeft = scrollPos;

      const baseWidth = baseWidthRef.current;
      if (baseWidth > 0) {
        // Infinite scroll reset
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
    <div className="w-full py-10">
      <div
        ref={containerRef}
        className="flex overflow-x-hidden gap-6 px-6 md:px-20 pb-8"
        style={{ scrollBehavior: 'auto' }}
      >
        {loopImages.map((img, index) => (
          <motion.div 
            key={index}
            className="min-w-[80vw] max-w-[80vw] md:min-w-[640px] md:max-w-[640px] aspect-[4/3] overflow-hidden relative group flex-shrink-0 border border-white/10 bg-asphalt-light flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <img 
              src={img} 
              alt={`Work ${index + 1}`} 
              className="w-full h-full object-cover transition-all duration-500"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-asphalt/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const galleryRef = useRef(null);

  const handleCarUpdate = ({ x, y, velocity, rotation }) => {
    if (!galleryRef.current) return;

    const galleryRect = galleryRef.current.getBoundingClientRect();
    
    // Check if car is vertically within the gallery area
    // Reduced buffer to make it easier to "leave" the interaction zone
    if (y + 70 > galleryRect.top - 50 && y < galleryRect.bottom + 50) {
      // If car is moving horizontally, scroll the gallery
      // We use the horizontal component of the velocity
      const horizontalVelocity = Math.sin(rotation * Math.PI / 180) * velocity;
      
      if (Math.abs(horizontalVelocity) > 0.1) {
        // Scroll in the direction of movement
        // Reduced multiplier to prevent "too fast" scrolling
        galleryRef.current.scrollLeft += horizontalVelocity * 1.5; 
      }
    }
  };

  // Merge static data with dynamic images
  const projects = useMemo(() => {
    return PROJECTS_DATA.map(p => ({
      ...p,
      images: getImagesForProject(p.id)
    }));
  }, []);

  return (
    <div className="relative text-steel font-body selection:bg-acid selection:text-asphalt min-h-screen bg-asphalt">
      <Background />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-acid origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation (Floating Pill) */}
      <nav className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-6 px-6 py-3 bg-asphalt-light/80 backdrop-blur-md border border-white/10 hover:border-acid/50 transition-all duration-300">
          <span className="font-display font-bold tracking-tight text-steel">QUENTIN</span>
          <div className="w-px h-4 bg-white/10" />
          <a href="mailto:hello@quentinfabrie.nl" className="text-sm font-medium text-steel-dim hover:text-acid transition-colors">
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <Section className="relative min-h-screen">
        <div className="mb-8">
          <BigTextReveal 
            text="Quentin" 
            className="text-6xl md:text-9xl font-display font-bold tracking-tighter text-steel leading-none"
          />
          <BigTextReveal 
            text="Fabrie" 
            className="text-6xl md:text-9xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-acid-400 to-acid-600 leading-none"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-xl md:text-2xl text-steel-dim max-w-2xl font-light leading-relaxed">
            Ik ben een <span className="font-medium text-acid">Videospecialist</span>, die naast werk <span className="font-medium text-acid">Technische Bedrijfskunde</span> studeert in Utrecht.
          </p>
        </motion.div>
      </Section>


      {/* About Section */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8 text-steel">Over Mij</h2>
          </Reveal>
          <div>
            <Reveal delay={0.2}>
              <p className="text-lg md:text-xl text-steel-dim font-light leading-relaxed mb-6">
              Mijn interesse ligt bij videotechniek. Ik vind het leuk om nieuwe producten te testen en te ontdekken hoe ik ze in de praktijk kan toepassen. Naast mijn studie Technische Bedrijfskunde leer ik veel tijdens mijn stage bij Axians én in mijn werk bij Ledlease, waar ik theorie en praktijk dagelijks combineer.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="text-lg md:text-xl text-steel-dim font-light leading-relaxed">
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
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-8 text-steel">Werkervaring</h2>
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
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-8 text-steel">Opleiding</h2>
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
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-12 text-steel">Projecten</h2>
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
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4 text-steel">Foto's van mijn werkzaamheden</h2>
          </Reveal>
          {!isMobile && (
            <Reveal delay={0.2}>
              <p className="text-steel-dim mb-8 flex items-center gap-2">
                <span className="inline-block p-1 bg-white/10 rounded text-xs font-mono text-acid">Pijltjestoetsen</span>
                om de auto te besturen en door de foto's te scrollen!
              </p>
            </Reveal>
          )}
        </div>
        <WorkGallery scrollRef={galleryRef} />
      </Section>

      {/* Contact Section */}
      <Section>
        <div className="max-w-4xl">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8 text-steel">Laten we samenwerken</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl md:text-3xl text-steel-dim font-light leading-relaxed mb-10">
              Heb je een project in gedachten of wil je gewoon hallo zeggen? Ik sta altijd open voor nieuwe uitdagingen.
            </p>
          </Reveal>
          
          <div className="flex gap-8">
            <Reveal delay={0.4}>
              <a href="#" className="flex items-center gap-2 text-lg text-steel-dim hover:text-acid transition-colors">
                <Mail className="w-5 h-5" /> Email
              </a>
            </Reveal>
            <Reveal delay={0.5}>
              <a href="#" className="flex items-center gap-2 text-lg text-steel-dim hover:text-acid transition-colors">
                <Github className="w-5 h-5" /> GitHub
              </a>
            </Reveal>
            <Reveal delay={0.6}>
              <a href="#" className="flex items-center gap-2 text-lg text-steel-dim hover:text-acid transition-colors">
                <Linkedin className="w-5 h-5" /> LinkedIn
              </a>
            </Reveal>
          </div>
        </div>
      </Section>

      <footer className="py-8 text-center text-steel-dim text-sm">
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
      <CarGame onUpdate={handleCarUpdate} />
    </div>
  );
}
// ...existing code...

export default App;
