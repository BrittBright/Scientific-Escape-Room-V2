# The Mystery of the Moldy Petri Dish

A self-contained, browser-based scientific method escape room for introductory biology. It uses plain HTML, CSS, and JavaScript, so it can be hosted with GitHub Pages or opened from a public web address in Canvas.

## Run it locally

Open `index.html` in a modern browser. No install, build step, account, or server is required.

## Publish with GitHub Pages

1. Create a GitHub repository for the activity, or add these four files to the root of an existing repository: `index.html`, `styles.css`, `game.js`, and `README.md`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose the `main` branch and `/ (root)`, then save.
4. When GitHub Pages finishes publishing, share the Pages URL. Students can open it in a browser or follow the link from a Canvas page.

You can also add a link in Canvas using the published URL. If your Canvas instance permits embedded external content, this iframe can be added to a Canvas page's HTML editor:

```html
<iframe
  src="https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/"
  title="The Mystery of the Moldy Petri Dish"
  width="100%"
  height="850"
  style="border: 0;"
  allowfullscreen>
</iframe>
```

Replace the URL with the published GitHub Pages address. Canvas settings may block embeds, in which case a normal link works.

## Activity details

- Six ordered locks cover observation, question, hypothesis, experiment, results and analysis, and conclusion.
- Students receive one letter per correct answer. The final code is `BCBCAA`.
- Hints are available in each lock. There is no timer.
- Progress is stored locally in the student's browser. No student information is collected or transmitted.
- The follow-up measurements shown in Lock 5 are fictional teaching data, not Fleming's historical measurements.
- The ending distinguishes Fleming's initial observation from the later research needed to develop penicillin into a practical medicine.

## Canvas and grading

This is a static activity. It can be linked or embedded in Canvas, but it does not send scores or completion data to the Canvas gradebook. The answer checking runs in the browser, so it is intended for practice and discussion rather than secure assessment.

## Files

- `index.html` — activity content and illustrated lab scene
- `styles.css` — responsive layout and visual design
- `game.js` — puzzle logic, hints, local progress, and final code
- `README.md` — setup and hosting instructions
