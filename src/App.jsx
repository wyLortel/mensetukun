import { useState, useRef, useEffect } from 'react'

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

  const intervalRef = useRef(null)
  const nextCustomIdRef = useRef(1000) // Custom questions start from 1000

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
      const newFailedIds = [...failedIds]
      roundFailedIds.forEach(id => {
        if (!newFailedIds.includes(id)) {
          newFailedIds.push(id)
        }
      })
      setFailedIds(newFailedIds)
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
    <div className="app">
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
        />
      )}
    </div>
  )
}

// ========== Components ==========

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
}) {
  return (
    <div className="screen screen-start">
      <div className="content-box">
        <h1 className="title">面接練習アプリ</h1>
        <div className="subtitle">新卒エンジニア採用試験の面接練習</div>

        <div className="instructions-section">
          <h2 className="section-title">使い方</h2>
          <ul className="instructions-list">
            <li>「開始する」ボタンを押すと、質問がランダムに表示されます。</li>
            <li>制限時間は質問ごとに異なります。</li>
            <li>話せなかった質問はあとでまとめて復習できます。</li>
            <li>ページを閉じると記録は保存されません。</li>
          </ul>
        </div>

        <div className="shortcuts-section">
          <h3 className="section-title-small">キーボード操作（任意）</h3>
          <ul className="shortcuts-list">
            <li><kbd>Space</kbd> タイマーの一時停止 / 再開</li>
            <li><kbd>Enter</kbd> 次の質問へ進む</li>
            <li><kbd>R</kbd> 最初からやり直す</li>
          </ul>
        </div>

        {customQuestions.length > 0 && (
          <div className="custom-questions-section">
            <h3 className="section-title-small">カスタム質問 ({customQuestions.length}個)</h3>
            <div className="custom-questions-list">
              {customQuestions.map((q) => (
                <div key={q.id} className="custom-question-item">
                  <div className="custom-question-text">{q.text}</div>
                  <div className="custom-question-meta">
                    <span className="custom-duration">{q.duration}秒</span>
                    <button
                      className="btn-delete-custom"
                      onClick={() => onDeleteCustom(q.id)}
                      title="削除"
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
          + 質問を追加
        </button>

        <button className="btn btn-primary btn-large" onClick={onStart}>
          開始する
        </button>

        {showAddModal && (
          <AddQuestionModal
            onClose={onCloseModal}
            onAdd={onAddQuestion}
            questionText={newQuestion}
            onQuestionChange={onNewQuestionChange}
            duration={newDuration}
            onDurationChange={onNewDurationChange}
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
      />

      <QuestionCard question={question} durationSeconds={durationSeconds} />

      <TimerBar timeLeft={timeLeft} duration={durationSeconds} />

      <div className="time-display">
        残り時間: <strong>{timeLeft}</strong> 秒
      </div>

      {!timerExpired && !showEncouragement && (
        <div className="action-buttons">
          <button className="btn btn-success" onClick={onSpeak}>
            話せた
          </button>
          <button className="btn btn-danger" onClick={onFail}>
            話せなかった
          </button>
        </div>
      )}

      {timerExpired && !showEncouragement && (
        <div className="timer-expired-overlay">
          <div className="timer-expired-content">
            <h2>時間です</h2>
            <p>うまく話せましたか？</p>
            <div className="action-buttons">
              <button className="btn btn-success" onClick={onTimerExpiredSpeak}>
                話せた
              </button>
              <button className="btn btn-danger" onClick={onTimerExpiredFail}>
                話せなかった
              </button>
            </div>
          </div>
        </div>
      )}

      {showEncouragement && (
        <EncouragementModal onClose={onEncouragementClose} />
      )}

      {isPaused && <PauseBanner />}

      <FailedList failedIds={roundFailedIds} questions={questions} />

      <div className="reset-button-container">
        <button className="btn btn-secondary btn-small" onClick={onReset}>
          最初からやり直す
        </button>
      </div>
    </div>
  )
}

function ProgressHeader({ currentIndex, totalQuestions, isReviewMode, failedCount }) {
  return (
    <div className="progress-header">
      <div className="progress-info">
        <span className="progress-text">
          {isReviewMode ? '復習モード' : '通常練習'} • 問題 {currentIndex + 1} / {totalQuestions}
        </span>
        {failedCount > 0 && (
          <span className="failed-badge">失敗: {failedCount}問</span>
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

function EncouragementModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">惜しいです</h2>
        <p className="modal-message">
          うまく話せなかった質問はあとで復習できます。<br />
          気持ちを切り替えて次に進みましょう。
        </p>
        <button className="btn btn-primary" onClick={onClose}>
          次へ進む
        </button>
      </div>
    </div>
  )
}

function PauseBanner() {
  return (
    <div className="pause-banner">
      一時停止中 — スペースキーで再開
    </div>
  )
}

function FailedList({ failedIds, questions }) {
  if (failedIds.length === 0) return null

  const failedQuestions = questions.filter(q => failedIds.includes(q.id))

  return (
    <div className="failed-list-section">
      <details className="failed-list">
        <summary className="failed-list-summary">
          話せなかった質問 ({failedIds.length}問)
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
          {isReviewMode ? '復習完了' : 'ラウンド完了'}
        </h1>

        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-label">全質問数</div>
            <div className="stat-value">{totalQuestions}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">話せた</div>
            <div className="stat-value stat-success">{successCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">話せなかった</div>
            <div className="stat-value stat-danger">{roundFailedIds.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">成功率</div>
            <div className="stat-value">{successPercent}%</div>
          </div>
        </div>

        {roundFailedIds.length > 0 && !isReviewMode && (
          <div className="result-message">
            <p className="message-text">
              まだ伸びしろがあります。話せなかった質問をもう一度練習してみましょう。
            </p>
          </div>
        )}

        {roundFailedIds.length === 0 && !isReviewMode && (
          <div className="result-message result-success">
            <p className="message-text">
              お疲れさまでした。すべての質問を最後まで練習できました！
            </p>
          </div>
        )}

        {roundFailedIds.length === 0 && isReviewMode && (
          <div className="result-message result-success">
            <p className="message-text">
              お疲れさまでした。復習を完了しました！
            </p>
          </div>
        )}

        {showReview && failedQuestions.length > 0 && (
          <div className="failed-questions-final">
            <h2 className="section-title">話せなかった質問一覧</h2>
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
            話せなかった質問だけもう一度
          </button>}
          <button className="btn btn-secondary" onClick={onReset}>
            最初からやり直す
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
        <h2 className="modal-title">質問を追加</h2>
        <div className="form-group">
          <label htmlFor="question-input" className="form-label">質問文</label>
          <textarea
            id="question-input"
            className="form-textarea"
            placeholder="質問を入力してください"
            value={questionText}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration-input" className="form-label">制限時間</label>
          <div className="duration-options">
            <label className="radio-label">
              <input
                type="radio"
                name="duration"
                value="60"
                checked={duration === 60}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
              />
              60秒
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="duration"
                value="90"
                checked={duration === 90}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
              />
              90秒
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddClick}
            disabled={!questionText.trim()}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  )
}
