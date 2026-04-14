import { useState, useRef, useEffect } from 'react'

// ========== Translations ==========

const TRANSLATIONS = {
  ja: {
    appTitle: '面接練習アプリ',
    appSubtitle: '新卒エンジニア採用試験の面接練習',
    howToUse: '使い方',
    rule1: '「開始する」ボタンを押すと、質問がランダムに表示されます。',
    rule2: '制限時間は質問ごとに異なります。',
    rule3: '話せなかった質問はあとでまとめて復習できます。',
    rule4: 'ページを閉じると記録は保存されません。',
    keyboardShortcuts: 'キーボード操作（任意）',
    start: '開始する',
    addQuestion: '+ 質問を追加',
    customQuestions: 'カスタム質問',
    question: '問題',
    spoke: '話せた',
    couldntSpeak: '話せなかった',
    failedQuestions: '話せなかった質問',
    reviewMode: '復習モード',
    normalPractice: '通常練習',
    remainingTime: '残り時間',
    timeLimit: '制限時間',
    timeIsUp: '時間です',
    didYouSpeak: 'うまく話せましたか？',
    sorry: '惜しいです',
    encouragementMsg: 'うまく話せなかった質問はあとで復習できます。気持ちを切り替えて次に進みましょう。',
    next: '次へ進む',
    paused: '一時停止中 — スペースキーで再開',
    roundComplete: 'ラウンド完了',
    reviewComplete: '復習完了',
    totalQuestions: '全質問数',
    speaking: '話せた',
    notSpeaking: '話せなかった',
    successRate: '成功率',
    encouragement: 'まだ伸びしろがあります。話せなかった質問をもう一度練習してみましょう。',
    allClear: 'お疲れさまでした。すべての質問を最後まで練習できました！',
    reviewDone: 'お疲れさまでした。復習を完了しました！',
    reviewAgain: '話せなかった質問だけもう一度',
    restart: '最初からやり直す',
    addQuestionTitle: '質問を追加',
    questionText: '質問文',
    questionPlaceholder: '質問を入力してください',
    timeLimit: '制限時間',
    sixtySeconds: '60秒',
    ninetySeconds: '90秒',
    cancel: 'キャンセル',
    add: '追加',
    failedList: '話せなかった質問一覧',
    failedQuestionsList: '話せなかった質問一覧',
  },
  ko: {
    appTitle: '면접 연습 앱',
    appSubtitle: '신입 엔지니어 채용 시험 면접 연습',
    howToUse: '사용 방법',
    rule1: '「시작하기」 버튼을 누르면 질문이 무작위로 표시됩니다.',
    rule2: '제한 시간은 질문마다 다릅니다.',
    rule3: '답하지 못한 질문은 나중에 정리하여 복습할 수 있습니다.',
    rule4: '페이지를 닫으면 기록이 저장되지 않습니다.',
    keyboardShortcuts: '키보드 작동 (선택)',
    start: '시작하기',
    addQuestion: '+ 질문 추가',
    customQuestions: '사용자 정의 질문',
    question: '문제',
    spoke: '답했음',
    couldntSpeak: '답하지 못함',
    failedQuestions: '답하지 못한 질문',
    reviewMode: '복습 모드',
    normalPractice: '일반 연습',
    remainingTime: '남은 시간',
    timeLimit: '제한 시간',
    timeIsUp: '시간이 다 되었습니다',
    didYouSpeak: '잘 말했나요?',
    sorry: '아쉽네요',
    encouragementMsg: '잘 말하지 못한 질문은 나중에 복습할 수 있습니다. 기분 전환하고 다음으로 넘어가세요.',
    next: '다음으로',
    paused: '일시 정지 중 — 스페이스바로 재개',
    roundComplete: '라운드 완료',
    reviewComplete: '복습 완료',
    totalQuestions: '전체 질문 수',
    speaking: '답했음',
    notSpeaking: '답하지 못함',
    successRate: '성공률',
    encouragement: '아직 성장할 여지가 있습니다. 답하지 못한 질문을 다시 한 번 연습해 보세요.',
    allClear: '수고하셨습니다. 모든 질문을 끝까지 연습할 수 있었습니다!',
    reviewDone: '수고하셨습니다. 복습을 완료했습니다!',
    reviewAgain: '답하지 못한 질문만 다시 한 번',
    restart: '처음부터 다시 시작',
    addQuestionTitle: '질문 추가',
    questionText: '질문 텍스트',
    questionPlaceholder: '질문을 입력하세요',
    timeLimit: '제한 시간',
    sixtySeconds: '60초',
    ninetySeconds: '90초',
    cancel: '취소',
    add: '추가',
    failedList: '답하지 못한 질문 목록',
    failedQuestionsList: '답하지 못한 질문 목록',
  },
}

