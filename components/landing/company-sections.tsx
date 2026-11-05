import Link from "next/link";
import {
  ABOUT, COMPANY, MISSION, PARTNERS, PARTNERS_INTRO, PRODUCTS, PRODUCT_STATUS_LABEL, TEAM, VALUES, VISION,
  mailto, type Product, type ProductStatus,
} from "@/lib/company";

// The landing page's company sections: products, about, mission and vision,
// team, partners, contact and the footer. Content lives in lib/company.ts.

const CARD = "rounded-2xl border border-white/[0.06] bg-[#0c1326]";

const STATUS_CLS: Record<ProductStatus, string> = {
  beta:     "bg-green-500/15 text-green-400 border-green-500/30",
  active:   "bg-teal-500/15 text-teal-300 border-teal-500/30",
  planning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  concept:  "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-[11px] font-black tracking-[0.25em] uppercase text-itoolbox-red mb-3">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-balance">{title}</h2>
      {sub && <p className="text-white/50 text-sm sm:text-base mt-3 max-w-2xl mx-auto text-balance">{sub}</p>}
    </div>
  );
}

function StatusChip({ status }: { status: ProductStatus }) {
  return (
    <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_CLS[status]}`}>
      {PRODUCT_STATUS_LABEL[status]}
    </span>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-1.5">
      {features.map((f) => (
        <li key={f} className="flex gap-2 text-xs text-white/55">
          <span className="text-green-400 shrink-0" aria-hidden>✓</span>{f}
        </li>
      ))}
    </ul>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className={`${CARD} p-6 flex flex-col`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-2xl" aria-hidden>{product.icon}</span>
        <StatusChip status={product.status}/>
      </div>
      <h3 className="text-lg font-black">{product.name}</h3>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">{product.tagline}</p>
      <p className="text-sm text-white/60 leading-relaxed mb-4 flex-1">{product.desc}</p>
      <FeatureList features={product.features}/>
    </div>
  );
}

export function ProductsSection() {
  const [flagship, ...rest] = PRODUCTS;
  return (
    <section id="products" className="relative max-w-6xl mx-auto px-5 py-20 scroll-mt-16">
      <SectionHeader eyebrow="Products & Services" title="Our Products & Services" sub="Innovative solutions across multiple industries"/>

      {/* The live product gets the full width; the rest share a grid. */}
      <div className={`${CARD} p-6 sm:p-8 mb-4 border-orange-500/30 grid gap-6 sm:grid-cols-[auto_1fr_auto] sm:items-center`}>
        <img src="/icons/bantai.jpg" alt="" className="w-20 h-20 rounded-2xl object-cover ring-1 ring-white/10"/>
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-2xl font-black text-itoolbox-red">{flagship.name}</h3>
            <StatusChip status={flagship.status}/>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">{flagship.tagline}</p>
          <p className="text-sm text-white/65 leading-relaxed mb-3 max-w-2xl">{flagship.desc}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {flagship.features.map((f) => (
              <span key={f} className="flex gap-2 text-xs text-white/55"><span className="text-green-400" aria-hidden>✓</span>{f}</span>
            ))}
          </div>
        </div>
        <a href={flagship.href} className="justify-self-start sm:justify-self-end px-5 py-2.5 rounded-xl text-xs font-black border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 transition-colors whitespace-nowrap">
          See BantAI ↑
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => <ProductCard key={p.key} product={p}/>)}
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="relative max-w-6xl mx-auto px-5 py-20 scroll-mt-16">
      <SectionHeader eyebrow="About Us" title={`About ${COMPANY.name}`} sub={COMPANY.tagline}/>
      <div className="grid gap-8 lg:grid-cols-[300px_1fr] items-center mb-10">
        <div className="bg-white rounded-3xl p-8 max-w-[300px] mx-auto shadow-2xl">
          <img src={COMPANY.logoSrc} alt={`${COMPANY.name} logo`} className="w-full h-auto"/>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-black mb-2">Who We Are</h3>
            <p className="text-white/60 leading-relaxed">{ABOUT.whoWeAre}</p>
          </div>
          <div>
            <h3 className="text-lg font-black mb-2">Our Leadership</h3>
            <p className="text-white/60 leading-relaxed">{ABOUT.leadership}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className={`${CARD} p-5 text-center`}>
            <div className="text-3xl mb-2" aria-hidden>{v.icon}</div>
            <h3 className="font-black mb-1">{v.title}</h3>
            <p className="text-xs text-white/50">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MissionVisionSection() {
  return (
    <section id="mission" className="relative max-w-6xl mx-auto px-5 py-20 scroll-mt-16">
      <SectionHeader eyebrow="Purpose" title="Our Mission and Vision"/>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${CARD} p-6 sm:p-8`}>
          <h3 className="text-xl font-black text-itoolbox-red mb-4">Our Mission</h3>
          <p className="text-sm text-white/65 leading-relaxed mb-4">{MISSION.statement}</p>
          <p className="text-sm text-white/65 mb-3">{MISSION.industriesLead}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {MISSION.industries.map((i) => (
              <span key={i} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/70">{i}</span>
            ))}
          </div>
          <p className="text-sm text-white/50 leading-relaxed">{MISSION.philosophy}</p>
        </div>
        <div className={`${CARD} p-6 sm:p-8`}>
          <h3 className="text-xl font-black text-itoolbox-teal mb-4">Our Vision</h3>
          <p className="text-sm text-white/65 leading-relaxed mb-4">{VISION.statement}</p>
          <p className="text-sm text-white/65 mb-3">{VISION.commitmentsLead}</p>
          <ul className="space-y-2 mb-4">
            {VISION.commitments.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-white/60"><span className="text-itoolbox-teal shrink-0" aria-hidden>✓</span>{c}</li>
            ))}
          </ul>
          <p className="text-sm text-white/50 leading-relaxed">{VISION.closing}</p>
        </div>
      </div>
    </section>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="relative max-w-6xl mx-auto px-5 py-20 scroll-mt-16">
      <SectionHeader eyebrow="Our Team" title="The People Behind IToolbox" sub="We're in our bootstrap phase, and growing."/>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((m) => (
          <div key={m.role} className={`${CARD} p-6 flex items-center gap-5`}>
            {m.photoSrc ? (
              <img src={m.photoSrc} alt={m.name} className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-1 ring-white/10"/>
            ) : (
              <span className="w-20 h-20 rounded-2xl shrink-0 bg-white/[0.04] border border-dashed border-white/15 flex items-center justify-center text-2xl text-white/25" aria-hidden>＋</span>
            )}
            <div className="min-w-0">
              <h3 className={`font-black leading-tight ${m.photoSrc ? "" : "text-white/40"}`}>{m.name}</h3>
              <p className="text-xs text-white/50 mt-1">{m.role}</p>
              {m.facebook && (
                <a href={m.facebook} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[11px] font-bold text-blue-400 hover:underline">Facebook ↗</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PartnersSection() {
  return (
    <section id="partners" className="relative max-w-6xl mx-auto px-5 py-20 scroll-mt-16">
      <SectionHeader eyebrow="Partners" title="Our Partners" sub="Collaborating for innovation and positive impact"/>
      <p className="text-white/55 text-center leading-relaxed max-w-3xl mx-auto mb-10">{PARTNERS_INTRO}</p>
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        {PARTNERS.map((p) => (
          <div key={p.name} className={`${CARD} p-6 flex flex-col sm:flex-row gap-5`}>
            <div className="w-24 h-24 rounded-2xl bg-white p-2 shrink-0 flex items-center justify-center">
              <img src={p.logoSrc} alt={`${p.name} logo`} className="max-w-full max-h-full object-contain"/>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black">{p.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">{p.tagline}</p>
              <p className="text-sm text-white/60 leading-relaxed mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {p.focus.map((f) => (
                  <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/60">{f}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-400 hover:underline">{l.label} ↗</a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`${CARD} p-6 sm:p-8 text-center`}>
        <h3 className="text-xl font-black mb-2">Interested in Partnership?</h3>
        <p className="text-sm text-white/50 mb-5">We&apos;re always looking for like-minded organizations to collaborate with.</p>
        <a href={mailto("Partnership with IToolbox")} className="inline-block px-6 py-2.5 rounded-xl text-sm font-black bg-itoolbox-red hover:bg-red-700 transition-colors">
          Partner With Us
        </a>
      </div>
    </section>
  );
}

export function ContactSection() {
  const items = [
    { icon: "✉️", label: "Email",    value: COMPANY.email,    href: mailto("Hello IToolbox") },
    { icon: "📞", label: "Phone",    value: COMPANY.phone,    href: COMPANY.phoneHref },
    { icon: "📍", label: "Location", value: COMPANY.location },
  ];
  return (
    <section id="contact" className="relative max-w-6xl mx-auto px-5 py-20 scroll-mt-16">
      <SectionHeader eyebrow="Contact" title="Get In Touch" sub="Let's discuss how we can help your business."/>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((i) => {
          const body = (
            <>
              <div className="text-2xl mb-2" aria-hidden>{i.icon}</div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">{i.label}</h3>
              <p className="font-bold break-words">{i.value}</p>
            </>
          );
          return i.href ? (
            <a key={i.label} href={i.href} className={`${CARD} p-6 text-center hover:border-white/20 transition-colors`}>{body}</a>
          ) : (
            <div key={i.label} className={`${CARD} p-6 text-center`}>{body}</div>
          );
        })}
      </div>
    </section>
  );
}

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export function SiteFooter({ isLoggedIn }: { isLoggedIn: boolean }) {
  const columns: FooterColumn[] = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" }, { label: "Our Team", href: "#team" },
        { label: "Partners", href: "#partners" }, { label: "Contact", href: "#contact" },
      ],
    },
    { title: "Products", links: PRODUCTS.slice(0, 4).map((p) => ({ label: p.name, href: p.href ?? "#products" })) },
    {
      title: "Platform",
      links: [
        isLoggedIn ? { label: "Dashboard", href: "/dashboard" } : { label: "Login", href: "/login?page=account" },
        { label: "Support", href: "/support" },
      ],
    },
  ];
  return (
    <footer className="relative border-t border-white/[0.05] bg-[#080c19]">
      <div className="max-w-6xl mx-auto px-5 py-12 grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="bg-white rounded-xl p-2 inline-block mb-3">
            <img src={COMPANY.logoSrc} alt={COMPANY.name} className="h-10 w-auto"/>
          </div>
          <p className="text-xs text-white/45 leading-relaxed max-w-xs">
            Building intelligent solutions for public and private sectors since {COMPANY.founded}.
          </p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-3">{c.title}</h3>
            <ul className="space-y-2">
              {c.links.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith("/") ? (
                    <Link href={href} className="text-sm text-white/60 hover:text-white transition-colors">{label}</Link>
                  ) : (
                    <a href={href} className="text-sm text-white/60 hover:text-white transition-colors">{label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-white text-gray-600 py-2.5 px-5 text-center text-xs">
        © {COMPANY.founded}–{new Date().getFullYear()} {COMPANY.name}. All Rights Reserved.
      </div>
    </footer>
  );
}
