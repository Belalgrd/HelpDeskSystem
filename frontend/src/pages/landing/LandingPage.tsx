import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// ==================== ICON COMPONENTS ====================
const TicketIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
);

const DashboardIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
);

const BellIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ShieldIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const MailIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// ==================== NAVBAR ====================
const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">H</span>
                        </div>
                        <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                            HelpDesk
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['features', 'how-it-works', 'pricing', 'testimonials', 'faq'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item)}
                                className={`text-sm font-medium capitalize transition-colors hover:text-indigo-400 ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-200'
                                    }`}
                            >
                                {item.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <Link
                                to="/"
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isScrolled
                                        ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600'
                                        : 'text-white hover:text-indigo-200'
                                        }`}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
                                >
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        <span className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}>
                            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </span>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-2 p-4 border border-gray-100 dark:border-gray-700">
                        {['features', 'how-it-works', 'pricing', 'testimonials', 'faq'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item)}
                                className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg capitalize"
                            >
                                {item.replace('-', ' ')}
                            </button>
                        ))}
                        <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 space-y-2">
                            <Link to="/login" className="block w-full px-4 py-3 text-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium">
                                Sign In
                            </Link>
                            <Link to="/register" className="block w-full px-4 py-3 text-center bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

// ==================== HERO SECTION ====================
const HeroSection: React.FC = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800" />

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                <span className="text-sm text-gray-200">Trusted by 500+ companies worldwide</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
                Streamline Your
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Support Operations
                </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                A modern help desk solution that empowers your team to deliver exceptional customer support.
                Track tickets, automate workflows, and resolve issues faster than ever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                    to="/register"
                    className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl shadow-white/20 hover:shadow-white/30 hover:scale-105 w-full sm:w-auto"
                >
                    Start Free Trial
                </Link>
                <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    See How It Works
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {[
                    { value: '99.9%', label: 'Uptime' },
                    { value: '50K+', label: 'Tickets Resolved' },
                    { value: '500+', label: 'Companies' },
                    { value: '<2min', label: 'Avg Response Time' },
                ].map((stat, index) => (
                    <div key={index} className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                    className="fill-gray-50 dark:fill-gray-900" />
            </svg>
        </div>
    </section>
);

// ==================== FEATURES SECTION ====================
const features = [
    {
        icon: <TicketIcon />,
        title: 'Smart Ticket Management',
        description: 'Create, track, and resolve support tickets with intelligent routing and automated assignments.',
    },
    {
        icon: <DashboardIcon />,
        title: 'Real-Time Dashboard',
        description: 'Get instant insights with live analytics, charts, and performance metrics at a glance.',
    },
    {
        icon: <BellIcon />,
        title: 'Instant Notifications',
        description: 'Stay updated with real-time push notifications via SignalR for every ticket update.',
    },
    {
        icon: <UsersIcon />,
        title: 'Role-Based Access',
        description: 'Granular permissions for Admins, Agents, and Users ensure data security and proper workflows.',
    },
    {
        icon: <ChartIcon />,
        title: 'Advanced Reporting',
        description: 'Generate detailed reports on ticket trends, team performance, and SLA compliance.',
    },
    {
        icon: <MailIcon />,
        title: 'Email Integration',
        description: 'Automatic email notifications keep everyone informed about ticket status changes.',
    },
];

const FeaturesSection: React.FC = () => (
    <section id="features" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold mb-4">
                    Features
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Everything You Need to
                    <span className="text-indigo-600 dark:text-indigo-400"> Deliver Great Support</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Powerful features designed to streamline your support workflow and delight your customers.
                </p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:-translate-y-1"
                    >
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ==================== HOW IT WORKS ====================
const steps = [
    {
        step: '01',
        title: 'Create a Ticket',
        description: 'Users submit support requests with details, priority, and category. Attachments supported.',
    },
    {
        step: '02',
        title: 'Track & Assign',
        description: 'Tickets are automatically routed to the right team. Agents pick up and start resolving.',
    },
    {
        step: '03',
        title: 'Resolve & Report',
        description: 'Issues are resolved with full history tracking. Generate reports to improve processes.',
    },
];

const HowItWorksSection: React.FC = () => (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-4">
                    How It Works
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Get Started in
                    <span className="text-purple-600 dark:text-purple-400"> Three Simple Steps</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    From ticket creation to resolution — our streamlined process makes support effortless.
                </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {steps.map((item, index) => (
                    <div key={index} className="relative text-center">
                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700" />
                        )}
                        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white text-2xl font-bold mb-6 shadow-lg shadow-indigo-600/30">
                            {item.step}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ==================== PRICING SECTION ====================
const plans = [
    {
        name: 'Starter',
        price: 'Free',
        period: 'forever',
        description: 'Perfect for small teams getting started',
        features: ['Up to 5 agents', '100 tickets/month', 'Email notifications', 'Basic reporting', 'Community support'],
        cta: 'Start Free',
        highlighted: false,
    },
    {
        name: 'Professional',
        price: '\$29',
        period: '/agent/month',
        description: 'Best for growing support teams',
        features: ['Unlimited agents', 'Unlimited tickets', 'Real-time notifications', 'Advanced analytics', 'Priority support', 'Custom categories', 'SLA management', 'API access'],
        cta: 'Start Free Trial',
        highlighted: true,
    },
    {
        name: 'Enterprise',
        price: '\$79',
        period: '/agent/month',
        description: 'For large-scale organizations',
        features: ['Everything in Pro', 'SSO/SAML', 'Custom integrations', 'Dedicated account manager', '99.99% SLA uptime', 'On-premise deployment', 'Audit logs', 'White-label option'],
        cta: 'Contact Sales',
        highlighted: false,
    },
];

const PricingSection: React.FC = () => (
    <section id="pricing" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-4">
                    Pricing
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Simple, Transparent
                    <span className="text-indigo-600 dark:text-indigo-400"> Pricing</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    No hidden fees. Start free and scale as you grow.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`relative rounded-2xl p-8 ${plan.highlighted
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-600/30 scale-105 border-0'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
                            }`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 text-sm font-bold rounded-full">
                                Most Popular
                            </div>
                        )}
                        <h3 className={`text-xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {plan.name}
                        </h3>
                        <p className={`text-sm mb-6 ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            {plan.description}
                        </p>
                        <div className="mb-6">
                            <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {plan.price}
                            </span>
                            <span className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                {plan.period}
                            </span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <svg className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? 'text-indigo-200' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className={`text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/register"
                            className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${plan.highlighted
                                ? 'bg-white text-indigo-700 hover:bg-gray-100 shadow-lg'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                                }`}
                        >
                            {plan.cta}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ==================== TESTIMONIALS ====================
const testimonials = [
    {
        name: 'Sarah Johnson',
        role: 'IT Director',
        company: 'TechCorp Inc.',
        content: 'HelpDesk transformed our support operations. We reduced ticket resolution time by 60% in just two months. The real-time dashboard is a game-changer.',
        avatar: 'SJ',
    },
    {
        name: 'Michael Chen',
        role: 'Support Manager',
        company: 'CloudBase Solutions',
        content: 'The best ticketing system we\'ve used. The role-based access and automated notifications save us hours every week. Highly recommended!',
        avatar: 'MC',
    },
    {
        name: 'Emily Rodriguez',
        role: 'CTO',
        company: 'StartupHub',
        content: 'Clean interface, powerful features, and excellent reporting. Our team adopted it immediately. Customer satisfaction scores have never been higher.',
        avatar: 'ER',
    },
];

const TestimonialsSection: React.FC = () => (
    <section id="testimonials" className="py-20 lg:py-28 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-sm font-semibold mb-4">
                    Testimonials
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Loved by
                    <span className="text-indigo-600 dark:text-indigo-400"> Support Teams</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    See what our customers say about their experience with HelpDesk.
                </p>
            </div>

            {/* Testimonial Cards */}
            <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                        {/* Stars */}
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} />
                            ))}
                        </div>
                        {/* Content */}
                        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                            "{testimonial.content}"
                        </p>
                        {/* Author */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {testimonial.avatar}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.company}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ==================== FAQ SECTION ====================
const faqs = [
    {
        question: 'How does the free plan work?',
        answer: 'Our free plan includes up to 5 agents and 100 tickets per month. No credit card required. You can upgrade anytime as your team grows.',
    },
    {
        question: 'Can I import tickets from other systems?',
        answer: 'Yes! We support importing tickets from popular platforms like Zendesk, Freshdesk, and JIRA. Our support team can help with migration.',
    },
    {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use industry-standard encryption (AES-256), JWT authentication, and role-based access control. Your data is backed up daily.',
    },
    {
        question: 'Do you offer custom integrations?',
        answer: 'Our Enterprise plan includes custom integrations with your existing tools. We also provide a RESTful API for building your own integrations.',
    },
    {
        question: 'What kind of support do you provide?',
        answer: 'Free plans get community support. Professional plans include priority email support with 4-hour response time. Enterprise gets a dedicated account manager.',
    },
    {
        question: 'Can I cancel anytime?',
        answer: 'Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees. Your data remains accessible for 30 days after cancellation.',
    },
];

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-4">
                        FAQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked
                        <span className="text-indigo-600 dark:text-indigo-400"> Questions</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Got questions? We've got answers.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDownIcon
                                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-6">
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ==================== CTA SECTION ====================
const CTASection: React.FC = () => (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Support?
            </h2>
            <p className="text-lg text-indigo-200 mb-10 max-w-2xl mx-auto">
                Join 500+ companies that trust HelpDesk to manage their customer support.
                Get started for free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                    to="/register"
                    className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 w-full sm:w-auto"
                >
                    Get Started Free
                </Link>
                <Link
                    to="/login"
                    className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg border border-white/30 hover:bg-white/20 transition-all w-full sm:w-auto"
                >
                    Sign In
                </Link>
            </div>
        </div>
    </section>
);

// ==================== FOOTER ====================
const Footer: React.FC = () => (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">H</span>
                        </div>
                        <span className="text-xl font-bold text-white">HelpDesk</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-4">
                        Modern help desk solution for teams that care about customer experience.
                    </p>
                </div>

                {/* Product */}
                <div>
                    <h4 className="text-white font-semibold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm">
                        {['Features', 'Pricing', 'Integrations', 'Changelog', 'Documentation'].map((item) => (
                            <li key={item}>
                                <button
                                    onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                                    className="hover:text-white transition-colors"
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 className="text-white font-semibold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm">
                        {['About Us', 'Careers', 'Blog', 'Press', 'Contact'].map((item) => (
                            <li key={item}>
                                <a href="#" className="hover:text-white transition-colors">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="text-white font-semibold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'].map((item) => (
                            <li key={item}>
                                <a href="#" className="hover:text-white transition-colors">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm">
                    © {new Date().getFullYear()} HelpDesk. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    {/* Social Icons */}
                    {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                        <a
                            key={social}
                            href="#"
                            className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors"
                            title={social}
                        >
                            <span className="text-xs font-bold text-white">{social[0]}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </footer>
);

// ==================== MAIN LANDING PAGE ====================
export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <PricingSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
            <Footer />
        </div>
    );
};

export default LandingPage;