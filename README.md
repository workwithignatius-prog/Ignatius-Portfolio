# Ignatius-Portfolio

Portfolio and blog for Ignatius Nirmal G.

## Environments

| Branch | Environment | Address |
|--------|-------------|---------|
| `main` | Development preview (drafts visible, hidden from search engines) | https://itsigni.com/dev/ |
| `Prod` | Production, the live site | https://itsigni.com/ |

1. Make changes on `main`. The dev preview updates a minute or two after each push.
2. When it's ready to go live, open a pull request from `main` into `Prod` and merge it.
3. The **Deploy site** workflow rebuilds both addresses.

## Domain

The site lives at **itsigni.com**; www.itsigni.com and the old github.io address forward there.

- **Cloudflare** (DNS for itsigni.com): `itsigni.com` and `www` are CNAME records pointing to `workwithignatius-prog.github.io`, with the proxy **on** (orange cloud). Keep it on: the contact form's mail route only works through the proxy. Cloudflare also provides HTTPS; keep **SSL/TLS → Edge Certificates → Always Use HTTPS** on. The MX and TXT records are for email (Zoho, and Resend for no-reply@itsigni.com); leave them alone.
- **GitHub** (this repository's **Settings → Pages**): **Source** is **GitHub Actions** and **Custom domain** is `itsigni.com`. Don't switch the source to "Deploy from a branch": that publishes the raw repository instead of the built site.

## Where things live

| What | Where |
|------|-------|
| All page text: the hero, the intro, the quick chat, About, links | `site/content.js` |
| "The B-sides" (music, film, design, content, calisthenics, gym) | `passions` in `site/content.js`. Each has a `story` for the liner notes; add a `cover` image or a `link` (Spotify, YouTube, Instagram…) to any of them |
| Social links (hero, contact, footer) | `socials` in `site/content.js` |
| Blog posts | `site/blog/posts/` |
| Images | `site/assets/` (blog images in `site/assets/blog/`) |
| Page layouts | `site/*.html`, shared pieces in `site/_partials/`, the post layout in `site/_layouts/post.html` |
| Styles and scripts | `site/styles.css`, `site/script.js` |

Settings at the top of `site/content.js`:

- `calendlyUrl` — where every "Let's talk" button goes. Until it's set, they open the contact page.
- `formAccessKey` — the [Web3Forms](https://web3forms.com) access key (free, 250 messages a month). Every contact-form message is emailed to hello@itsigni.com, the inbox the Web3Forms account uses; replying answers the sender. The key is in the Web3Forms dashboard (app.web3forms.com → Forms). Without a key, the form opens the visitor's email app instead.
- `siteUrl` — the site's address, `https://itsigni.com`. It's used for link previews and the sitemap, and must match the custom domain in GitHub (see **Domain** above).

## Contact form

The contact page's form sends each message to the site's own mail route, **itsigni.com/api/contact**, a small Cloudflare Worker in `worker/`. For every message:

1. You get an email at hello@itsigni.com from **itsigni <no-reply@itsigni.com>**, styled like the site. Replying answers the visitor.
2. The visitor gets a thank-you from the same address, also styled like the site. Replying to it reaches hello@itsigni.com. It never repeats what was typed into the form, so the form can't be used to pass a message on to someone else.

[Resend](https://resend.com) sends both emails (free: 3,000 a month, up to 100 a day). If the mail route ever fails, the form sends the message through Web3Forms instead, and as a last resort opens the visitor's email app.

| What | Where |
|------|-------|
| Both email designs and their wording | `worker/src/email.js` |
| Checks, spam protection and sending | `worker/src/index.js` |
| Sender, recipient and the pages allowed to send | `[vars]` in `worker/wrangler.toml` |
| Tests | `worker/test/worker.test.mjs` |

- **Deploying:** a release to `Prod` that changes `worker/` deploys it through the **Deploy contact form** workflow. You can also run that workflow by hand from the **Actions** tab. It needs three repository secrets (**Settings → Secrets and variables → Actions**):
  - `CLOUDFLARE_API_TOKEN`: a Cloudflare API token made from the **Edit Cloudflare Workers** template.
  - `CLOUDFLARE_ACCOUNT_ID`: shown on the itsigni.com overview page in Cloudflare.
  - `RESEND_API_KEY`: a Resend API key with sending access.
- **Topics:** the form's topics (`contactTopics` in `site/content.js`) also appear in `TOPICS` in `worker/src/email.js`, which gives each one its colour. Change both together; the dev checks fail if they differ.
- **Spam:** a hidden field catches simple bots, only pages on itsigni.com can send, and each visitor can send 3 messages every 10 minutes.
- **When something goes wrong:** Cloudflare's **Workers & Pages → itsigni-contact → Logs** shows each time Resend turned an email down, and why. Resend's **Emails** page lists everything sent.

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

   `title` and `date` are required. Everything else is optional:
   - `excerpt`: the line on the blog cards (otherwise the first paragraph).
   - `tags`: group posts on the blog page.
   - `cover`: a portrait photo sits beside the title; a landscape one runs wide below it.
   - `coverAlt`: what the cover shows, for screen readers.
   - `coverPosition`: which part of the cover to keep when it's cropped, e.g. `50% 30%` keeps the top third.
   - `accent`: the post's colour: `red`, `blue`, `yellow`, `green`, `orange` or `teal`.
   - `order`: for posts with the same date, `1` comes first on the blog page.
   - `draft`: `true` keeps the post off the live site.
4. Commit to `main`. With `draft: true` the post only shows on the dev preview, so you can check it there.
5. To publish, delete the `draft: true` line, commit, then merge `main` into `Prod`.

Photos go in `site/assets/blog/`. Use them at full size: when the site is published, smaller copies are made automatically and each visitor's browser downloads the smallest one that looks sharp on their screen. In a post, the text in quotes after an image becomes its caption: `![A parrot on my shoulder](/assets/blog/bird.jpg "The moment it landed.")`. Put two or three images on lines next to each other to show them side by side; a landscape photo on its own runs wide.

Formatting, in Markdown:

- `## Heading` for a section, `### Smaller heading` for a sub-section.
- `**bold**`, `_italics_` and `[a link](https://example.com)`.
- A line starting with `>` becomes a large pull quote.
- Lists start with `-`, or `1.` for numbered ones.
- To end a post with a "Little things I noticed" card, wrap a heading and a list (keep the empty lines):

  ```
  <aside class="noticed">

  ### Little things I noticed

  - One small thing.
  - Another small thing.

  </aside>
  ```

The posts in `site/blog/posts/` show all of this in use.

## Preview on your computer

Needs [Node.js](https://nodejs.org) 18 or newer:

```
npm run dev
```

Then open http://localhost:8000. Drafts are included.
