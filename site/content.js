// All site content lives here. Edit this file to update the text on every page.
// Blog posts live in site/blog/posts/ (see README.md for how to write one).
window.PORTFOLIO = {
  name: "Ignatius",
  fullName: "Ignatius Nirmal G",
  handle: "itsigni",
  greeting: "Heyyya, I'm",
  heroBadge: "a.k.a. itsigni",
  role: "Presales & Solutions Engineer", // the day job: the hero says "By day, I'm a …"
  // The hero's big line. Each passion's `word` below is underlined in that passion's colour
  // and links to its record in the B-sides.
  headline: "I make music, films & designs, create content and train.",
  tagline:
    "This is my corner of the internet: the music, films and designs I make, the content I create and the training in between.",
  metaDescription:
    "Ignatius Nirmal G (itsigni) from Chennai, India: music producer, ad film maker, designer and content creator who trains in calisthenics and the gym.",
  location: "Chennai, India",
  city: "Chennai", // the postage stamp and the "My base" card
  region: "Tamil Nadu, India",
  timezone: "Asia/Kolkata", // IANA zone for the live clock
  timezoneLabel: "IST",
  available: true,
  availability: "Taking requests: collabs, gigs & new roles",
  email: "hello@itsigni.com",

  // The live address of the site, used in share links, the RSS feed and the sitemap.
  // Change it when you connect your own domain, e.g. "https://www.itsigni.com".
  siteUrl: "https://workwithignatius-prog.github.io/Ignatius-Portfolio",

  photo: "assets/me.jpg",

  // A short silent film that plays inside the hero portrait. It starts and ends on the photo
  // and spins through each passion. `scenes` gives the second at which each passion (its place
  // in `passions` below, from 0) takes over, so its word and bubble light up with it; -1 is the photo.
  heroFilm: {
    src: "assets/clips/hero-film.mp4",
    scenes: [
      { passion: 0, at: 2.2 }, // concert grand piano: front, three-quarter and the crowd
      { passion: 1, at: 9.9 }, // directing an ad film: "Action!", the monitor, the camera
      { passion: 2, at: 18.6 }, // painting the portrait as Leonardo da Vinci
      { passion: 3, at: 22.4 }, // vlogging in Paris (with a drone shot), then Santorini
      { passion: 4, at: 34.2 }, // pull-ups and a pistol squat at sunset
      { passion: 5, at: 39.7 }, // dumbbell curls in the gym
      { passion: -1, at: 43.4 }, // spinning back into the photo
    ],
  },

  // "Let's talk" buttons open this link. Until it's set they open the contact page.
  calendlyUrl: "", // e.g. "https://calendly.com/itsigni/30min"

  // Contact form: every message is emailed to you through Web3Forms (free, 250 a month).
  // Get a key at https://web3forms.com by entering the inbox that should receive the
  // messages, then paste it here. The key is safe to publish: it never reveals your address.
  // Until it's set, the form opens the visitor's email app with the message filled in.
  formAccessKey: "",
  contactTopics: ["Just saying hi", "A collaboration", "Music", "An ad film or video", "Design", "Content", "Something else"],

  // "The B-sides": everything beyond the day job. Each one gets a generated album cover,
  // a chat bubble in the hero, a line in the liner notes and, if its `word` appears in the
  // headline, a coloured underline there.
  // art: music, film, design, content, calisthenics or gym. Optional: cover (an image
  // path, e.g. "assets/b-sides/music.jpg") and link (Spotify, YouTube, Instagram…).
  passions: [
    {
      title: "Music Producer",
      tagline: "Beats, mixes and sound design",
      story: "I make beats, mix tracks and design sounds, building each track from the first loop to the final mix.",
      art: "music", word: "music", cover: "", link: "",
    },
    {
      title: "Ad Film Maker",
      tagline: "From concept to the final cut",
      story: "I make ad films: the idea, the script, the shoot and the edit, all the way to the final cut.",
      art: "film", word: "films", cover: "", link: "",
    },
    {
      title: "Designer",
      tagline: "Brands, visuals and layouts",
      story: "I design brands, visuals and layouts, from logos to posts for the feed.",
      art: "design", word: "designs", cover: "", link: "",
    },
    {
      title: "Content Creator",
      tagline: "Stories for the feed",
      story: "I create content and share the stories behind everything else on this page.",
      art: "content", word: "content", cover: "", link: "",
    },
    {
      title: "Calisthenics",
      tagline: "Bodyweight strength and skills",
      story: "Bodyweight strength and skills, trained on the bars and the floor.",
      art: "calisthenics", word: "train", cover: "", link: "",
    },
    {
      title: "Gym",
      tagline: "Strength training",
      story: "Strength training in the gym, alongside the calisthenics.",
      art: "gym", cover: "", link: "",
    },
  ],

  // The intro line under the hero. Wrap words in *stars* to colour them.
  statement:
    "Think of this site as a record. The day job is *side A.* Everything I love making is on the *B-side,* so flip it over and hit play.",

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
