// All site content lives here. Edit this file to update the text on every page.
// Blog posts live in site/blog/posts/ (see README.md for how to write one).
window.PORTFOLIO = {
  name: "Ignatius",
  fullName: "Ignatius Nirmal G",
  handle: "itsigni",
  greeting: "Heyyya, I'm",
  heroBadge: "a.k.a. itsigni",
  role: "Presales & Solutions Engineer", // the day job: the hero says "… by day, and a music producer"
  tagline:
    "This is my corner of the internet: the music, films and designs I make, the content I create and the training in between.",
  status: "Ask me about music, films, design or training",
  metaDescription:
    "Ignatius Nirmal G (itsigni) from Chennai, India: music producer, ad film maker, designer and content creator who trains in calisthenics and the gym.",
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
  contactTopics: ["Just saying hi", "A collaboration", "Music", "An ad film or video", "Design", "Content", "Something else"],

  // The hero's second line cycles through these: "… by day, and a music producer"
  alsoRoles: ["music producer", "ad film maker", "designer", "content creator"],

  // "The B-sides": everything beyond the day job. Each one gets a generated album cover,
  // a chat bubble in the hero and a line in the liner notes.
  // art: music, film, design, content, calisthenics or gym. Optional: cover (an image
  // path, e.g. "assets/b-sides/music.jpg") and link (Spotify, YouTube, Instagram…).
  passions: [
    {
      title: "Music Producer",
      tagline: "Beats, mixes and sound design",
      story: "I make beats, mix tracks and design sounds, building each track from the first loop to the final mix.",
      art: "music", cover: "", link: "",
    },
    {
      title: "Ad Film Maker",
      tagline: "From concept to the final cut",
      story: "I make ad films: the idea, the script, the shoot and the edit, all the way to the final cut.",
      art: "film", cover: "", link: "",
    },
    {
      title: "Designer",
      tagline: "Brands, visuals and layouts",
      story: "I design brands, visuals and layouts, from logos to posts for the feed.",
      art: "design", cover: "", link: "",
    },
    {
      title: "Content Creator",
      tagline: "Stories for the feed",
      story: "I create content and share the stories behind everything else on this page.",
      art: "content", cover: "", link: "",
    },
    {
      title: "Calisthenics",
      tagline: "Bodyweight strength and skills",
      story: "Bodyweight strength and skills, trained on the bars and the floor.",
      art: "calisthenics", cover: "", link: "",
    },
    {
      title: "Gym",
      tagline: "Strength training",
      story: "Strength training in the gym, alongside the calisthenics.",
      art: "gym", cover: "", link: "",
    },
  ],

  statement:
    "By day I'm a presales and solutions engineer. The rest of the time I'm making beats, shooting ad films, designing, creating content or training, and this site is where all of it lives.",

  marquee: ["Music production", "Ad films", "Design", "Content", "Calisthenics", "Gym", "Chennai", "itsigni"],

  about: {
    paragraphs: [
      "I'm Ignatius Nirmal G, itsigni online, and I'm based in Chennai, India. By day, I'm a presales and solutions engineer.",
      "The rest of the time, I make things. I produce music: beats, mixes and sound design. I make ad films, from the first concept to the final cut. I design brands, visuals and layouts, and I create content and share the stories behind it.",
      "And I train: calisthenics for bodyweight strength and skills, and the gym for strength.",
      "This site is where all of it lives, along with a blog where I write about whatever I'm into.",
    ],
    facts: [
      { label: "Based in", value: "Chennai, India" },
      { label: "Online as", value: "@itsigni" },
      { label: "Day job", value: "Presales & Solutions Engineer" },
      { label: "Speaks", value: "English & தமிழ்" },
      { label: "Makes", value: "Music & ad films" },
      { label: "Designs", value: "Brands, visuals & layouts" },
      { label: "Creates", value: "Stories for the feed" },
      { label: "Trains", value: "Calisthenics & gym" },
    ],
  },

  // Shown in the hero ("Find me on"), the contact section and the footer.
  // Add Instagram, YouTube, Spotify, Behance… the same way.
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/itsigni/" },
    { label: "GitHub", url: "https://github.com/workwithignatius-prog" },
  ],

  blogDescription: "Notes on music, films, design, training and whatever else I'm into.",

  // Greetings cycled on the home page's loading screen.
  greetings: ["Hello", "வணக்கம்", "नमस्ते", "Hola", "Bonjour", "Ciao", "こんにちは"],
};
