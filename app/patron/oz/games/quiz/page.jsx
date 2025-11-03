// app/patron/oz/games/quiz/page.jsx
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
    id: "easy-oz-1",
    difficulty: "easy",
    question: "Where does Dorothy live before the tornado?",
    options: ["Kansas", "Nebraska", "Missouri", "Texas"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-2",
    difficulty: "easy",
    question: "What is Dorothy's dog's name?",
    options: ["Toto", "Buddy", "Max", "Copper"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-3",
    difficulty: "easy",
    question: "Which color are Dorothy's magical slippers in the film?",
    options: ["Ruby red", "Emerald green", "Golden yellow", "Silver"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-4",
    difficulty: "easy",
    question: "What famous line does Dorothy repeat to go home?",
    options: [
      "There's no place like home",
      "Click your heels three times",
      "Follow the yellow brick road",
      "We're off to see the Wizard",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-oz-5",
    difficulty: "easy",
    question: "Which character wants a brain?",
    options: ["Scarecrow", "Tin Man", "Cowardly Lion", "Glinda"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-6",
    difficulty: "easy",
    question: "Which character desires a heart?",
    options: ["Tin Man", "Scarecrow", "Cowardly Lion", "Wizard"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-7",
    difficulty: "easy",
    question: "Who is searching for courage?",
    options: ["Cowardly Lion", "Tin Man", "Scarecrow", "Dorothy"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-8",
    difficulty: "easy",
    question: "What must Dorothy follow to reach the Emerald City?",
    options: [
      "The Yellow Brick Road",
      "The Silver River",
      "The Rainbow Bridge",
      "The Oz Express",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-oz-9",
    difficulty: "easy",
    question: "Which witch rules the North and helps Dorothy?",
    options: ["Glinda", "Elphaba", "Mombi", "Evanora"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-10",
    difficulty: "easy",
    question: "What does the Wicked Witch of the West use to spy on Dorothy?",
    options: ["A crystal ball", "Magic mirror", "Flying book", "Golden telescope"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-11",
    difficulty: "easy",
    question: "Which flowers make Dorothy and her friends fall asleep?",
    options: ["Poppies", "Daisies", "Lilies", "Roses"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-12",
    difficulty: "easy",
    question: "What does the Wizard use to travel back to Kansas?",
    options: ["A hot air balloon", "A magic broom", "An emerald carriage", "A flying house"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-13",
    difficulty: "easy",
    question: "What musical number features the line “We're off to see the Wizard”?",
    options: [
      "We're Off to See the Wizard",
      "If I Only Had a Brain",
      "Follow the Yellow Brick Road",
      "Ding-Dong! The Witch Is Dead",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-oz-14",
    difficulty: "easy",
    question: "Who melts when splashed with water?",
    options: [
      "The Wicked Witch of the West",
      "Glinda",
      "The Wizard",
      "The munchkin mayor",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-oz-15",
    difficulty: "easy",
    question: "Which city is the Wizard's home?",
    options: ["Emerald City", "Rubyville", "Sapphire Town", "Topaz City"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-16",
    difficulty: "easy",
    question: "Who greets Dorothy with the phrase “You killed her so completely that we thank you very sweetly!”?",
    options: ["The munchkins", "Winged monkeys", "Emerald guards", "The Winkies"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-17",
    difficulty: "easy",
    question: "What song does Dorothy sing while longing for a better place?",
    options: [
      "Over the Rainbow",
      "Circle of Life",
      "Defying Gravity",
      "A Dream Is a Wish Your Heart Makes",
    ],
    answerIndex: 0,
  },
  {
    id: "easy-oz-18",
    difficulty: "easy",
    question: "What is the main color scheme of the Emerald City guards?",
    options: ["Green uniforms", "Blue capes", "Red armor", "Silver suits"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-19",
    difficulty: "easy",
    question: "What signals the start of Dorothy's journey to Oz?",
    options: ["A tornado", "A snowstorm", "A rainbow", "An earthquake"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-20",
    difficulty: "easy",
    question: "What does Glinda's bubble represent?",
    options: ["Her arrival", "A shield", "A prison", "A disguise"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-21",
    difficulty: "easy",
    question: "What does the Tin Man carry as a weapon?",
    options: ["An axe", "A sword", "A hammer", "A lance"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-22",
    difficulty: "easy",
    question: "What do the Winged Monkeys obey to capture Dorothy?",
    options: ["The Golden Cap", "The Silver Shoes", "The Emerald Pendant", "The Wizard's whistle"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-23",
    difficulty: "easy",
    question: "What is Dorothy's last name?",
    options: ["Gale", "Gates", "Gray", "Grimm"],
    answerIndex: 0,
  },
  {
    id: "easy-oz-24",
    difficulty: "easy",
    question: "What color is the Wicked Witch of the West's skin in the film?",
    options: ["Green", "Blue", "Purple", "Gray"],
    answerIndex: 0,
  },
  {
    id: "hard-oz-1",
    difficulty: "hard",
    question: "In L. Frank Baum's original book, what color were Dorothy's shoes?",
    options: ["Silver", "Ruby red", "Emerald green", "Golden"],
    answerIndex: 0,
  },
  {
    id: "hard-oz-2",
    difficulty: "hard",
    question: "Which character in the film is played by actor Frank Morgan in multiple roles?",
    options: [
      "The Wizard and others",
      "The Tin Man and a guard",
      "The Scarecrow and a farmer",
      "The Lion and a carriage driver",
    ],
    answerIndex: 0,
  },
  {
    id: "hard-oz-3",
    difficulty: "hard",
    question: "Which song was nearly cut from the film but reinstated after test screenings?",
    options: [
      "Over the Rainbow",
      "If I Only Had a Brain",
      "Ding-Dong! The Witch Is Dead",
      "The Jitterbug",
    ],
    answerIndex: 0,
  },
  {
    id: "hard-oz-4",
    difficulty: "hard",
    question: "In the Emerald City, what must Dorothy and friends wear to avoid glare?",
    options: ["Green-tinted glasses", "Wide-brimmed hats", "Protective cloaks", "Emerald badges"],
    answerIndex: 0,
  },
  {
    id: "hard-oz-5",
    difficulty: "hard",
    question: "Which actor originally cast as the Tin Man had to leave due to an allergic reaction to makeup?",
    options: ["Buddy Ebsen", "Jack Haley", "Ray Bolger", "Bert Lahr"],
    answerIndex: 0,
  },
  {
    id: "hard-oz-6",
    difficulty: "hard",
    question: "What does the Wizard give the Scarecrow to symbolize intelligence?",
    options: ["A diploma", "A book", "A compass", "A medal"],
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

export default function OzQuizPage() {
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
      const stored = sessionStorage.getItem("oz-quiz:last");
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
      sessionStorage.setItem("oz-quiz:last", JSON.stringify(result));
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
        setCurrentIndex(nextIndex);
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
                stateStyles =
                  "bg-[#7a0000] border-white/20 text-white opacity-90";
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
          <h3 className="text-xl font-semibold text-white">Review</h3>
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
            href="/patron/oz/games"
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
            href="/patron/oz/games"
            className="w-fit rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            ← Back
          </Link>
          <div className="text-center sm:text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Wizard of Oz Games
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Quiz
            </h1>
          </div>
          {!isQuizComplete ? (
            <button
              type="button"
              onClick={handleRestart}
              className="w-fit rounded-xl border border-white/10 bg-[#b60000] px-4 py-2 text-sm font-semibold transition hover:bg-[#cc0000] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
