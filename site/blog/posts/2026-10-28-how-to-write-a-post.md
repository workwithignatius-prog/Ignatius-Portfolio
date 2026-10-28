---
title: How to write a post on this blog
date: 2026-10-28
excerpt: A quick reference for writing posts here: front matter, headings, lists, quotes, images and code.
tags: [Guide, Writing]
draft: true
---

This post is a **draft**, so it only appears in the dev preview. Use it as a reference, then delete it or keep it as a draft.

## Start with the front matter

Every post begins with a few lines between two `---` markers:

```
---
title: What I learned from 100 product demos
date: 2026-11-02
excerpt: One or two sentences shown on the blog cards.
tags: [Presales, Demos]
cover: /assets/blog/100-demos.jpg
draft: true
---
```

- **title** and **date** are required.
- **excerpt** is optional. Without it, the first paragraph is used.
- **tags** group posts on the blog page.
- **cover** is optional. Put the image in `site/assets/blog/`.
- **draft: true** keeps the post out of the live site. Remove the line, or set it to `false`, to publish.

## Write in Markdown

Use `##` for section headings and `###` for smaller ones. Wrap words in `**` for **bold** and `_` for _italics_. Links look like [this](https://www.linkedin.com/in/itsigni/).

> Quotes start with a `>`. Use them for a line you want readers to remember.

1. Numbered lists start with `1.`
2. Bulleted lists start with `-`

![Add images like this](/assets/me.jpg)

| Table | Looks like |
| --- | --- |
| Discovery | Week 1 |
| Demo | Week 2 |

That's it. Save the file, and the post appears on the blog when the site is published.
