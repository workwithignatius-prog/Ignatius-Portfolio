// All site content lives here. Edit this file to update the text on every page.
// Blog posts live in site/blog/posts/ (see README.md for how to write one).
window.PORTFOLIO = {
  name: "Ignatius",
  fullName: "Ignatius Nirmal G",
  handle: "itsigni",
  greeting: "Heyyya, I'm",
  heroBadge: "Presales · Solutions · AI/ML",
  role: "Presales & Solutions Engineer",
  tagline:
    "I help SaaS teams win the right deals by turning client needs into clear solutions, sharp demos and proposals that close.",
  metaDescription:
    "Ignatius Nirmal G is a presales and solutions engineer in Chennai, India with 5+ years in SaaS: solution design, product demos, RFPs and AI/ML solutions.",
  location: "Chennai, India",
  timezone: "Asia/Kolkata", // IANA zone for the live clock
  timezoneLabel: "IST",
  available: true,
  availability: "Open to new opportunities",
  email: "hello@itsigni.com",

  // The live address of the site, used in share links, the RSS feed and the sitemap.
  // Change it when you connect your own domain, e.g. "https://www.itsigni.com".
  siteUrl: "https://workwithignatius-prog.github.io/Ignatius-Portfolio",

  photo: "assets/me.jpg",

  // "Let's talk" buttons open this link. Until it's set they open the contact page.
  calendlyUrl: "", // e.g. "https://calendly.com/itsigni/30min"

  // Contact form. Create a free form at https://formspree.io and paste its endpoint,
  // e.g. "https://formspree.io/f/abcdwxyz". If left empty, the form opens the
  // visitor's email app with the message filled in instead.
  formEndpoint: "",
  contactTopics: [
    "A job opportunity",
    "Presales or solution consulting",
    "A product demo or POC",
    "RFP, RFQ or RFI support",
    "An AI/ML solution",
    "Speaking or collaboration",
    "Something else",
  ],

  resumeUrl: "", // e.g. "assets/ignatius-nirmal-g-cv.pdf" to show a Download CV button

  current: { role: "Product, Presales & Solution Engineer", company: "impress.ai", since: "May 2024" },

  stats: [
    { value: 5, suffix: "+", label: "Years in SaaS presales" },
    { value: 5, label: "Companies, startup to enterprise" },
    { value: 11, label: "Professional certifications" },
    { value: 30, prefix: "$", suffix: "K", label: "Revenue in 3 months at BookingBee.ai" },
  ],

  // Floating badges around the hero photo. Icons: star, spark, pin.
  heroChips: [
    { icon: "star", text: "Rockstar Rookie · Zoho" },
    { icon: "spark", text: "AI/ML solutions" },
    { icon: "pin", text: "Chennai, India" },
  ],

  statement:
    "Five years in presales taught me that the best deals start with listening. I turn complex client needs into clear solutions, compelling demos and proposals that drive real revenue growth.",

  marquee: ["Presales", "Solution engineering", "RFPs & proposals", "Product demos", "AI/ML solutions", "API integrations", "Go-to-market", "SaaS"],

  experience: [
    {
      company: "impress.ai",
      role: "Product, Presales & Solution Engineer",
      period: "May 2024 — Present",
      location: "India",
      summary: "Own presales end to end, from discovery to AI-powered solutions, RFP automation and a smooth hand-off to implementation.",
      highlights: [
        "Run in-depth discovery sessions with clients and design solution proposals tailored to each client's needs.",
        "Design and deploy AI/ML solutions with prompt engineering and custom prompt pipelines for summarisation, Q&A, chatbots and data extraction.",
        "Respond to RFPs and RFQs, and build bots that answer clients' queries accurately and on time.",
        "Develop and integrate RESTful APIs, working on both API consumption and API development for secure, scalable integrations.",
        "Own HubSpot across the company.",
        "Act as the liaison between product, engineering and sales, and shape the go-to-market strategy for new feature releases.",
        "Support customers after the sale with troubleshooting and onboarding, and hand over to implementation with thorough documentation.",
      ],
      tags: ["AI/ML", "RFPs", "APIs", "HubSpot"],
    },
    {
      company: "BookingBee.ai",
      role: "Founding Member — Product & Solutions",
      period: "Nov 2022 — Jan 2024",
      location: "India",
      summary: "Founding team member who built the go-to-market strategy and the sales team from scratch.",
      highlights: [
        "Created the full go-to-market strategy and led team formation, training the team on cold calling, solution selling and onboarding.",
        "Reached $30,000 in revenue within 3 months.",
        "Worked hands-on with AI/ML models, including fine-tuning and deploying large language models like Meta's LLaMA and Dasha.AI for real-world use cases.",
        "Developed and integrated RESTful APIs between front-end and back-end services.",
        "Refined the Ideal Customer Profile (ICP) with SDRs to sharpen pipeline accuracy and targeting.",
        "Ran customer discovery and product demos, feeding what I learned into product iterations and roadmap decisions.",
        "Drove customer onboarding, solution customisation and go-live.",
      ],
      tags: ["Startup", "Go-to-market", "LLMs"],
      award: "$30K revenue in 3 months",
    },
    {
      company: "Vajro",
      role: "Presales Consultant",
      period: "Jan 2022 — Jan 2023",
      location: "India",
      summary: "Presales for Vajro's mobile app platform: discovery, demos and solution blueprints.",
      highlights: [
        "Ran discovery sessions to understand client requirements and align them with Vajro's mobile app platform.",
        "Delivered sales presentations and technical product demos that showed product advantages and relevant use cases.",
        "Built trust with prospects alongside the sales team by answering technical concerns with customised solutions.",
        "Developed solution blueprints that clearly set out Vajro's value proposition.",
        "Planned account and territory strategies to find key stakeholders and grow accounts through upselling and cross-selling.",
        "Supported customers after the sale with troubleshooting and onboarding.",
      ],
      tags: ["Mobile commerce", "Demos", "Account strategy"],
    },
    {
      company: "Zoho Corporation",
      role: "Presales Engineer",
      period: "Oct 2020 — Dec 2021",
      location: "India",
      summary: "Technical partner to sales through the full cycle: live demos, POCs, SOWs and RFP responses.",
      highlights: [
        "Provided technical expertise to sales throughout the sales cycle, from proposal development to client engagement.",
        "Ran live product demonstrations and answered prospects' questions to speed up their decisions.",
        "Drafted Statements of Work (SOWs), Standard Operating Procedures (SOPs), Proofs of Concept (POCs) and responses to RFPs, RFIs and RFQs.",
        "Identified technical challenges early and delivered proactive solutions to prospects.",
        "Built lasting client relationships as a trusted technical advisor.",
      ],
      tags: ["Enterprise SaaS", "Zoho One", "POCs"],
      award: "Rockstar Rookie & Best Performer, 2021",
    },
    {
      company: "Infosys",
      role: "Presales & Platform Consultant",
      period: "Aug 2019 — Jul 2020",
      location: "India",
      summary: "Presales for Infosys platforms, including Cobalt and EdgeVerve, for enterprise customers.",
      highlights: [
        "Worked with sales and business development teams to solve clients' technical challenges with Infosys platforms, including Cobalt and EdgeVerve.",
        "Contributed to solution architecture and effort estimation in proposal documents.",
        "Delivered product and solution demonstrations tailored to clients across industries.",
        "Answered client inquiries with proofs of concept and responses to RFIs and RFPs, helping win new business.",
        "Advocated for Infosys platform solutions to meet the needs of enterprise customers.",
      ],
      tags: ["Enterprise", "Cloud platforms", "Solution architecture"],
      award: "Most Efficient Presales Player, Q1—Q3",
    },
  ],

  achievements: [
    {
      title: "Built a sales team from scratch",
      org: "BookingBee.ai · 2022",
      text: "Created the full go-to-market strategy, led team formation, trained the team on cold calling, solution selling and onboarding, and reached $30,000 in revenue within 3 months.",
    },
    {
      title: "Rockstar Rookie & Best Performer",
      org: "Zoho · 2021",
      text: "Recognised for tailored product demos that significantly increased Zoho One conversions, and named best performer for April, May, August and November 2021.",
    },
    {
      title: "Most Efficient Presales Player",
      org: "Infosys · Q1—Q3",
      text: "Achieved the highest number of presales conversions through strong technical pitches and close client collaboration.",
    },
    {
      title: "Client-centric innovation",
      org: "Across every role",
      text: "Routinely designed customised technical solutions that matched customer needs precisely and increased deal closures.",
    },
  ],

  services: [
    {
      title: "Presales & solution consulting",
      detail: "Discovery sessions, requirement analysis and tailored solution proposals that map the product to each client's real needs.",
      tags: ["Discovery", "Solution design", "Proposals"],
    },
    {
      title: "RFPs, RFQs & RFIs",
      detail: "Clear, persuasive responses, plus the SOWs, SOPs and POCs that move an evaluation forward.",
      tags: ["RFP", "SOW", "POC"],
    },
    {
      title: "Product demos",
      detail: "Technical demonstrations built around the buyer's own use cases, live or recorded.",
      tags: ["Live demos", "POCs", "Loom"],
    },
    {
      title: "AI/ML solutions",
      detail: "Prompt engineering, custom prompt pipelines and LLM fine-tuning for summarisation, Q&A, chatbots and data extraction.",
      tags: ["Prompt engineering", "LLMs", "Chatbots"],
    },
    {
      title: "API integrations",
      detail: "Designing, consuming and troubleshooting REST and GraphQL APIs so solutions work with the client's stack.",
      tags: ["REST", "GraphQL", "Postman"],
    },
    {
      title: "Go-to-market & enablement",
      detail: "Go-to-market plans for launches, ICP refinement with SDRs, and training sales teams on solution selling.",
      tags: ["GTM", "ICP", "Training"],
    },
  ],

  process: [
    { step: "Discover", detail: "Discovery sessions to understand the client's goals, current challenges and what success looks like." },
    { step: "Design", detail: "A tailored solution: proposals, blueprints and architecture, plus RFP, RFQ and RFI responses." },
    { step: "Demonstrate", detail: "Product demos and POCs that map features to the client's real use cases." },
    { step: "Deliver", detail: "A smooth hand-over to implementation with clear documentation, onboarding and post-sale support." },
  ],

  about: {
    paragraphs: [
      "I'm Ignatius Nirmal G, a presales and solutions engineer from Chennai with 5+ years in SaaS. I work between sales, product and engineering: I find out what a client really needs, then shape the solution, demo and proposal that gets them there.",
      "I've done this at enterprises like Zoho and Infosys and at fast-moving startups like Vajro, BookingBee.ai and impress.ai. That means responding to RFPs, RFQs and RFIs, building AI/ML solutions with prompt engineering and custom pipelines, and integrating APIs so it all works in the real world.",
      "I care about value-based selling, smooth customer onboarding and sales processes that scale.",
    ],
    facts: [
      { label: "Based in", value: "Chennai, Tamil Nadu, India" },
      { label: "Currently", value: "impress.ai" },
      { label: "Experience", value: "5+ years in SaaS" },
      { label: "Languages", value: "English & Tamil" },
    ],
  },

  toolbox: [
    { group: "CRM & ERP", items: ["Salesforce", "Zoho", "HubSpot"] },
    { group: "Sales intelligence", items: ["ZoomInfo", "Lusha", "Apollo.io", "Amplemarket"] },
    { group: "APIs & integration", items: ["Postman", "GraphQL Voyager", "Prisma"] },
    { group: "Code", items: ["HTML", "CSS", "JavaScript", "TypeScript", "Python", "VS Code", "Sublime Text"] },
    { group: "Demos & design", items: ["Loom", "Adobe Presenter Video Express", "Figma", "Adobe Photoshop", "Adobe Premiere Pro"] },
    { group: "Diagrams & whiteboards", items: ["Draw.io", "FigJam", "Miro"] },
    { group: "Project management", items: ["Jira", "Trello", "Asana"] },
    { group: "BI & reporting", items: ["Tableau", "Power BI", "Looker"] },
  ],

  competencies: [
    "Solution architecture", "Technical demonstrations", "Proposals & RFPs", "Presales & post-sales", "Value-based selling",
    "C-level stakeholder management", "REST & GraphQL APIs", "SDLC & agile", "Unit, integration & system testing",
    "Business development", "Account management & renewals", "Client retention", "Relationship management",
    "Presentation & communication", "Customer engagement & adoption", "Lead generation & prospecting", "Upselling & cross-selling",
    "Business reviews & documentation", "Leadership & team management", "Problem solving & strategy", "Training & onboarding",
    "Business analysis & user research", "Growth marketing & copywriting", "Webinars & slide decks", "SOPs",
    "Customer-centric mindset", "Troubleshooting", "Customer success", "Adoption & CSAT metrics", "Digital transformation",
  ],

  certifications: [
    { name: "Project Management Professional (PMP)", issuer: "Project Management Institute" },
    { name: "Certified Business Analysis Professional (CBAP)", issuer: "IIBA" },
    { name: "Certified ScrumMaster (CSM)", issuer: "Scrum Alliance" },
    { name: "Certified Management Consultant (CMC)", issuer: "Institute of Management Consultants" },
    { name: "IBM Product Manager Professional Certificate", issuer: "IBM · Coursera" },
    { name: "AI for Product Management", issuer: "Pendo" },
    { name: "Building Products in B2B SaaS", issuer: "GrowthSchool" },
    { name: "Fundamentals of Product Management", issuer: "Open Source" },
    { name: "SaaS in Cloud Computing", issuer: "Great Learning" },
    { name: "Customer Success", issuer: "Coursera" },
    { name: "API Integrations", issuer: "Udemy" },
  ],

  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/itsigni/" },
    { label: "GitHub", url: "https://github.com/workwithignatius-prog" },
  ],

  blogDescription: "Writing on presales, solution engineering, SaaS and AI.",

  // Greetings cycled on the home page's loading screen.
  greetings: ["Hello", "வணக்கம்", "नमस्ते", "Hola", "Bonjour", "Ciao", "こんにちは"],
};
