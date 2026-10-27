// All portfolio content lives here. Edit this file to update the site —
// no HTML changes needed. Text in [brackets] is placeholder copy to replace.
window.PORTFOLIO = {
  name: "Ignatius",
  handle: "itsigni",
  role: "[Your role — e.g. Product Designer]",
  tagline: "[One line on what you do and who you do it for.]",
  location: "[City, Country]",
  available: true,
  email: "workwithignatius@gmail.com",
  resumeUrl: "", // e.g. "assets/resume.pdf"

  stats: [
    { value: "[0+]", label: "Years experience" },
    { value: "[0+]", label: "Projects shipped" },
    { value: "[0+]", label: "Happy clients" },
  ],

  // Each project's "category" must match one of these filters (except "All").
  filters: ["All", "UI/UX", "Branding", "Motion", "Web"],

  projects: [
    {
      title: "[Project one]",
      category: "UI/UX",
      year: "2026",
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
      role: "[Your role on it]",
      summary: "[One-line result.]",
      tags: ["Webflow", "Interaction"],
      image: "",
      link: "",
      caseStudy: { problem: "[Problem]", process: "[Process]", outcome: "[Outcome]" },
    },
  ],

  about: {
    photo: "", // e.g. "assets/me.jpg"
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
  ],

  socials: [
    { label: "LinkedIn", url: "" },
    { label: "Instagram", url: "" },
    { label: "Behance", url: "" },
    { label: "GitHub", url: "https://github.com/workwithignatius-prog" },
  ],
};
