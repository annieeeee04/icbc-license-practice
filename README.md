# ICBC License Practice

A web app for practising ICBC (Insurance Corporation of British Columbia) knowledge test questions. Built with React, Vite, and Tailwind CSS.

🔗 **Live app:** [https://icbc-license-practice.vercel.app/](https://icbc-license-practice.vercel.app/)

---

## How to Use

### Answering Questions

- Questions are displayed in pages of 20.
- Click an answer option to submit your answer — it will turn **green** if correct or **red** if wrong.
- The correct answer is always highlighted after you answer.
- To undo a submitted answer, **double-click** the option you chose, or click the **undo** link below the question.

### Navigation

- Use the **← Prev** and **Next →** buttons at the bottom to move between pages.
- Your progress and answers are tracked across all pages during the session.

### Show Answers / Reveal All

- Click **Show Answers** in the header to reveal the correct answer for every unanswered question on the current page without penalising your score.

### Score & Progress Bar

- A progress bar at the top of the page fills as you answer questions.
- Your running score (e.g. *18 / 20 correct*) is shown in the header.

### Practice Wrong Questions

- Once you've worked through some questions, a **Practice Wrong** button appears in the header.
- This opens a dedicated mode (orange theme) that shows only the questions you got wrong, so you can drill them until you get them right.
- Inside Practice Wrong mode you can **Show Answers**, **Reset** your attempts, and navigate through pages of wrong answers just like the main view.
- When you've answered all wrong questions, your percentage score is shown.

### Reset All Progress

- Click the **Reset** button in the header to clear all your answers and start fresh. A confirmation dialog will appear before anything is deleted.

---

## Running Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
npm run build   # production build
npm run preview # preview the production build locally
```
