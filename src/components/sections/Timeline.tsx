import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Briefcase, GraduationCap, Calendar, Smartphone } from "lucide-react";

const experiences = [
  {
    type: "work",
    title: "Senior Full Stack Developer",
    company: "Tech Innovations Inc.",
    period: "2022 - Present",
    description: "Leading development of web and mobile applications, mentoring team members, and implementing scalable architectures.",
    highlights: ["Team Lead", "React Native", "Flutter", "AWS"],
  },
  {
    type: "work",
    title: "Mobile App Developer",
    company: "AppCraft Studios",
    period: "2021 - 2022",
    description: "Developed cross-platform mobile applications using React Native and Flutter for clients across various industries.",
    highlights: ["React Native", "Flutter", "Firebase", "App Store"],
  },
  {
    type: "work",
    title: "Full Stack Developer",
    company: "Digital Solutions Ltd.",
    period: "2020 - 2021",
    description: "Built scalable web applications and RESTful APIs serving millions of users daily.",
    highlights: ["React", "Node.js", "PostgreSQL", "Docker"],
  },
  {
    type: "education",
    title: "Master's in Computer Science",
    company: "University of Technology",
    period: "2018 - 2020",
    description: "Specialized in Software Engineering and Mobile Computing. Graduated with distinction.",
    highlights: ["Mobile Dev", "Software Architecture", "Research"],
  },
  {
    type: "education",
    title: "Bachelor's in Information Technology",
    company: "State Technical University",
    period: "2014 - 2018",
    description: "Strong foundation in programming, databases, and mobile application development.",
    highlights: ["Java", "Android", "Web Development"],
  },
];

const TimelineItem = ({ item, index, isLeft }: { item: typeof experiences[0]; index: number; isLeft: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
      className={`flex items-center gap-3 sm:gap-4 md:gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
    >
      {/* Content Card */}
      <motion.div
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={`flex-1 p-4 sm:p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all border border-border ${
          isLeft ? "md:text-right" : "md:text-left"
        }`}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: index * 0.15 + 0.2 }}
          className={`flex items-center gap-2 mb-2 ${isLeft ? "md:justify-end" : "md:justify-start"}`}
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-xs sm:text-sm text-primary font-medium">{item.period}</span>
        </motion.div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1">{item.title}</h3>
        <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3">{item.company}</p>
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">{item.description}</p>
        <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
          {item.highlights.map((highlight, i) => (
            <motion.span
              key={highlight}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.15 + 0.3 + i * 0.05 }}
              className="px-2 py-0.5 sm:py-1 text-xs rounded-md bg-primary/10 text-primary"
            >
              {highlight}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Timeline Icon */}
      <div className="relative flex-shrink-0 hidden md:block">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.15 + 0.1, type: "spring" }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow z-10 relative"
        >
          {item.type === "work" ? (
            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          ) : (
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          )}
        </motion.div>
      </div>

      {/* Mobile Icon */}
      <div className="flex-shrink-0 md:hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"
        >
          {item.type === "work" ? (
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          ) : (
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          )}
        </motion.div>
      </div>

      {/* Spacer for alignment */}
      <div className="flex-1 hidden md:block" />
    </motion.div>
  );
};

export const Timeline = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-16 sm:py-20 lg:py-32" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Journey
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
          >
            Experience &{" "}
            <span className="text-primary">Education</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4"
          >
            A timeline of my professional journey in web and mobile development.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/30 hidden sm:block transform md:-translate-x-1/2 origin-top"
          />

          {/* Timeline Items */}
          <div className="space-y-6 sm:space-y-8 md:space-y-12 pl-12 sm:pl-16 md:pl-0">
            {experiences.map((item, index) => (
              <TimelineItem
                key={`${item.title}-${index}`}
                item={item}
                index={index}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
