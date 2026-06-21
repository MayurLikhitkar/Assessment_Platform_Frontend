import { useState, useEffect } from "react";
import {
    RiShieldCheckLine, RiCodeBoxLine, RiTimeLine, RiBarChartBoxLine, RiUserStarLine, RiLockPasswordLine, RiArrowRightLine, RiCheckLine, RiMenuLine, RiCloseLine, RiStarFill, RiGlobalLine, RiBrainLine, RiTeamLine, RiFileTextLine, RiEyeLine, RiRocketLine, RiArrowDownLine, RiMailLine, RiPhoneLine, RiMapPinLine, RiPlayCircleLine, RiMedalLine, RiSpeedUpLine, RiPieChartLine,
    RiLineChartLine,
} from "react-icons/ri";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import Container from "../../components/common/Container";

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    // const links = ["Features", "How It Works", "Pricing", "Testimonials"];
    const links = ["Features", "How It Works", "Testimonials"];

    const scrollTo = (id: string) => {
        document.getElementById(id.toLowerCase().replace(/\s+/g, "-"))?.scrollIntoView({ behavior: "smooth" });
        setMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-999 ${scrolled ? "backdrop-blur-lg bg-muted-light/60 border-b border-border-light/10 shadow-md" : "bg-transparent"
                }`}>
            <Container className="flex items-center justify-between py-5">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-primary-main rounded-lg flex items-center justify-center animate-pulse-glow">
                        <RiBrainLine className="text-text-inverse text-lg" />
                    </div>
                    <span className="text-xl font-bold text-text-main tracking-tight">
                        AssessHub
                    </span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <Button variant="text"
                            key={link}
                            onClick={() => scrollTo(link)}>
                            {link}
                        </Button>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <Button variant="text">
                        <Link to="login">Log In</Link>
                    </Button>
                    <Button className="">
                        <Link to="register">Get Started</Link>
                    </Button>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-text-main text-2xl p-1"
                >
                    {menuOpen ? <RiCloseLine /> : <RiMenuLine />}
                </button>
            </Container>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden glass border-b border-border-light px-4 pb-4 flex flex-col gap-3">
                    {links.map((link) => (
                        <button
                            key={link}
                            onClick={() => scrollTo(link)}
                            className="text-sm font-medium text-text-light hover:text-primary-main py-2 text-left cursor-pointer"
                        >
                            {link}
                        </button>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <Button variant="text" className="flex-1 border border-border-main">
                            <Link to="login">Log In</Link>
                        </Button>
                        <Button className="flex-1">
                            <Link to="register">Get Started</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}

/* ─────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────── */
function HeroSection() {
    return (
        <section className="relative min-h-screen bg-background-main hero-grid flex flex-col items-center justify-center overflow-hidden pt-16">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 py-15    ">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-primary-main/10 border border-primary-main/20 text-primary-main px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-slide-up">
                        <RiRocketLine className="text-base" />
                        <span>Next-Gen Assessment Platform</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-main leading-tight mb-6 animate-slide-up-delay">
                        Evaluate Talent with{" "}
                        <span className="gradient-text">Precision</span>{" "}
                        &amp; Confidence
                    </h1>

                    <p className="text-lg text-text-light leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up-delay-2">
                        AssessHub empowers organizations to create, manage, and analyze
                        assessments — from coding challenges to MCQs — with built-in
                        proctoring and real-time analytics.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up-delay-3">
                        <Button className="flex items-center justify-center gap-2 bg-primary-main text-text-inverse font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary-main/30 hover:shadow-primary-main/50 hover:-translate-y-0.5">
                            Start Free Trial
                            <RiArrowRightLine />
                        </Button>
                        <Button variant="outline" className="border-border-main px-8 py-3.5 rounded-xl hover:border-primary-main hover:text-primary-main transition-all duration-200 bg-background-light!">
                            <RiPlayCircleLine className="text-primary-main text-lg" />
                            Watch Demo
                        </Button>
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start flex-wrap">
                        {["No credit card", "14-day free trial", "Cancel anytime"].map((t) => (
                            <div key={t} className="flex items-center gap-1.5 text-sm text-text-light">
                                <RiCheckLine className="text-success-main font-bold" />
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — Dashboard Mockup */}
                <div className="flex-1 w-full max-w-lg lg:max-w-none">
                    <DashboardMockup />
                </div>
            </div>
        </section>
    );
}

/* Dashboard mockup card */
function DashboardMockup() {
    return (
        <div className="relative animate-float">
            {/* Main card */}
            <div className="bg-background-inverse rounded-2xl shadow-2xl p-5 border border-dark-main">
                {/* Header bar */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-error-main" />
                    <div className="w-3 h-3 rounded-full bg-warn-main" />
                    <div className="w-3 h-3 rounded-full bg-success-main" />
                    <div className="ml-3 flex-1 bg-dark-main rounded px-3 py-1 text-xs text-text-inverse/40 font-mono">
                        assesshub.io/app/assessments
                    </div>
                </div>

                {/* Sidebar + content */}
                <div className="flex gap-3">
                    {/* Mini sidebar */}
                    <div className="w-10 flex flex-col gap-3 items-center py-2">
                        {[RiBarChartBoxLine, RiFileTextLine, RiTeamLine, RiShieldCheckLine].map((Icon, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${i === 0 ? "bg-primary-main text-text-inverse" : "bg-dark-main text-text-inverse/50"
                                    }`}
                            >
                                <Icon />
                            </div>
                        ))}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: "Assessments", value: "48", color: "text-primary-main" },
                                { label: "Candidates", value: "1.2k", color: "text-secondary-main" },
                                { label: "Avg Score", value: "74%", color: "text-success-main" },
                            ].map((s) => (
                                <div key={s.label} className="bg-dark-main rounded-lg p-2">
                                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                                    <div className="text-[10px] text-text-inverse/50">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Assessment list */}
                        <div className="bg-dark-main rounded-lg p-2 space-y-2">
                            {[
                                { name: "React Developer Test", score: 82, status: "Live" },
                                { name: "Data Structures Quiz", score: 67, status: "Draft" },
                                { name: "System Design Round", score: 91, status: "Live" },
                            ].map((a) => (
                                <div key={a.name} className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <div className="text-xs text-text-inverse/80 font-medium truncate">{a.name}</div>
                                        <div className="h-1.5 bg-dark-light rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-primary-main rounded-full"
                                                style={{ width: `${a.score}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${a.status === "Live"
                                            ? "bg-success-main/20 text-success-main"
                                            : "bg-warn-main/20 text-warn-main"
                                            }`}
                                    >
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating badge 1 */}
            <div className="absolute -top-4 -right-4 glass border border-border-light rounded-xl px-3 py-2 shadow-lg animate-float-delay">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-success-main/20 rounded-lg flex items-center justify-center">
                        <RiShieldCheckLine className="text-success-main text-sm" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-text-main">Proctored</div>
                        <div className="text-[10px] text-text-light">AI-monitored</div>
                    </div>
                </div>
            </div>

            {/* Floating badge 2 */}
            <div className="absolute -bottom-4 -left-4 glass border border-border-light rounded-xl px-3 py-2 shadow-lg animate-float-delay-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-main/20 rounded-lg flex items-center justify-center">
                        <RiSpeedUpLine className="text-primary-main text-sm" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-text-main">Real-time</div>
                        <div className="text-[10px] text-text-light">Live scoring</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   STATS BANNER
───────────────────────────────────────────── */
function StatsBanner() {
    const stats = [
        { value: "3x Faster", label: "Candidate Screening", icon: RiTimeLine },
        { value: "92%", label: "Hiring Accuracy Improvement", icon: RiLineChartLine },
        { value: "99.2%", label: "Platform Uptime", icon: RiShieldCheckLine },
        { value: "4.9", label: "Average Rating", icon: RiStarFill },
    ];

    return (
        <section className="bg-background-inverse py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center animate-count-up">
                            <div className="flex items-center justify-center mb-2">
                                <s.icon className="text-primary-main text-2xl" />
                            </div>
                            <div className="text-3xl font-bold text-text-inverse mb-1">{s.value}</div>
                            <div className="text-sm text-text-inverse/50">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FEATURES SECTION
───────────────────────────────────────────── */
function FeaturesSection() {
    const features = [
        {
            icon: RiCodeBoxLine,
            color: "bg-accent-main/10 text-accent-main",
            title: "Code Assessments",
            desc: "Run live coding challenges in 20+ languages with real-time execution, test cases, and automated grading.",
        },
        {
            icon: RiShieldCheckLine,
            color: "bg-success-main/10 text-success-main",
            title: "AI Proctoring",
            desc: "Tab-switch detection, fullscreen enforcement, and behavioral analysis keep your assessments cheat-proof.",
        },
        {
            icon: RiBarChartBoxLine,
            color: "bg-secondary-main/10 text-secondary-main",
            title: "Deep Analytics",
            desc: "Visualize performance trends, question difficulty curves, and candidate comparisons on one dashboard.",
        },
        {
            icon: RiTimeLine,
            color: "bg-warn-main/10 text-warn-main",
            title: "Timed Exams",
            desc: "Set per-question or overall time limits. Auto-submit when time expires — fully configurable.",
        },
        {
            icon: RiUserStarLine,
            color: "bg-primary-main/10 text-primary-main",
            title: "Role-Based Access",
            desc: "Super Admin, Admin, Evaluator, and Proctor roles — each with tailored permissions and views.",
        },
        {
            icon: RiLockPasswordLine,
            color: "bg-error-main/10 text-error-main",
            title: "Secure Sessions",
            desc: "JWT-based auth, session management, and encrypted data storage ensure candidate privacy at all times.",
        },
        {
            icon: RiGlobalLine,
            color: "bg-accent-dark/10 text-accent-main",
            title: "Multi-format Questions",
            desc: "MCQ, multi-select, fill-in-the-blank, code, and descriptive — mix types in a single assessment.",
        },
        {
            icon: RiPieChartLine,
            color: "bg-success-dark/10 text-success-main",
            title: "Instant Reports",
            desc: "Auto-generated PDF reports for each candidate delivered right after submission — zero manual effort.",
        },
    ];

    return (
        <section id="features" className="py-24 bg-background-main">
            <Container>
                {/* Heading */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-primary-main text-sm font-semibold tracking-widest uppercase mb-3">
                        Platform Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
                        Everything you need to{" "}
                        <span className="gradient-text">assess smarter</span>
                    </h2>
                    <p className="text-text-light leading-relaxed">
                        A complete toolkit built for HR teams, engineering managers, and educators
                        who demand accuracy, fairness, and efficiency.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="bg-background-light border border-border-light rounded-2xl p-6 card-hover group cursor-pointer"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${f.color}`}>
                                <f.icon />
                            </div>
                            <h3 className="text-base font-semibold text-text-main mb-2 group-hover:text-primary-main transition-colors">
                                {f.title}
                            </h3>
                            <p className="text-sm text-text-light leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            icon: RiFileTextLine,
            title: "Create Your Assessment",
            desc: "Use the drag-and-drop builder to add questions, set time limits, configure difficulty levels, and assign categories.",
        },
        {
            number: "02",
            icon: RiTeamLine,
            title: "Invite Candidates",
            desc: "Share a secure link or invite via email. Candidates get a clean, distraction-free exam interface.",
        },
        {
            number: "03",
            icon: RiEyeLine,
            title: "Monitor in Real-time",
            desc: "Proctors watch live sessions. AI flags suspicious activity. Admins get instant alerts on violations.",
        },
        {
            number: "04",
            icon: RiMedalLine,
            title: "Review & Decide",
            desc: "Access detailed score breakdowns, time-per-question stats, and AI-generated recommendations.",
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-primary-main text-sm font-semibold tracking-widest uppercase mb-3">
                        How It Works
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
                        Up and running in{" "}
                        <span className="gradient-text">4 simple steps</span>
                    </h2>
                    <p className="text-text-light">
                        From setup to results in minutes, not days.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connector line */}
                    <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border-main to-transparent" />

                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center text-center relative">
                            <div className="relative z-10 w-20 h-20 rounded-2xl bg-background-light border-2 border-primary-main/20 flex flex-col items-center justify-center mb-5 shadow-lg">
                                <s.icon className="text-primary-main text-2xl mb-0.5" />
                                <span className="text-[10px] font-bold text-primary-main/60">{s.number}</span>
                            </div>
                            <h3 className="text-base font-semibold text-text-main mb-2">{s.title}</h3>
                            <p className="text-sm text-text-light leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   PRICING SECTION
───────────────────────────────────────────── */
function PricingSection() {
    const [annual, setAnnual] = useState(false);

    const plans = [
        {
            name: "Starter",
            price: annual ? 19 : 29,
            desc: "Perfect for small teams and startups exploring structured hiring.",
            features: [
                "Up to 50 assessments/mo",
                "5 team members",
                "MCQ & code questions",
                "Basic analytics",
                "Email support",
            ],
            cta: "Get Started",
            highlight: false,
        },
        {
            name: "Professional",
            price: annual ? 59 : 79,
            desc: "For growing teams that need advanced proctoring and deeper insights.",
            features: [
                "Unlimited assessments",
                "25 team members",
                "All question types",
                "AI proctoring",
                "Advanced analytics",
                "Priority support",
                "Custom branding",
            ],
            cta: "Start Free Trial",
            highlight: true,
        },
        {
            name: "Enterprise",
            price: null,
            desc: "Tailored solutions with dedicated support for large organizations.",
            features: [
                "Everything in Pro",
                "Unlimited members",
                "SSO & SAML",
                "Custom integrations",
                "SLA guarantee",
                "Dedicated CSM",
                "On-premise option",
            ],
            cta: "Contact Sales",
            highlight: false,
        },
    ];

    return (
        <section id="pricing" className="py-24 bg-background-main">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="inline-block text-primary-main text-sm font-semibold tracking-widest uppercase mb-3">
                        Pricing
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
                        Simple,{" "}
                        <span className="gradient-text">transparent</span> pricing
                    </h2>
                    <p className="text-text-light mb-6">No hidden fees. Cancel anytime.</p>

                    {/* Toggle */}
                    <div className="inline-flex items-center gap-3 bg-muted-light border border-border-light rounded-full px-2 py-1.5">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${!annual ? "bg-background-light shadow text-text-main" : "text-text-light"}`}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setAnnual(!annual)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${annual ? "bg-primary-main" : "bg-border-main"}`}
                        >
                            <span
                                className={`absolute top-0.5 w-4 h-4 bg-background-light rounded-full shadow transition-all ${annual ? "left-5" : "left-0.5"}`}
                            />
                        </button>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${annual ? "bg-background-light shadow text-text-main" : "text-text-light"}`}>
                            Annual
                            <span className="ml-1 text-[10px] bg-success-main/20 text-success-dark px-1.5 py-0.5 rounded-full font-semibold">
                                −30%
                            </span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {plans.map((p, i) => (
                        <div
                            key={i}
                            className={`rounded-2xl p-8 border card-hover relative ${p.highlight
                                ? "bg-background-inverse border-primary-main shadow-2xl shadow-primary-main/20 scale-105"
                                : "bg-background-light border-border-light"
                                }`}
                        >
                            {p.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-main text-text-inverse text-xs font-bold px-4 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-lg font-bold mb-1 ${p.highlight ? "text-text-inverse" : "text-text-main"}`}>
                                    {p.name}
                                </h3>
                                <p className={`text-sm leading-relaxed ${p.highlight ? "text-text-inverse/60" : "text-text-light"}`}>
                                    {p.desc}
                                </p>
                            </div>

                            <div className="mb-6">
                                {p.price ? (
                                    <div className="flex items-end gap-1">
                                        <span className={`text-4xl font-bold ${p.highlight ? "text-text-inverse" : "text-text-main"}`}>
                                            ${p.price}
                                        </span>
                                        <span className={`text-sm mb-1 ${p.highlight ? "text-text-inverse/50" : "text-text-light"}`}>/mo</span>
                                    </div>
                                ) : (
                                    <div className={`text-3xl font-bold ${p.highlight ? "text-text-inverse" : "text-text-main"}`}>
                                        Custom
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm">
                                        <RiCheckLine
                                            className={`text-base shrink-0 ${p.highlight ? "text-primary-light" : "text-success-main"}`}
                                        />
                                        <span className={p.highlight ? "text-text-inverse/80" : "text-text-light"}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${p.highlight
                                    ? "bg-primary-main text-text-inverse hover:bg-primary-dark"
                                    : "border border-primary-main text-primary-main hover:bg-primary-main hover:text-text-inverse"
                                    }`}
                            >
                                {p.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
function TestimonialsSection() {
    const testimonials = [
        {
            name: "Arjun Mehta",
            role: "CTO, TechNova",
            avatar: "AM",
            color: "bg-primary-main",
            stars: 5,
            text: "AssessHub cut our hiring time by 40%. The code execution environment is flawless and candidates love the clean UI. Our evaluators save hours every week.",
        },
        {
            name: "Sarah Williams",
            role: "HR Director, Finscale",
            avatar: "SW",
            color: "bg-secondary-main",
            stars: 5,
            text: "The proctoring feature gives us full confidence in the integrity of every exam. The analytics dashboard is incredibly insightful — best tool we've used.",
        },
        {
            name: "Ravi Kumar",
            role: "Lead Educator, CodeCampus",
            avatar: "RK",
            color: "bg-accent-main",
            stars: 5,
            text: "Setting up assessments for 500+ students was a breeze. Role-based access is a lifesaver — proctors and evaluators each see exactly what they need.",
        },
        {
            name: "Mei Lin",
            role: "Engineering Manager, Axon",
            avatar: "ML",
            color: "bg-success-main",
            stars: 5,
            text: "Instant reports after submissions are game-changing. We make faster, data-backed hiring decisions. The multi-language code judge is incredibly accurate.",
        },
    ];

    return (
        <section id="testimonials" className="py-24 bg-background-main">
            <Container>
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-primary-main text-sm font-semibold tracking-widest uppercase mb-3">
                        Testimonials
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-main mb-4">
                        Trusted by{" "}
                        <span className="gradient-text">thousands of teams</span>
                    </h2>
                    <p className="text-text-light">
                        Here's what our users say about AssessHub.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="bg-background-light border border-border-light rounded-2xl p-6 card-hover cursor-pointer"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: t.stars }).map((_, s) => (
                                    <RiStarFill key={s} className="text-warn-main text-sm" />
                                ))}
                            </div>
                            <p className="text-text-light text-sm leading-relaxed mb-5">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-text-inverse font-bold text-sm`}
                                >
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-text-main">{t.name}</div>
                                    <div className="text-xs text-text-light">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}

/* ─────────────────────────────────────────────
   CTA SECTION
───────────────────────────────────────────── */
function CTASection() {
    return (
        <section className="py-24 bg-background-inverse relative overflow-hidden">
            {/* Decorative orbs */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-main/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary-main/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-main/20 rounded-2xl mb-6">
                    <RiRocketLine className="text-primary-main text-3xl" />
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold text-text-inverse mb-5 leading-tight">
                    Ready to transform how you{" "}
                    <span className="gradient-text">assess talent?</span>
                </h2>
                <p className="text-text-inverse/60 text-lg mb-10 max-w-xl mx-auto">
                    Join thousands of companies using AssessHub to hire faster, smarter,
                    and with complete confidence.
                </p>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    const links = [
        { name: "Home", to: "/" },
        { name: "Features", to: "#features" },
        { name: "How It Works", to: "#How It Works" },
        { name: "Testimonials", to: "#Testimonials" },
    ];

    return (
        <footer className="bg-background-inverse border-t border-dark-main">
            <Container className="py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 bg-primary-main rounded-lg flex items-center justify-center">
                                <RiBrainLine className="text-text-inverse text-lg" />
                            </div>
                            <span className="text-xl font-bold text-text-inverse">
                                Assess<span className="gradient-text">Hub</span>
                            </span>
                        </div>
                        <p className="text-sm text-text-inverse/50 tracking-wider">
                            The smartest way to evaluate talent — from code challenges to comprehensive knowledge assessments.
                        </p>
                    </div>

                    {/* Link columns */}
                    <div className="gap-2 flex flex-col">
                        <h3 className="text-text-inverse/80 font-semibold">Quick Links</h3>
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.to}
                                className="text-sm text-text-inverse/50 hover:text-primary-main transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-text-inverse/80 font-semibold">Social Links</h3>
                        {[
                            { icon: RiMailLine, text: "mayurlikhitkar786@gmail.com" },
                            { icon: RiPhoneLine, text: "+91 6260658118" },
                            { icon: RiMapPinLine, text: "Indore, Madhya Pradesh" },
                        ].map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-text-inverse/50">
                                <c.icon className="text-primary-main w-4 h-4 shrink-0" />
                                <span className="text-sm wrap-break-word">{c.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-dark-main text-text-inverse/50 text-center">
                    © {new Date().getFullYear()} AssessHub. All rights reserved.
                </div>
            </Container>
        </footer>
    );
}

/* ─────────────────────────────────────────────
   SCROLL TO TOP BUTTON
───────────────────────────────────────────── */
function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const handler = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return visible ? (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 w-11 h-11 bg-primary-main text-text-inverse rounded-xl flex items-center justify-center shadow-lg shadow-primary-main/40 hover:bg-primary-dark transition-all duration-200 hover:-translate-y-0.5"
        >
            <RiArrowDownLine className="rotate-180" />
        </button>
    ) : null;
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-main text-text-main">
            <Navbar />
            <HeroSection />
            <StatsBanner />
            <FeaturesSection />
            <HowItWorksSection />
            {/* <PricingSection /> */}
            <TestimonialsSection />
            <CTASection />
            <Footer />
            <ScrollToTop />
        </div>
    );
}

export default Home;