# Ignatius-Portfolio

Portfolio and blog for Ignatius Nirmal G.

## Environments

| Branch | Environment | Address |
|--------|-------------|---------|
| `main` | Development preview (drafts visible, hidden from search engines) | https://workwithignatius-prog.github.io/Ignatius-Portfolio/dev/ |
| `Prod` | Production, the live site | https://workwithignatius-prog.github.io/Ignatius-Portfolio/ |

1. Make changes on `main`. The dev preview updates a minute or two after each push.
2. When it's ready to go live, open a pull request from `main` into `Prod` and merge it.
3. The **Deploy site** workflow rebuilds both addresses.

## Where things live

| What | Where |
|------|-------|
| All page text: the hero, the intro, the quick chat, About, links | `site/content.js` |
| "The B-sides" (music, film, design, content, calisthenics, gym) | `passions` in `site/content.js`. Each has a `story` for the liner notes; add a `cover` image or a `link` (Spotify, YouTube, Instagram…) to any of them |
| The quick chat on the home page | `chat` in `site/content.js`: `you` lines appear on the right, `me` lines on the left |
| Social links (hero, contact, footer) | `socials` in `site/content.js` |
| Blog posts | `site/blog/posts/` |
| Images | `site/assets/` (blog images in `site/assets/blog/`) |
| Page layouts | `site/*.html`, shared pieces in `site/_partials/`, the post layout in `site/_layouts/post.html` |
| Styles and scripts | `site/styles.css`, `site/script.js` |

Settings at the top of `site/content.js`:

- `calendlyUrl` — where every "Let's talk" button goes. Until it's set, they open the contact page.
- `formEndpoint` — a Formspree endpoint for the contact form. Until it's set, the form opens the visitor's email app.
- `siteUrl` — change this if you connect your own domain (for example `https://www.itsigni.com`).

## Write a blog post

1. On GitHub, open `site/blog/posts/` and choose **Add file → Create new file**.
2. Name it with the date and a short title: `2026-11-02-behind-my-latest-beat.md`. The part after the date becomes the address: `/blog/behind-my-latest-beat/`.
3. Start the file with this header, then write the post in Markdown below it:

   ```
   ---
   title: Behind my latest beat
   date: 2026-11-02
   excerpt: One or two sentences shown on the blog cards.
   tags: [Music, Process]
   cover: /assets/blog/latest-beat.jpg
   draft: true
   ---
   ```

   `title` and `date` are required. `excerpt`, `tags` and `cover` are optional.
4. Commit to `main`. With `draft: true` the post only shows on the dev preview, so you can check it there.
5. To publish, delete the `draft: true` line, commit, then merge `main` into `Prod`.

The example post `site/blog/posts/2026-10-28-how-to-write-a-post.md` shows every formatting option. It's a draft, so it never appears on the live site.

## Preview on your computer

Needs [Node.js](https://nodejs.org) 18 or newer:

```
npm run dev
```

Then open http://localhost:8000. Drafts are included.