// ========== Data ==========

const QUESTIONS = [
  { id: 1, text: '自己紹介をお願いします。', duration: 60 },
  { id: 2, text: '周りからはどのような人だと言われますか。', duration: 60 },
  { id: 3, text: '自己PRをお願いします。', duration: 90 }, // 90s
  { id: 4, text: 'あなたの強みは何ですか。', duration: 60 },
  { id: 5, text: 'あなたの弱みは何ですか。', duration: 60 },
  { id: 6, text: '人生で最も頑張ったことは何ですか。', duration: 90 }, // 90s
  { id: 7, text: 'どんなエンジニアになりたいですか。', duration: 60 },
  { id: 8, text: '会社選びの軸を教えてください。', duration: 60 },
  { id: 9, text: '挫折した経験はありますか。', duration: 90 }, // 90s
  { id: 10, text: '1年後、5年後、10年後にどうなっていたいですか。', duration: 60 },
  { id: 11, text: 'なぜこの大学・学部・学科を選んだのですか。', duration: 60 },
  { id: 12, text: '学生時代に最も力を入れたことは何ですか。', duration: 90 }, // 90s
  { id: 13, text: 'リーダーとして難しかったことは何ですか。', duration: 90 }, // 90s
  { id: 14, text: 'なぜエンジニアを志望しているのですか。', duration: 60 },
  { id: 15, text: 'チームでのあなたの役割は何でしたか。', duration: 60 },
  { id: 16, text: 'なぜ日本で就職したいのですか。', duration: 60 },
  { id: 17, text: 'チーム開発で苦労したことは何ですか。', duration: 90 }, // 90s
  { id: 18, text: 'リーダーシップを発揮した経験を教えてください。', duration: 90 }, // 90s
]

// Shuffle function (Fisher-Yates)
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ========== Main App Component ==========

