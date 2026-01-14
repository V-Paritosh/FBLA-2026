"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  BookOpen,
  Shield,
  Database,
  Brain,
  Zap,
  Users,
  Rocket,
  ArrowRight,
  Github,
  Twitter,
  Mail,
  CloudLightning as Lightning,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const topics = [
  {
    icon: Code2,
    label: "Programming",
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: BookOpen,
    label: "Web Dev",
    color: "text-secondary",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Shield,
    label: "Cybersecurity",
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Database,
    label: "Databases",
    color: "text-secondary",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Brain,
    label: "Machine Learning",
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Zap,
    label: "Algorithms",
    color: "text-secondary",
    gradient: "from-secondary/20 to-secondary/5",
  },
];

const features = [
  {
    icon: Users,
    title: "Live Tutoring",
    description: "Schedule and join live study sessions with peers and mentors",
    stats: "500+ Sessions",
  },
  {
    icon: Rocket,
    title: "Smart Dashboard",
    description:
      "Track progress, manage projects, and visualize your learning journey",
    stats: "Real-time Sync",
  },
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    description: "Learn from curated courses, quizzes, and hands-on projects",
    stats: "150+ Lessons",
  },
  {
    icon: Users,
    title: "Peer Learning",
    description: "Collaborate with other students and build your network",
    stats: "5000+ Community",
  },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "Student",
    quote:
      "CodeNode helped me ace my CS fundamentals course. The structured learning path is amazing!",
    avatar: "AC",
  },
  {
    name: "Jordan Smith",
    role: "Learner",
    quote:
      "The best part? Real tutoring from people who actually understand what we're learning.",
    avatar: "JS",
  },
  {
    name: "Casey Rodriguez",
    role: "Student",
    quote:
      "I went from struggling to excelling. This platform made all the difference.",
    avatar: "CR",
  },
];

const stats = [
  { number: "10K+", label: "Active Students" },
  { number: "500+", label: "Learning Sessions" },
  { number: "1.5M+", label: "XP Earned" },
  { number: "98%", label: "Success Rate" },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-background">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Welcome to the Future of Learning
              </span>
            </motion.div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-foreground tracking-tight">
              Master Computer
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Science Together
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A student-built learning hub for coding, problem-solving, and peer
              collaboration. Join thousands mastering CS fundamentals, web
              development, cybersecurity, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary/50 group"
              >
                Get Started{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-card text-foreground border border-border hover:bg-muted px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Enhanced Hero Graphic */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-24 relative h-96 overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent"></div>
            <div className="absolute inset-0 opacity-30">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 400"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern
                    id="circuit"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x="5"
                      y="5"
                      width="30"
                      height="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      opacity="0.4"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="2.5"
                      fill="currentColor"
                      opacity="0.6"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="2.5"
                      fill="currentColor"
                      opacity="0.6"
                    />
                    <line
                      x1="10"
                      y1="10"
                      x2="30"
                      y2="30"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                <rect
                  width="400"
                  height="400"
                  fill="url(#circuit)"
                  className="text-primary"
                />
              </svg>
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
              className="absolute top-8 left-8 bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightning className="w-5 h-5 text-primary" />
                <p className="font-semibold text-sm text-foreground">
                  Fast Learning Path
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Personalized to your pace
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
              className="absolute bottom-12 right-8 bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-secondary" />
                <p className="font-semibold text-sm text-foreground">
                  Earn XP & Badges
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Gamified learning rewards
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 15, 0] }}
              transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY }}
              className="absolute top-1/2 left-1/3 bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="font-semibold text-sm text-foreground">
                  Live Progress
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Track every achievement
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -8,
                  }}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Topics Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground text-center mb-12">
              What You'll Learn
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {topics.map((topic, index) => {
                const Icon = topic.icon;
                return (
                  <motion.div
                    key={topic.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.01 }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -8,
                    }}
                    className={`bg-gradient-to-br ${topic.gradient} border border-border rounded-xl p-6 text-center hover:border-primary/40 transition-all cursor-pointer group`}
                  >
                    <Icon
                      className={`w-8 h-8 ${topic.color} mx-auto mb-3 group-hover:scale-110 transition-transform`}
                    />
                    <h3 className="font-semibold text-foreground">
                      {topic.label}
                    </h3>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground text-center mb-12">
              Why Choose CodeNode?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-card border border-border rounded-xl p-8 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {feature.description}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {feature.stats}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground text-center mb-12">
              What Students Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
              className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />

            <div className="relative p-12 text-center text-primary-foreground">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of students mastering CS together
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-primary hover:bg-opacity-90 px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg group"
              >
                Get Started Now{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
}
