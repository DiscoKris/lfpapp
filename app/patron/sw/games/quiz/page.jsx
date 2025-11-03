// app/patron/sw/games/quiz/page.jsx
"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const QUESTION_COUNT = 10;
const EASY_PICK = 8;
const HARD_PICK = 2;

const QUESTION_BANK = [
  {
    id: "easy-1",
    difficulty: "easy",
    question:
      "What fruit does the Evil Queen use to poison Snow White?",
    options: ["Apple", "Pear", "Grape", "Peach"],
    answerIndex: 0,
  },
  {
    id: "easy-2",
    difficulty: "easy",
    question:
      "Who shelters Snow White after she escapes the forest?",
    options: [
      "The Seven Dwarfs",
      "Forest soldiers",
      "Castle guards",
      "Hunters",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-3",
    difficulty: "easy",
    question: "What color is Snow White's hair?",
    options: ["Black", "Golden", "Brown", "Silver"],
    answerIndex: 0,
  },
  {
    id: "easy-4",
    difficulty: "easy",
    question: "What job do the dwarfs do in the mine?",
    options: [
      "Mine for gems",
      "Go fishing",
      "Bake bread",
      "Tend sheep",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-5",
    difficulty: "easy",
    question: "Which dwarf wears glasses and acts as the leader?",
    options: ["Doc", "Sleepy", "Sneezy", "Bashful"],
    answerIndex: 0,
  },
  {
    id: "easy-6",
    difficulty: "easy",
    question: "Which dwarf is known for never speaking?",
    options: ["Dopey", "Sleepy", "Bashful", "Grumpy"],
    answerIndex: 0,
  },
  {
    id: "easy-7",
    difficulty: "easy",
    question: "Which dwarf is always tired?",
    options: ["Doc", "Sleepy", "Happy", "Bashful"],
    answerIndex: 1,
  },
  {
    id: "easy-8",
    difficulty: "easy",
    question: "What color bow does Snow White wear in her hair?",
    options: ["Red", "Blue", "Green", "Purple"],
    answerIndex: 0,
  },
  {
    id: "easy-9",
    difficulty: "easy",
    question: "Where does Snow White first meet the Prince?",
    options: [
      "By the wishing well",
      "In the dwarfs' cottage",
      "At the castle ballroom",
      "In a forest clearing",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-10",
    difficulty: "easy",
    question:
      "Which song does Snow White sing about her dreams coming true?",
    options: [
      "Someday My Prince Will Come",
      "Let It Go",
      "Once Upon a Dream",
      "When You Wish Upon a Star",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-11",
    difficulty: "easy",
    question: "What do the dwarfs mine for each day?",
    options: [
      "Diamonds and gems",
      "Coal for the castle",
      "Glittering shells",
      "Gold coins",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-12",
    difficulty: "easy",
    question:
      "Which forest friends help Snow White tidy the dwarfs' cottage?",
    options: [
      "Forest animals",
      "Castle guards",
      "Visiting fairies",
      "Traveling merchants",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-13",
    difficulty: "easy",
    question: "How many dwarfs share the cottage with Snow White?",
    options: ["Seven", "Five", "Eight", "Six"],
    answerIndex: 0,
  },
  {
    id: "easy-14",
    difficulty: "easy",
    question:
      "Who asks the Magic Mirror 'Who is the fairest one of all?'",
    options: [
      "The Evil Queen",
      "Snow White",
      "Prince Florian",
      "Grumpy",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-15",
    difficulty: "easy",
    question: "What color is Snow White's skirt?",
    options: ["Yellow", "Red", "Blue", "White"],
    answerIndex: 0,
  },
  {
    id: "easy-16",
    difficulty: "easy",
    question: "What dessert does Snow White bake for the dwarfs?",
    options: [
      "Gooseberry pie",
      "Apple tart",
      "Pumpkin pie",
      "Cherry crumble",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-17",
    difficulty: "easy",
    question:
      "What disguise does the Evil Queen use to trick Snow White?",
    options: [
      "An old peddler woman",
      "A brave knight",
      "A princess in distress",
      "A fairy godmother",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-18",
    difficulty: "easy",
    question: "Who warns Snow White not to let strangers inside?",
    options: [
      "The dwarfs",
      "The Magic Mirror",
      "The huntsman",
      "The Queen",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-19",
    difficulty: "easy",
    question:
      "What does the huntsman bring back to fool the Queen?",
    options: [
      "A pig's heart",
      "A golden apple",
      "A silver ring",
      "A poisoned comb",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-20",
    difficulty: "easy",
    question:
      "What breaks Snow White's sleeping curse?",
    options: [
      "True love's kiss",
      "A magic potion",
      "A thunderstorm",
      "A musical spell",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-21",
    difficulty: "easy",
    question:
      "Where does the Queen offer Snow White the apple?",
    options: [
      "At the dwarfs' cottage door",
      "In the castle throne room",
      "Beside the wishing well",
      "At the market square",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-22",
    difficulty: "easy",
    question: "Which dwarf is known for constant cheer and giggles?",
    options: ["Happy", "Grumpy", "Doc", "Sneezy"],
    answerIndex: 0,
  },
  {
    id: "easy-23",
    difficulty: "easy",
    question: "Which dwarf struggles with unstoppable sneezes?",
    options: ["Sneezy", "Bashful", "Sleepy", "Happy"],
    answerIndex: 0,
  },
  {
    id: "easy-24",
    difficulty: "easy",
    question:
      "What word is carved above the dwarfs' cottage door?",
    options: ["Welcome", "Home", "Dwarfs", "Beware"],
    answerIndex: 0,
  },
  {
    id: "hard-1",
    difficulty: "hard",
    question:
      "What name is sometimes used for Snow White's prince in early story materials?",
    options: [
      "Prince Florian",
      "Prince Charming",
      "Prince Eric",
      "Prince Philip",
    ],
    answerIndex: 0,
  },
  {
    id: "hard-2",
    difficulty: "hard",
    question:
      "Which dwarf plays the organ-like instrument during the cottage song?",
    options: ["Grumpy", "Doc", "Happy", "Bashful"],
    answerIndex: 0,
  },
  {
    id: "hard-3",
    difficulty: "hard",
    question:
      "Which ingredient does the Queen call for to brew her transformation potion?",
    options: [
      "Mummy dust",
      "Dragon scale",
      "Phoenix feather",
      "Mermaid tears",
    ],
    answerIndex: 0,
  },
  {
    id: "hard-4",
    difficulty: "hard",
    question:
      "What color swirls inside the Queen's cauldron as she transforms?",
    options: ["Green", "Blue", "Purple", "Red"],
    answerIndex: 0,
  },
  {
    id: "hard-5",
    difficulty: "hard",
    question:
      "In some storybooks, what name is given to the huntsman who spares Snow White?",
    options: ["Humbert", "Gerald", "Cedric", "Leopold"],
    answerIndex: 0,
  },
  {
    id: "hard-6",
    difficulty: "hard",
    question:
      "What causes the Evil Queen to fall from the cliff while fleeing the dwarfs?",
    options: [
      "A lightning strike",
      "A crumbling bridge",
      "A sudden avalanche",
      "A gust of wind",
    ],
    answerIndex: 0,
  },
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickQuestions() {
  const easy = shuffle(
    QUESTION_BANK.filter((q) => q.difficulty === "easy")
  ).slice(0, EASY_PICK);
  const hard = shuffle(
    QUESTION_BANK.filter((q) => q.difficulty === "hard")
  ).slice(0, HARD_PICK);
  return shuffle([...easy, ...hard]);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function SnowWhiteQuizPage() {
  const [questions, setQuestions] = useState(() => pickQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array(QUESTION_COUNT).fill(null)
  );
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState(
    `Question 1 of ${QUESTION_COUNT}`
  );
  const [lastResult, setLastResult] = useState(null);

  const timerRef = useRef(null);
  const advanceRef = useRef(null);
  const scoreRef = useRef(0);

  const isQuizComplete = currentIndex >= QUESTION_COUNT;
  const questionNumber = Math.min(currentIndex + 1, QUESTION_COUNT);

  const currentQuestion = useMemo(() => {
    if (isQuizComplete) return null;
    return questions[currentIndex];
  }, [isQuizComplete, questions, currentIndex]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearAdvanceTimeout = useCallback(() => {
    if (advanceRef.current) {
      clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
  }, []);

  const resetQuiz = useCallback(() => {
    clearAdvanceTimeout();
    stopTimer();
    setQuestions(pickQuestions());
    setCurrentIndex(0);
    setSelectedAnswers(Array(QUESTION_COUNT).fill(null));
    setScore(0);
    scoreRef.current = 0;
    setElapsed(0);
    setLiveAnnouncement(`Question 1 of ${QUESTION_COUNT}`);
    startTimer();
  }, [clearAdvanceTimeout, startTimer, stopTimer]);

  const handleRestart = useCallback(() => {
    resetQuiz();
  }, [resetQuiz]);

  const handlePlayAgain = useCallback(() => {
    resetQuiz();
  }, [resetQuiz]);

  useEffect(() => {
    startTimer();
    try {
      const stored = sessionStorage.getItem("sw-quiz:last");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          typeof parsed.score === "number" &&
          typeof parsed.time === "number"
        ) {
          setLastResult(parsed);
        }
      }
    } catch {
      // ignore
    }
    return () => {
      stopTimer();
      clearAdvanceTimeout();
    };
  }, [startTimer, stopTimer, clearAdvanceTimeout]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (!isQuizComplete) return;
    stopTimer();
    clearAdvanceTimeout();
    try {
      const result = { score: scoreRef.current, time: elapsed };
      sessionStorage.setItem("sw-quiz:last", JSON.stringify(result));
      setLastResult(result);
    } catch {
      // ignore storage errors
    }
    setLiveAnnouncement(
      `Quiz complete. Score ${scoreRef.current}/${QUESTION_COUNT}`
    );
  }, [isQuizComplete, stopTimer, clearAdvanceTimeout, elapsed]);

  useEffect(() => {
    if (isQuizComplete) return;
    setLiveAnnouncement(`Question ${currentIndex + 1} of ${QUESTION_COUNT}`);
  }, [currentIndex, isQuizComplete]);

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (!currentQuestion) return;
      if (selectedAnswers[currentIndex] !== null) return;

      const isCorrect = optionIndex === currentQuestion.answerIndex;
      const updatedSelections = [...selectedAnswers];
      updatedSelections[currentIndex] = optionIndex;
      setSelectedAnswers(updatedSelections);

      const updatedScore = score + (isCorrect ? 1 : 0);
      setScore(updatedScore);
      scoreRef.current = updatedScore;

      setLiveAnnouncement(isCorrect ? "Correct" : "Wrong");

      clearAdvanceTimeout();
      const nextIndex = currentIndex + 1;

      advanceRef.current = setTimeout(() => {
        if (nextIndex >= QUESTION_COUNT) {
          setCurrentIndex(nextIndex);
        } else {
          setCurrentIndex(nextIndex);
        }
        advanceRef.current = null;
      }, 800);
    },
    [
      currentQuestion,
      selectedAnswers,
      currentIndex,
      clearAdvanceTimeout,
      score,
    ]
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const selected = selectedAnswers[currentIndex];
    const reveal = selected !== null;

    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Q{questionNumber.toString().padStart(2, "0")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold leading-snug">
          {currentQuestion.question}
        </h2>
        <div className="mt-6 flex flex-col gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = idx === currentQuestion.answerIndex;
            const isSelected = idx === selected;
            const baseStyles =
              "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#260000]";
            const hoverStyles = reveal ? "" : "hover:bg-white/10";
            let stateStyles = "";
            if (reveal) {
              if (isCorrect) {
                stateStyles = "bg-[#1f7a1f] border-white/20 text-white";
              } else if (isSelected) {
                stateStyles = "bg-[#7a0000] border-white/20 text-white opacity-90";
              } else {
                stateStyles = "bg-white/5 border-white/20 opacity-80";
              }
            }
            return (
              <button
                key={option}
                type="button"
                disabled={reveal}
                className={`${baseStyles} ${hoverStyles} ${stateStyles}`}
                onClick={() => handleAnswer(idx)}
                aria-pressed={reveal ? isSelected || isCorrect : false}
              >
                <span className="text-base font-medium">{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!isQuizComplete) return null;

    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <h2 className="text-3xl font-semibold">Quiz Complete</h2>
        <p className="mt-2 text-lg text-white/80">
          Score{" "}
          <span className="font-semibold text-white">
            {scoreRef.current}/{QUESTION_COUNT}
          </span>
        </p>
        <p className="text-lg text-white/80">
          Time{" "}
          <span className="font-semibold text-white">
            {formatTime(elapsed)}
          </span>
        </p>
        {lastResult && (
          <p className="mt-2 text-sm text-white/60">
            Previous best: {lastResult.score}/{QUESTION_COUNT} ·{" "}
            {formatTime(lastResult.time)}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">
            Review
          </h3>
          <ol className="space-y-3 text-sm text-white/90">
            {questions.map((question, idx) => {
              const userAnswer = selectedAnswers[idx];
              const correctText = question.options[question.answerIndex];
              const gotItRight = userAnswer === question.answerIndex;
              return (
                <li
                  key={question.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium">
                      {idx + 1}. {question.question}
                    </p>
                    <span
                      className={`text-lg ${
                        gotItRight ? "text-[#7be27b]" : "text-[#ff8a8a]"
                      }`}
                      aria-hidden
                    >
                      {gotItRight ? "✅" : "❌"}
                    </span>
                  </div>
                  <p className="mt-2 text-white/70">
                    Correct answer:{" "}
                    <span className="font-semibold text-white">
                      {correctText}
                    </span>
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handlePlayAgain}
            className="w-full rounded-2xl border border-white/10 bg-[#b60000] px-4 py-3 text-center text-base font-semibold transition hover:bg-[#cc0000] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Play Again
          </button>
          <Link
            href="/patron/sw/games"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-base font-semibold transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Back to Games
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#260000] via-[#3a0000] to-black text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-16 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/patron/sw/games"
            className="w-fit rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            ← Back
          </Link>
          <div className="text-center sm:text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Snow White Games
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Quiz
            </h1>
          </div>
          {!isQuizComplete ? (
            <button
              type="button"
              onClick={handleRestart}
              className="w-fit rounded-xl border border-white/10 bg-[#b60000] px-4 py-2 text-sm font-semibold hover:bg-[#cc0000] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Restart
            </button>
          ) : (
            <div className="h-10 w-px" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span>Timer: {formatTime(elapsed)}</span>
            <span>
              Q {questionNumber}/{QUESTION_COUNT}
            </span>
          </div>
          <span aria-live="polite" className="text-xs text-white/60">
            {liveAnnouncement}
          </span>
        </div>

        {isQuizComplete ? renderResults() : renderQuestion()}
      </div>
    </div>
  );
}
