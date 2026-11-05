// IToolbox, the company: the content the landing page shows about it, carried
// over from the company site (itoolboxph.github.io/Landing-Page and
// /Products-Services-Page). The single source of truth for it, as
// lib/platform-apps.ts is for the platform's modules.

export const COMPANY = {
  name: "IToolbox",
  founded: 2019,
  tagline: "Building tomorrow's solutions today!",
  intro:
    "Transforming public and private sectors through innovative AI-powered software and IoT solutions. From environmental monitoring to educational platforms, healthcare management to e-commerce, conversational AI to smart automation, we build technology that drives real change.",
  email: "itoolbox2019@gmail.com",
  phone: "+63 999 229 8724",
  phoneHref: "tel:+639992298724",
  location: "Philippines",
  logoSrc: "/company/itoolbox-logo.png",
};

export const ABOUT = {
  whoWeAre:
    "IToolbox is a technology startup founded in 2019, dedicated to building innovative digital solutions that leverage AI, IoT, and modern web technologies. We're on a mission to create practical, scalable products that solve real-world problems across both public and private sectors.",
  leadership:
    "Our organization is led by Nicole John (Nico) A. Mortel, our Founding President & CEO — an accomplished IT professional, Senior Network Engineer, and Data Scientist with deep expertise in full‑stack development, AI/ML, and network infrastructure. Currently in our bootstrap phase, Nico M. drives both the technical and business fronts, overseeing product development, strategic direction, and operational execution as we build the foundation of our core offerings.",
};

export const VALUES = [
  { icon: "💡", title: "Innovation",     desc: "Constantly pushing boundaries with new technologies" },
  { icon: "✅", title: "Quality",        desc: "Delivering reliable, well-tested solutions" },
  { icon: "🤝", title: "Customer Focus", desc: "Building products that solve real problems" },
];

export const MISSION = {
  statement:
    "To build practical, scalable, and high‑impact digital products and services that address real‑world challenges across both the public and private sectors. We deliver high‑quality, user‑centric solutions that combine cutting‑edge technologies — AI, IoT, automation, and modern web platforms — with real‑world applications that drive efficiency, sustainability, and meaningful growth.",
  industriesLead: "We serve industries where innovation is urgently needed:",
  industries: [
    "Environmental Management", "Education", "Agriculture", "Healthcare",
    "Financial Services (FinTech)", "Logistics", "Manufacturing",
  ],
  philosophy:
    "Our mission is rooted in a philosophy shaped by firsthand exposure to global innovation ecosystems: that true innovation is a continuous, never‑ending cycle of discovery, improvement, and reinvention. This belief guides how we design, build, and deliver every product we create.",
};

export const VISION = {
  statement:
    "IToolbox aims to be a leading provider of innovative, resilient, and sustainable technology solutions that enable organizations to operate efficiently, responsibly, and competitively. We envision a future where continuous innovation and environmental stewardship work together to drive long‑term value for industries, professionals, and communities.",
  commitmentsLead: "We are committed to advancing technology as a service by:",
  commitments: [
    "Delivering scalable solutions that support digital transformation and operational excellence.",
    "Equipping professionals with the tools, training, and capabilities needed for innovation.",
    "Embedding sustainability principles into our products, practices, and partnerships.",
    "Promoting responsible use of technology to reduce environmental impact and support global sustainability goals.",
    "Extending digital opportunities to underserved communities to ensure inclusive, equitable progress.",
  ],
  closing:
    "Our vision is to create enduring value for our clients, partners, and society by developing technologies that are purposeful, environmentally responsible, and aligned with global standards of excellence.",
};

export type ProductStatus = "beta" | "active" | "planning" | "concept";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  beta:     "Private Beta",
  active:   "Active Development",
  planning: "Planning",
  concept:  "Concept",
};

export interface Product {
  key: string;
  name: string;
  tagline: string;
  desc: string;
  features: string[];
  status: ProductStatus;
  icon: string;
  /** In-page anchor or route for products that have one. */
  href?: string;
}

