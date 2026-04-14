import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const skills = [
  { name: "React / Next.js", level: 95, category: "Frontend", color: "from-primary to-info" },
  { name: "React Native", level: 90, category: "Mobile", color: "from-info to-primary" },
  { name: "Flutter / Dart", level: 85, category: "Mobile", color: "from-primary to-info" },
  { name: "TypeScript", level: 92, category: "Language", color: "from-info to-primary" },
  { name: "Node.js / Express", level: 85, category: "Backend", color: "from-primary to-info" },
  { name: "PostgreSQL / MongoDB", level: 88, category: "Database", color: "from-info to-primary" },
  { name: "Tailwind CSS", level: 95, category: "Styling", color: "from-primary to-info" },
  { name: "Docker / AWS", level: 75, category: "DevOps", color: "from-info to-primary" },
];

const technologies = [
  "JavaScript", "TypeScript", "React", "Next.js", "React Native", "Flutter",
  "Dart", "Node.js", "Python", "PostgreSQL", "MongoDB", "Firebase",
  "Redis", "Docker", "AWS", "Git", "Figma", "Tailwind CSS",
];

const SkillBar = ({ name, level, category, index, color }: { name: string; level: number; category: string; index: number; color: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setCurrentLevel(prev => {
            if (prev >= level) {
              clearInterval(interval);
              return level;
            }
            return prev + 1;
          });
        }, 15);
        return () => clearInterval(interval);
      }, index * 100);
      return () => clearTimeout(timer);
    }
  }, [isInView, level, index]);

  return (
    <motion.div 
      ref={ref} 
      className="mb-5"
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{name}</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">
            {category}
          </span>
        </div>
        <span className="text-primary font-bold text-sm tabular-nums">{currentLevel}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.2, delay: index * 0.1, ease: "easeOut" }}
          className={`h-full rounded-full relative bg-gradient-to-r ${color}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-16 sm:py-20 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 gradient-mesh" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            My Skills
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
          >
            Technical <span className=" text-primary">Expertise</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Comprehensive skills in web, mobile, and cross-platform development
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass p-6 rounded-2xl"
          >
            <h3 className="text-lg font-semibold mb-6">Core Competencies</h3>
            {skills.map((skill, index) => (
              <SkillBar key={skill.name} {...skill} index={index} />
            ))}
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass p-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold mb-6">Technologies I Work With</h3>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, index) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.02 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium cursor-default transition-all border border-border hover:border-primary/30 hover:bg-primary/5"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-6 rounded-2xl gradient-primary text-primary-foreground flex-1"
            >
              <h4 className="font-bold mb-2 text-lg">Mobile Development</h4>
              <p className="text-primary-foreground/85 text-sm leading-relaxed mb-4">
                Specialized in building cross-platform mobile applications using 
                React Native and Flutter for seamless iOS and Android experiences.
              </p>
              <div className="flex flex-wrap gap-2">
                {["React Native", "Flutter", "iOS", "Android"].map((tech) => (
                  <span key={tech} className="px-3 py-1 text-xs rounded-full bg-primary-foreground/15 text-primary-foreground font-medium backdrop-blur-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