export default function App() {
  const [screen, setScreen] = useState('start')
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [failedIds, setFailedIds] = useState([])
  const [roundFailedIds, setRoundFailedIds] = useState([])

  const [timeLeft, setTimeLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerExpired, setTimerExpired] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)

  const [customQuestions, setCustomQuestions] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newDuration, setNewDuration] = useState(60)

  const [language, setLanguage] = useState('ja') // 'ja' or 'ko'
  const [darkMode, setDarkMode] = useState(false)

  const intervalRef = useRef(null)
  const nextCustomIdRef = useRef(1000) // Custom questions start from 1000

  const t = TRANSLATIONS[language]

  // ========== Handlers ==========

  const addCustomQuestion = () => {
    if (!newQuestion.trim()) return
    const customQ = {
      id: nextCustomIdRef.current,
      text: newQuestion.trim(),
      duration: newDuration,
      isCustom: true,
    }
    setCustomQuestions(prev => [...prev, customQ])
    nextCustomIdRef.current += 1
    setNewQuestion('')
    setNewDuration(60)
    setShowAddModal(false)
  }

  const deleteCustomQuestion = (id) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id))
  }

  const startPractice = () => {
    const allQuestions = [...QUESTIONS, ...customQuestions]
    setQueue(shuffle(allQuestions))
    setCurrentIndex(0)
    setIsReviewMode(false)
    setRoundFailedIds([])
    setTimeLeft(0)
    setTimerRunning(false)
    setTimerExpired(false)
    setIsPaused(false)
    setShowEncouragement(false)
    setScreen('practice')
  }

  const startReview = () => {
    const allQuestions = [...QUESTIONS, ...customQuestions]
    const failedQuestions = allQuestions.filter(q => failedIds.includes(q.id))
    if (failedQuestions.length === 0) return
    setQueue(shuffle(failedQuestions))
    setCurrentIndex(0)
    setIsReviewMode(true)
    setRoundFailedIds([])
    setTimeLeft(0)
    setTimerRunning(false)
    setTimerExpired(false)
    setIsPaused(false)
    setShowEncouragement(false)
    setScreen('practice')
  }

  const handleSpeak = () => {
    advanceQuestion()
  }

  const handleFail = () => {
    const qId = queue[currentIndex].id
    if (!roundFailedIds.includes(qId)) {
      setRoundFailedIds(prev => [...prev, qId])
    }
    setShowEncouragement(true)
  }

  const handleEncouragementClose = () => {
    setShowEncouragement(false)
    advanceQuestion()
  }

  const advanceQuestion = () => {
    const nextIdx = currentIndex + 1
    if (nextIdx >= queue.length) {
      // Round finished
      if (isReviewMode) {
        // In review mode, only keep questions that failed in this round
        setFailedIds(roundFailedIds)
      } else {
        // In normal mode, add this round's failures to the overall failed list
        const newFailedIds = [...failedIds]
        roundFailedIds.forEach(id => {
          if (!newFailedIds.includes(id)) {
            newFailedIds.push(id)
          }
        })
        setFailedIds(newFailedIds)
      }
      setScreen('result')
    } else {
      setCurrentIndex(nextIdx)
    }
  }

  const handleReset = () => {
    setScreen('start')
    setQueue([])
    setCurrentIndex(0)
    setIsReviewMode(false)
    setFailedIds([])
    setRoundFailedIds([])
    setTimeLeft(0)
    setTimerRunning(false)
    setTimerExpired(false)
    setIsPaused(false)
    setShowEncouragement(false)
  }

  const handleTimerExpiredSpeak = () => {
    setTimerExpired(false)
    handleSpeak()
  }

  const handleTimerExpiredFail = () => {
    setTimerExpired(false)
    handleFail()
  }

  // ========== Effects ==========

  // Timer tick effect
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!timerRunning || isPaused || timerExpired) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setTimerRunning(false)
          setTimerExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [timerRunning, isPaused, timerExpired])

  // Question change effect
  useEffect(() => {
    if (screen !== 'practice') return
    const q = queue[currentIndex]
    if (!q) return
    setTimeLeft(q.duration)
    setTimerExpired(false)
    setTimerRunning(true)
    setIsPaused(false)
    setShowEncouragement(false)
  }, [currentIndex, screen])

  // Keyboard shortcuts
  useEffect(() => {
    if (screen !== 'practice') return

    const handler = (e) => {
      if (showEncouragement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (timerExpired) return
          setIsPaused(p => !p)
          setTimerRunning(p => !p)
          break
        case 'Enter':
          if (timerExpired) {
            handleTimerExpiredSpeak()
          } else {
            handleSpeak()
          }
          break
        case 'KeyR':
          handleReset()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [screen, timerExpired, showEncouragement, queue, currentIndex])

  // ========== Render ==========

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <Header
        language={language}
        onLanguageChange={setLanguage}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        t={t}
      />

      {screen === 'start' && (
        <StartScreen
          onStart={startPractice}
          onOpenAddModal={() => setShowAddModal(true)}
          customQuestions={customQuestions}
          onDeleteCustom={deleteCustomQuestion}
          showAddModal={showAddModal}
          onCloseModal={() => setShowAddModal(false)}
          onAddQuestion={addCustomQuestion}
          newQuestion={newQuestion}
          onNewQuestionChange={setNewQuestion}
          newDuration={newDuration}
          onNewDurationChange={setNewDuration}
          t={t}
        />
      )}
      {screen === 'practice' && (
        <PracticeScreen
          question={queue[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={queue.length}
          timeLeft={timeLeft}
          timerExpired={timerExpired}
          isPaused={isPaused}
          showEncouragement={showEncouragement}
          isReviewMode={isReviewMode}
          failedIds={failedIds}
          roundFailedIds={roundFailedIds}
          questions={QUESTIONS}
          onSpeak={handleSpeak}
          onFail={handleFail}
          onEncouragementClose={handleEncouragementClose}
          onTimerExpiredSpeak={handleTimerExpiredSpeak}
          onTimerExpiredFail={handleTimerExpiredFail}
          onReset={handleReset}
          t={t}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          totalQuestions={queue.length}
          roundFailedIds={roundFailedIds}
          failedIds={failedIds}
          questions={[...QUESTIONS, ...customQuestions]}
          isReviewMode={isReviewMode}
          onReview={startReview}
          onReset={handleReset}
          t={t}
        />
      )}
    </div>
  )
}

// ========== Components ==========

function Header({ language, onLanguageChange, darkMode, onDarkModeToggle, t }) {
  return (
    <header className="app-header">
      <div className="header-controls">
        <div className="language-switcher">
          <button
            className={`lang-btn ${language === 'ja' ? 'active' : ''}`}
            onClick={() => onLanguageChange('ja')}
          >
            日本語
          </button>
          <button
            className={`lang-btn ${language === 'ko' ? 'active' : ''}`}
            onClick={() => onLanguageChange('ko')}
          >
            한국어
          </button>
        </div>
        <button
          className="dark-mode-toggle"
          onClick={onDarkModeToggle}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}

function StartScreen({
  onStart,
  onOpenAddModal,
  customQuestions,
  onDeleteCustom,
  showAddModal,
  onCloseModal,
  onAddQuestion,
  newQuestion,
  onNewQuestionChange,
  newDuration,
  onNewDurationChange,
  t,
}) {
  return (
    <div className="screen screen-start">
      <div className="content-box">
        <h1 className="title">{t.appTitle}</h1>
        <div className="subtitle">{t.appSubtitle}</div>

        <div className="instructions-section">
          <h2 className="section-title">{t.howToUse}</h2>
          <ul className="instructions-list">
            <li>{t.rule1}</li>
            <li>{t.rule2}</li>
            <li>{t.rule3}</li>
            <li>{t.rule4}</li>
          </ul>
        </div>

        <div className="shortcuts-section">
          <h3 className="section-title-small">{t.keyboardShortcuts}</h3>
          <ul className="shortcuts-list">
            <li><kbd>Space</kbd> {t.remainingTime}</li>
            <li><kbd>Enter</kbd> {t.next}</li>
            <li><kbd>R</kbd> {t.restart}</li>
          </ul>
        </div>

        {customQuestions.length > 0 && (
          <div className="custom-questions-section">
            <h3 className="section-title-small">{t.customQuestions} ({customQuestions.length})</h3>
            <div className="custom-questions-list">
              {customQuestions.map((q) => (
                <div key={q.id} className="custom-question-item">
                  <div className="custom-question-text">{q.text}</div>
                  <div className="custom-question-meta">
                    <span className="custom-duration">{q.duration}s</span>
                    <button
                      className="btn-delete-custom"
                      onClick={() => onDeleteCustom(q.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-secondary btn-large" onClick={onOpenAddModal}>
          {t.addQuestion}
        </button>

        <button className="btn btn-primary btn-large" onClick={onStart}>
          {t.start}
        </button>

        {showAddModal && (
          <AddQuestionModal
            onClose={onCloseModal}
            onAdd={onAddQuestion}
            questionText={newQuestion}
            onQuestionChange={onNewQuestionChange}
            duration={newDuration}
            onDurationChange={onNewDurationChange}
            t={t}
          />
        )}
      </div>
    </div>
  )
}

function PracticeScreen({
  question,
  currentIndex,
  totalQuestions,
  timeLeft,
  timerExpired,
  isPaused,
  showEncouragement,
  isReviewMode,
  failedIds,
  roundFailedIds,
  questions,
  onSpeak,
  onFail,
  onEncouragementClose,
  onTimerExpiredSpeak,
  onTimerExpiredFail,
  onReset,
  t,
}) {
  if (!question) return null

  const failedCount = roundFailedIds.length
  const durationSeconds = question.duration

  return (
    <div className="screen screen-practice">
      <ProgressHeader
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        isReviewMode={isReviewMode}
        failedCount={failedCount}
        t={t}
      />

      <QuestionCard question={question} durationSeconds={durationSeconds} />

      <TimerBar timeLeft={timeLeft} duration={durationSeconds} />

      <div className="time-display">
        {t.remainingTime}: <strong>{timeLeft}</strong> s
      </div>

      {!timerExpired && !showEncouragement && (
        <div className="action-buttons">
          <button className="btn btn-success" onClick={onSpeak}>
            {t.spoke}
          </button>
          <button className="btn btn-danger" onClick={onFail}>
            {t.couldntSpeak}
          </button>
        </div>
      )}

      {timerExpired && !showEncouragement && (
        <div className="timer-expired-overlay">
          <div className="timer-expired-content">
            <h2>{t.timeIsUp}</h2>
            <p>{t.didYouSpeak}</p>
            <div className="action-buttons">
              <button className="btn btn-success" onClick={onTimerExpiredSpeak}>
                {t.spoke}
              </button>
              <button className="btn btn-danger" onClick={onTimerExpiredFail}>
                {t.couldntSpeak}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEncouragement && (
        <EncouragementModal onClose={onEncouragementClose} t={t} />
      )}

      {isPaused && <PauseBanner t={t} />}

      <FailedList failedIds={roundFailedIds} questions={questions} t={t} />

      <div className="reset-button-container">
        <button className="btn btn-secondary btn-small" onClick={onReset}>
          {t.restart}
        </button>
      </div>
    </div>
  )
}

function ProgressHeader({ currentIndex, totalQuestions, isReviewMode, failedCount, t }) {
  return (
    <div className="progress-header">
      <div className="progress-info">
        <span className="progress-text">
          {isReviewMode ? t.reviewMode : t.normalPractice} • {t.question} {currentIndex + 1} / {totalQuestions}
        </span>
        {failedCount > 0 && (
          <span className="failed-badge">{t.couldntSpeak}: {failedCount}</span>
        )}
      </div>
    </div>
  )
}

function QuestionCard({ question, durationSeconds }) {
  return (
    <div className="question-card">
      <div className="question-text">{question.text}</div>
      <div className="question-duration">
        制限時間: {durationSeconds}秒
      </div>
    </div>
  )
}

function TimerBar({ timeLeft, duration }) {
  const ratio = Math.max(0, timeLeft / duration)
  const percent = ratio * 100

  let color = '#3a9e6f' // green
  if (ratio <= 0.2) color = '#c0392b' // red
  else if (ratio <= 0.5) color = '#d4a017' // amber

  return (
    <div className="timer-bar-container">
      <div className="timer-bar-track">
        <div
          className="timer-bar-fill"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

function EncouragementModal({ onClose, t }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">{t.sorry}</h2>
        <p className="modal-message">
          {t.encouragementMsg}
        </p>
        <button className="btn btn-primary" onClick={onClose}>
          {t.next}
        </button>
      </div>
    </div>
  )
}

function PauseBanner({ t }) {
  return (
    <div className="pause-banner">
      {t.paused}
    </div>
  )
}

function FailedList({ failedIds, questions, t }) {
  if (failedIds.length === 0) return null

  const failedQuestions = questions.filter(q => failedIds.includes(q.id))

  return (
    <div className="failed-list-section">
      <details className="failed-list">
        <summary className="failed-list-summary">
          {t.failedQuestions} ({failedIds.length})
        </summary>
        <div className="failed-list-content">
          {failedQuestions.map((q, idx) => (
            <div key={q.id} className="failed-item">
              <span className="failed-number">{idx + 1}.</span>
              <span className="failed-text">{q.text}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

function ResultScreen({
  totalQuestions,
  roundFailedIds,
  failedIds,
  questions,
  isReviewMode,
  onReview,
  onReset,
  t,
}) {
  const successCount = totalQuestions - roundFailedIds.length
  const successPercent = totalQuestions > 0
    ? Math.round((successCount / totalQuestions) * 100)
    : 0

  const failedQuestions = questions.filter(q => failedIds.includes(q.id))
  const showReview = failedIds.length > 0

  return (
    <div className="screen screen-result">
      <div className="content-box">
        <h1 className="result-title">
          {isReviewMode ? t.reviewComplete : t.roundComplete}
        </h1>

        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-label">{t.totalQuestions}</div>
            <div className="stat-value">{totalQuestions}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">{t.speaking}</div>
            <div className="stat-value stat-success">{successCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">{t.notSpeaking}</div>
            <div className="stat-value stat-danger">{roundFailedIds.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">{t.successRate}</div>
            <div className="stat-value">{successPercent}%</div>
          </div>
        </div>

        {roundFailedIds.length > 0 && !isReviewMode && (
          <div className="result-message">
            <p className="message-text">
              {t.encouragement}
            </p>
          </div>
        )}

        {roundFailedIds.length === 0 && !isReviewMode && (
          <div className="result-message result-success">
            <p className="message-text">
              {t.allClear}
            </p>
          </div>
        )}

        {roundFailedIds.length === 0 && isReviewMode && (
          <div className="result-message result-success">
            <p className="message-text">
              {t.reviewDone}
            </p>
          </div>
        )}

        {showReview && failedQuestions.length > 0 && (
          <div className="failed-questions-final">
            <h2 className="section-title">{t.failedQuestionsList}</h2>
            <div className="failed-list-final">
              {failedQuestions.map((q, idx) => (
                <div key={q.id} className="failed-item-final">
                  <span>{idx + 1}.</span> {q.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="result-actions">
          {showReview && <button className="btn btn-primary" onClick={onReview}>
            {t.reviewAgain}
          </button>}
          <button className="btn btn-secondary" onClick={onReset}>
            {t.restart}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddQuestionModal({
  onClose,
  onAdd,
  questionText,
  onQuestionChange,
  duration,
  onDurationChange,
  t,
}) {
  const handleAddClick = () => {
    if (questionText.trim()) {
      onAdd()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && questionText.trim()) {
      onAdd()
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal modal-add-question">
        <h2 className="modal-title">{t.addQuestionTitle}</h2>
        <div className="form-group">
          <label htmlFor="question-input" className="form-label">{t.questionText}</label>
          <textarea
            id="question-input"
            className="form-textarea"
            placeholder={t.questionPlaceholder}
            value={questionText}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration-input" className="form-label">{t.timeLimit}</label>
          <div className="duration-options">
            <label className="radio-label">
              <input
                type="radio"
                name="duration"
                value="60"
                checked={duration === 60}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
              />
              {t.sixtySeconds}
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="duration"
                value="90"
                checked={duration === 90}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
              />
              {t.ninetySeconds}
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {t.cancel}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddClick}
            disabled={!questionText.trim()}
          >
            {t.add}
          </button>
        </div>
      </div>
    </div>
  )
}
