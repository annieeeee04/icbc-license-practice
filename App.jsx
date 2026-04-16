import { useState, useCallback, useMemo } from "react";
import QUESTIONS from "./data.js";

const PAGE_SIZE = 20;
const TOTAL_PAGES = Math.ceil(QUESTIONS.length / PAGE_SIZE);

// ─── Option ──────────────────────────────────────────────────────────────────
function Option({ letter, text, status, onClick }) {
  const styles = {
    idle:     "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer",
    correct:  "border-green-500 bg-green-50 cursor-default",
    wrong:    "border-red-400   bg-red-50   cursor-default",
    reveal:   "border-green-500 bg-green-50 cursor-default",
    disabled: "border-gray-100 bg-gray-50   cursor-default opacity-50",
  };
  const keyColor = {
    idle: "text-blue-600", correct: "text-green-600",
    wrong: "text-red-500", reveal: "text-green-600", disabled: "text-gray-400",
  };
  return (
    <div
      className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border-2 text-sm leading-relaxed transition-all select-none ${styles[status]}`}
      onClick={onClick}
    >
      <span className={`font-bold min-w-[18px] mt-0.5 ${keyColor[status]}`}>{letter}.</span>
      <span>{text}</span>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ q, ans, onChoose }) {
  const chosen   = ans?.chosen;
  const revealed = ans?.revealed;
  const done     = chosen || revealed;
  const correct  = chosen === q.ans;

  function optStatus(key) {
    if (!done) return "idle";
    if (key === q.ans) return revealed ? "reveal" : "correct";
    if (key === chosen) return "wrong";
    return "disabled";
  }

  const borderColor = done
    ? correct ? "border-green-400" : "border-red-400"
    : "border-transparent";

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 ${borderColor} overflow-hidden transition-colors duration-200`}>
      {/* Blue header */}
      <div className="bg-blue-700 px-4 py-3 flex gap-2 items-start">
        <span className="font-bold text-white text-sm whitespace-nowrap pt-0.5">Q{q.num}.</span>
        <span className="text-white text-sm leading-relaxed">{q.text}</span>
      </div>

      {/* Diagram image */}
      {q.img && (
        <div className="flex justify-center px-4 pt-3 pb-1">
          <img
            src={q.img}
            alt={`Q${q.num} diagram`}
            loading="lazy"
            className="max-w-full rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Options */}
      <div className="p-3.5 grid gap-2">
        {["A", "B", "C", "D"].filter(k => q[k]).map(key => (
          <Option
            key={key}
            letter={key}
            text={q[key]}
            status={optStatus(key)}
            onClick={() => !done && onChoose(q.num, key)}
          />
        ))}
      </div>

      {/* Feedback */}
      {done && (
        <div className={`px-4 pb-3 text-sm font-semibold ${
          revealed ? "text-amber-600" : correct ? "text-green-600" : "text-red-500"
        }`}>
          {revealed
            ? `Answer revealed: ${q.ans}`
            : correct
            ? "✓ Correct!"
            : `✗ Wrong — correct answer: ${q.ans}`}
        </div>
      )}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function Modal({ open, title, body, confirmLabel, danger, onConfirm, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{body}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white font-semibold text-sm transition-colors ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [modal, setModal]     = useState(null); // null | { scope: 'set' | 'all' }

  const pageQs = useMemo(
    () => QUESTIONS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [page]
  );

  const stats = useMemo(() => {
    const correct    = QUESTIONS.filter(q => answers[q.num]?.chosen === q.ans).length;
    const done       = QUESTIONS.filter(q => answers[q.num]?.chosen || answers[q.num]?.revealed).length;
    const setCorrect = pageQs.filter(q => answers[q.num]?.chosen === q.ans).length;
    const setDone    = pageQs.filter(q => answers[q.num]?.chosen || answers[q.num]?.revealed).length;
    return { correct, done, setCorrect, setDone };
  }, [answers, pageQs]);

  const choose = useCallback((qnum, key) => {
    setAnswers(prev => ({ ...prev, [qnum]: { chosen: key } }));
  }, []);

  const revealSet = useCallback(() => {
    setAnswers(prev => {
      const next = { ...prev };
      pageQs.forEach(q => { if (!next[q.num]?.chosen) next[q.num] = { revealed: true }; });
      return next;
    });
  }, [pageQs]);

  const doReset = useCallback(() => {
    if (modal?.scope === "all") {
      setAnswers({});
    } else {
      setAnswers(prev => {
        const next = { ...prev };
        pageQs.forEach(q => delete next[q.num]);
        return next;
      });
    }
    setModal(null);
  }, [modal, pageQs]);

  const goPage = (p) => {
    if (p < 0 || p >= TOTAL_PAGES) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dot color for each set button
  function dotClass(p) {
    const qs   = QUESTIONS.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);
    const done = qs.filter(q => answers[q.num]?.chosen || answers[q.num]?.revealed).length;
    if (done === qs.length) return "bg-green-400";
    if (done > 0)           return "bg-amber-400";
    return "";
  }

  const allFinished = stats.done === 200;
  const pct = allFinished ? Math.round(stats.correct / 200 * 100) : null;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">

      {/* ── Sticky header ── */}
      <header className="bg-blue-700 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-bold text-base flex-1 min-w-[140px]">🚗 ICBC Practice Test</h1>
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
              {stats.correct} correct · {stats.done} answered
            </span>
            <button
              onClick={revealSet}
              className="bg-white text-blue-700 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Show Set Answers
            </button>
            <button
              onClick={() => setModal({ scope: "set" })}
              className="bg-white text-blue-700 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Reset Set
            </button>
            <button
              onClick={() => setModal({ scope: "all" })}
              className="bg-white/15 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-white/25 transition-colors whitespace-nowrap"
            >
              Reset All
            </button>
          </div>
          {/* Global progress bar */}
          <div className="mt-2.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-300 rounded-full transition-all duration-300"
              style={{ width: `${stats.done / 200 * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── Set jump bar ── */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 mr-1 whitespace-nowrap">Jump to set:</span>
          {Array.from({ length: TOTAL_PAGES }, (_, p) => {
            const start  = p * PAGE_SIZE + 1;
            const end    = Math.min((p + 1) * PAGE_SIZE, 200);
            const active = p === page;
            const dot    = dotClass(p);
            return (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={`relative text-xs font-medium px-3 py-1.5 rounded-full border-2 transition-all whitespace-nowrap
                  ${active
                    ? "bg-blue-700 border-blue-700 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-400"}`}
              >
                {start}–{end}
                {dot && (
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dot}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Set score strip */}
        <div className="mt-3 bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Set {page + 1} · Q{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, 200)}
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-300"
              style={{ width: `${stats.setDone / pageQs.length * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-blue-700 whitespace-nowrap">
            {stats.setCorrect} / {pageQs.length}
          </span>
        </div>
      </div>

      {/* ── Question cards ── */}
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-6 grid gap-4">
        {pageQs.map(q => (
          <QuestionCard key={q.num} q={q} ans={answers[q.num]} onChoose={choose} />
        ))}
      </div>

      {/* ── Finish banner ── */}
      {allFinished && (
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-2xl p-7 text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-2">
              {pct >= 80 ? "🎉 You Passed!" : "📝 Test Complete"} {pct}%
            </h2>
            <p className="opacity-90 mb-5">
              {stats.correct} correct out of 200.{" "}
              {pct >= 80 ? "Great job!" : "Keep practising — 80% needed to pass."}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => setModal({ scope: "set" })}
                className="bg-white text-blue-700 rounded-xl px-5 py-2 font-bold text-sm"
              >
                Reset This Set
              </button>
              <button
                onClick={() => setModal({ scope: "all" })}
                className="bg-white/20 text-white rounded-xl px-5 py-2 font-bold text-sm"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pagination nav ── */}
      <div className="max-w-3xl mx-auto px-4 pb-12 flex justify-between items-center gap-4">
        <button
          disabled={page === 0}
          onClick={() => goPage(page - 1)}
          className="px-6 py-2.5 rounded-xl bg-blue-700 text-white font-semibold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-500 text-center">
          Questions {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, 200)} of 200
        </span>
        <button
          disabled={page === TOTAL_PAGES - 1}
          onClick={() => goPage(page + 1)}
          className="px-6 py-2.5 rounded-xl bg-blue-700 text-white font-semibold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* ── Confirm modal ── */}
      <Modal
        open={!!modal}
        title={modal?.scope === "all" ? "Reset all 200 questions?" : "Reset this set?"}
        body={
          modal?.scope === "all"
            ? "This will clear all your answers across all 10 sets. This cannot be undone."
            : "This will clear your answers for the current 20 questions only."
        }
        confirmLabel={modal?.scope === "all" ? "Yes, reset all" : "Yes, reset set"}
        danger={modal?.scope === "all"}
        onConfirm={doReset}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