// BantAI first: it is the one running today. The rest, in the company site's order.
export const PRODUCTS: Product[] = [
  {
    key: "bantai",
    name: "BantAI",
    tagline: "AI Knowledge Base & Conversational Agent",
    desc: "IToolbox's AI chat assistant. Ask in English or Filipino: it queries live public data where it lives, through the Zetaris AI Data Harness, and cites the rows behind every answer.",
    features: ["Evidence behind every answer", "English and Filipino", "Live data, governed locally"],
    status: "beta",
    icon: "💬",
    href: "#bantai",
  },
  {
    key: "informa",
    name: "InForMa",
    tagline: "Intelligent Forest Monitoring",
    desc: "AI-powered forest monitoring system with 100% chainsaw detection accuracy. Prevent illegal logging and forest fires with IoT technology.",
    features: ["100% detection accuracy", "Raspberry Pi deployment", "Real-time alerts"],
    status: "active",
    icon: "🌳",
  },
  {
    key: "store",
    name: "IToolbox Store",
    tagline: "Technology E-commerce Platform",
    desc: "Online marketplace for IoT devices, smart home solutions, mobile devices, and computer peripherals. One-stop shop for home and enterprise technology needs.",
    features: ["IoT & smart devices", "Mobile & computer peripherals", "Secure payment & delivery"],
    status: "planning",
    icon: "🛒",
  },
  {
    key: "marco-phoenix",
    name: "Marco Phoenix",
    tagline: "Conversational AI Assistant",
    desc: "Advanced AI platform with natural conversation, knowledge base management, and intelligent automation. Your personal and business AI companion powered by cutting-edge language models.",
    features: ["Natural conversation & memory", "Knowledge base & automation", "Voice interface & integrations"],
    status: "planning",
    icon: "🤖",
  },
  {
    key: "medconnect",
    name: "MedConnect",
    tagline: "Healthcare Management Platform",
    desc: "Comprehensive healthcare solutions for clinics, hospitals, and medical professionals. Patient records, appointment scheduling, and telemedicine capabilities.",
    features: ["Electronic Medical Records (EMR)", "Appointment scheduling", "Telemedicine integration"],
    status: "concept",
    icon: "🏥",
  },
  {
    key: "bilmoko",
    name: "BilMoko",
    tagline: "Restaurant Price Aggregator",
    desc: "Real-time price comparison and analytics for food service businesses. Make data-driven pricing decisions with comprehensive market intelligence.",
    features: ["Real-time price tracking", "Pricing recommendations", "Market trend analysis"],
    status: "planning",
    icon: "📈",
  },
  {
    key: "digicool",
    name: "DigiCool",
    tagline: "Digital School Platform",
    desc: "Comprehensive school management system for modern educational institutions. Streamline administration, grading, and communication.",
    features: ["Student/teacher portals", "Automated grading", "Performance analytics"],
    status: "planning",
    icon: "🎓",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  /** Absent for a role that is still open. */
  photoSrc?: string;
  facebook?: string;
}

export const TEAM: TeamMember[] = [
  { name: "Nicole John (Nico) Mortel", role: "Founding President & CEO", photoSrc: "/company/nico-mortel.jpg", facebook: "https://web.facebook.com/njamortel" },
  { name: "Jesson (Je) Paloma",        role: "CTO / Lead Developer",     photoSrc: "/company/jesson-paloma.jpg" },
  { name: "To be hired", role: "Head of Product" },
  { name: "To be hired", role: "Marketing & Sales Lead" },
  { name: "To be hired", role: "CFO / Head of Finance" },
  { name: "To be hired", role: "Head of People & Culture" },
];

export interface Partner {
  name: string;
  tagline: string;
  desc: string;
  focus: string[];
  logoSrc: string;
  links: { label: string; href: string }[];
}

export const PARTNERS_INTRO =
  "At IToolbox, we believe in the power of collaboration. Our partnerships amplify our impact and enable us to deliver innovative solutions that make a real difference in technology, environmental conservation, and leadership development.";

export const PARTNERS: Partner[] = [
  {
    name: "LMNP - JUAN EARTH",
    tagline: "Environmental Innovation Through Technology",
    desc: "An organization formed with the common vision of helping the environment through technology innovation. Together, we're developing solutions that protect and preserve our natural resources for future generations.",
    focus: ["Environmental Tech", "Innovation", "Sustainability"],
    logoSrc: "/company/partner-lmnp-juan-earth.png",
    links: [
      { label: "Watch Video",   href: "https://www.facebook.com/watch/?v=2008922649179463" },
      { label: "Facebook Page", href: "https://www.facebook.com/JUAN4EARTH" },
    ],
  },
  {
    name: "VGP Leadership Training Center",
    tagline: "Christ-Centered Leadership Development",
    desc: "A Christ-centered organization dedicated to developing leaders with strong values and purpose. Through our partnership, we're leveraging technology to enhance training programs and expand their reach in building future leaders.",
    focus: ["Leadership", "Faith-Based", "Training"],
    logoSrc: "/company/partner-vgp-ltc.png",
    links: [{ label: "Facebook Page", href: "https://www.facebook.com/100064173033722/" }],
  },
];

/** A mailto: link to the company inbox with the subject filled in. */
export function mailto(subject: string): string {
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}`;
}
