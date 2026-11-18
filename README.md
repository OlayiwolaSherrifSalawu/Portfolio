# Olayiwola Salawu · Portfolio

A scroll-driven 3D portfolio. Each project floats in a dark scene as a phone, laptop or monitor, and the camera flies to it as you scroll.

Built with Next.js, React Three Fiber and drei.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Edit content

Everything you'd want to change is in `lib/content.ts`:

- `profile`: name, title, intro, and contact links (`email`, `linkedin`, `x` and `cv` are hidden while empty)
- `projects`: the five featured projects, in scroll order
- `stellarWork` and `skills`

### Real screenshots

Device screens are drawn in code (`lib/screens.ts`). To use a real screenshot instead, put the image in `public/screens/` and set `screenshot: "/screens/tpay.png"` on that project. Phone screens are about 9:19 portrait and laptop screens about 16:10.

## Deploy

Push to GitHub and import the repo at vercel.com. No extra settings are needed.
