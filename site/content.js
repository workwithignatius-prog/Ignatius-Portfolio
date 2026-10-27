// All portfolio content lives here. Edit this file to update the site —
// no HTML changes needed. Text in [brackets] is placeholder copy to replace.
window.PORTFOLIO = {
  name: "Ignatius",
  handle: "itsigni",
  role: "[Your role — e.g. Product Designer]",
  tagline: "[One line on what you do and who you do it for.]",
  location: "[City, Country]",
  timezone: "Asia/Kolkata", // IANA zone for the live clock, e.g. "Europe/London"
  available: true,
  email: "workwithignatius@gmail.com",
  resumeUrl: "", // e.g. "assets/resume.pdf"

  // Your photo for the hero and About sections. Add the file at site/assets/me.jpg
  // (portrait, roughly 4:5). Until it exists, a gradient monogram is shown.
  photo: "assets/me.jpg",

  // "Let's talk" buttons open this link. Paste your Calendly URL here.
  calendlyUrl: "https://calendly.com/", // e.g. "https://calendly.com/itsigni/30min"

  // Contact form. Create a free form at https://formspree.io and paste its endpoint,
  // e.g. "https://formspree.io/f/abcdwxyz". If left empty, the form opens the
  // visitor's email app with the message filled in instead.
  formEndpoint: "",
  projectTypes: ["UI/UX Design", "Branding", "Motion & 3D", "Web Development", "Something else"],
  budgets: ["Under $1k", "$1k – $5k", "$5k – $10k", "$10k+", "Not sure yet"],

  // Greetings cycled on the loading screen.
  greetings: ["Hello", "வணக்கம்", "नमस्ते", "Hola", "Bonjour", "Ciao", "こんにちは"],

  // Big statement under the hero — revealed word by word as you scroll.
  statement:
    "[I design and build digital experiences that feel effortless — a sentence or two about your approach, the kind of teams you work with and the results you care about.]",

  // Scrolling ticker of what you do.
  marquee: ["[UI/UX Design]", "[Branding]", "[Motion]", "[Web Development]", "[3D]", "[Art Direction]"],

  stats: [
    { value: 0, suffix: "+", label: "Years experience" },
    { value: 0, suffix: "+", label: "Projects shipped" },
    { value: 0, suffix: "+", label: "Happy clients" },
    { value: 0, suffix: "%", label: "Client retention" },
  ],

  // Each project's "category" must match one of these filters (except "All").
  filters: ["All", "UI/UX", "Branding", "Motion", "Web"],

  projects: [
    {
      title: "[Project one]",
      category: "UI/UX",
      year: "2026",
      client: "[Client]",
      role: "[Your role on it]",
      summary: "[One-line result, e.g. Redesigned onboarding, +40% sign-ups.]",
      tags: ["Figma", "Research", "Prototyping"],
      image: "", // e.g. "assets/project-one.jpg"
      link: "",
      caseStudy: {
        problem: "[What was broken or missing?]",
        process: "[How you approached it.]",
        outcome: "[What changed, ideally with a number.]",
      },
    },
    {
      title: "[Project two]",
      category: "Branding",
      year: "2026",
      client: "[Client]",
      role: "[Your role on it]",
      summary: "[One-line result.]",
      tags: ["Identity", "Logo", "Guidelines"],
      image: "",
      link: "",
      caseStudy: { problem: "[Problem]", process: "[Process]", outcome: "[Outcome]" },
    },
    {
      title: "[Project three]",
      category: "Motion",
      year: "2025",
      client: "[Client]",
      role: "[Your role on it]",
      summary: "[One-line result.]",
      tags: ["After Effects", "3D"],
      image: "",
      link: "",
      caseStudy: { problem: "[Problem]", process: "[Process]", outcome: "[Outcome]" },
    },
    {
      title: "[Project four]",
      category: "Web",
      year: "2025",
      client: "[Client]",
      role: "[Your role on it]",
      summary: "[One-line result.]",
      tags: ["Webflow", "Interaction"],
      image: "",
      link: "",
      caseStudy: { problem: "[Problem]", process: "[Process]", outcome: "[Outcome]" },
    },
  ],

  services: [
    { title: "[UI/UX Design]", detail: "[What you offer here, in one or two lines.]", tags: ["Research", "Wireframes", "Prototypes"] },
    { title: "[Brand Identity]", detail: "[What you offer here.]", tags: ["Logo", "Visual system", "Guidelines"] },
    { title: "[Motion & 3D]", detail: "[What you offer here.]", tags: ["Animation", "Reels", "3D renders"] },
    { title: "[Web Development]", detail: "[What you offer here.]", tags: ["Framer", "Webflow", "Code"] },
  ],

  process: [
    { step: "Discover", detail: "[Understand the goals, audience and constraints.]" },
    { step: "Define", detail: "[Shape the strategy and direction.]" },
    { step: "Design", detail: "[Explore, iterate and refine.]" },
    { step: "Deliver", detail: "[Ship, measure and improve.]" },
  ],

  about: {
    paragraphs: [
      "[A short intro: who you are and what drives your work.]",
      "[How you work with people, and what you're looking for next.]",
    ],
    skills: ["[Skill]", "[Skill]", "[Skill]", "[Tool]", "[Tool]", "[Tool]"],
  },

  experience: [
    { period: "[2024 — Now]", title: "[Job title]", org: "[Company]", detail: "[What you did there.]" },
    { period: "[2022 — 2024]", title: "[Job title]", org: "[Company]", detail: "[What you did there.]" },
  ],

  testimonials: [
    { quote: "[A short quote from a client or colleague.]", author: "[Name]", role: "[Role, Company]" },
    { quote: "[Another quote.]", author: "[Name]", role: "[Role, Company]" },
    { quote: "[A third quote.]", author: "[Name]", role: "[Role, Company]" },
  ],

  faq: [
    { q: "[How long does a project take?]", a: "[Your answer.]" },
    { q: "[What does it cost?]", a: "[Your answer.]" },
    { q: "[Do you work with teams remotely?]", a: "[Your answer.]" },
  ],

  socials: [
    { label: "LinkedIn", url: "" },
    { label: "Instagram", url: "" },
    { label: "Behance", url: "" },
    { label: "GitHub", url: "https://github.com/workwithignatius-prog" },
  ],
};
