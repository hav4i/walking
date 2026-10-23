import { useState, useCallback, useEffect, useRef } from 'react'

// ============================================
// GAME CONFIG
// ============================================
const PLAYER1_NAME = 'ПОЛЯ'
const PLAYER2_NAME = 'САШКА'
const MAX_HEALTH = 3

const LOCATIONS = [
  { id: 'cafe',     text: 'Уютное кафе ☕',             emoji: '☕' },
  { id: 'mcdonalds', text: 'Жёсткий перекус в Маке 🍔', emoji: '🍔' },
  { id: 'idk',      text: 'Не знаю 🤷‍♀️',              emoji: '🤷‍♀️' },
  { id: 'custom',   text: 'Свой вариант ✍️',            emoji: '✍️' },
  { id: 'quit',     text: 'Я не хочу... ❌',           emoji: '❌' },
]

// ============================================
// CALENDAR COMPONENT
// ============================================
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const TIME_SLOTS = ['12:00', '13:30', '15:00', '16:00', '17:00', '18:30', '19:00', '20:00']

const Calendar: React.FC<{
  viewDate: Date
  selectedDate: Date | null
  onSelectDate: (d: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}> = ({ viewDate, selectedDate, onSelectDate, onPrevMonth, onNextMonth }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  // Пн = 0, Вс = 6
  let startWeekday = firstDay.getDay() - 1
  if (startWeekday < 0) startWeekday = 6

  const days: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return selectedDate.getFullYear() === year &&
           selectedDate.getMonth() === month &&
           selectedDate.getDate() === day
  }

  const isToday = (day: number) => {
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={onPrevMonth}>◀</button>
        <div className="cal-month-year">{MONTHS[month]} {year}</div>
        <button className="cal-nav-btn" onClick={onNextMonth}>▶</button>
      </div>
      <div className="calendar-weekdays">
        {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
      </div>
      <div className="calendar-days">
        {days.map((day, idx) => (
          <div key={idx} className="cal-day-cell">
            {day !== null && (
              <button
                className={`cal-day ${isDisabled(day) ? 'disabled' : ''} ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''}`}
                onClick={() => !isDisabled(day) && onSelectDate(new Date(year, month, day))}
                disabled={isDisabled(day)}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// TIME SELECTOR
// ============================================
const TimeSelector: React.FC<{
  selectedTime: string | null
  onSelectTime: (t: string) => void
}> = ({ selectedTime, onSelectTime }) => (
  <div className="time-selector">
    <div className="time-title">Выбери время:</div>
    <div className="time-slots">
      {TIME_SLOTS.map(t => (
        <button
          key={t}
          className={`time-slot ${selectedTime === t ? 'selected' : ''}`}
          onClick={() => onSelectTime(t)}
        >
          {t}
        </button>
      ))}
    </div>
  </div>
)

// ============================================
// PIXEL HEART
// ============================================
const PixelHeart: React.FC<{ filled: boolean; broken?: boolean }> = ({ filled, broken }) => (
  <div className={`heart ${filled ? '' : 'empty'} ${broken ? 'broken' : ''}`}>
    <svg viewBox="0 0 24 24" fill={filled ? '#E74C3C' : broken ? '#444' : '#ABEBC6'}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  </div>
)

// ============================================
// PLAYER PANEL
// ============================================
const PlayerPanel: React.FC<{
  name: string
  health: number
  maxHealth: number
  side: 'left' | 'right'
  breaking?: boolean
}> = ({ name, health, maxHealth, side, breaking }) => (
  <div className={`player-panel player-${side}`}>
    <div className="player-name">{name}</div>
    <div className="hearts">
      {Array.from({ length: maxHealth }, (_, i) => (
        <PixelHeart key={i} filled={i < health} broken={breaking && i >= health} />
      ))}
    </div>
  </div>
)

// ============================================
// BACKGROUND
// ============================================
const Sun = () => <div className="sun" />
const Clouds = () => (
  <div className="clouds">
    <div className="cloud cloud-1" /><div className="cloud cloud-2" />
    <div className="cloud cloud-3" /><div className="cloud cloud-4" />
  </div>
)
const Trees = () => (
  <div className="trees">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className={`tree tree-${i}`}>
        <div className="tree-leaves" /><div className="tree-trunk" />
      </div>
    ))}
  </div>
)
const Ground = () => (
  <div className="ground">
    {Array.from({length: 12}, (_, i) => <div key={i} className="grass-blade" />)}
    <div className="cat-container">
      <div className="cat">
        <div className="cat-head">
          <div className="cat-ear cat-ear-l" />
          <div className="cat-ear cat-ear-r" />
        </div>
        <div className="cat-body">
          <div className="cat-tail" />
        </div>
      </div>
      <div className="butterfly">
        <div className="bf-wing bf-wing-l" /><div className="bf-wing bf-wing-r" /><div className="bf-body" />
      </div>
    </div>
    <div className="butterfly bf-pink" style={{top: '28%', left: '72%', animationDelay: '0.4s'}}>
      <div className="bf-wing bf-wing-l" /><div className="bf-wing bf-wing-r" /><div className="bf-body" />
    </div>
    <div className="butterfly bf-sky" style={{top: '50%', left: '82%', animationDelay: '1.1s'}}>
      <div className="bf-wing bf-wing-l" /><div className="bf-wing bf-wing-r" /><div className="bf-body" />
    </div>
    <div className="butterfly bf-yellow" style={{top: '65%', left: '8%', animationDelay: '0.7s'}}>
      <div className="bf-wing bf-wing-l" /><div className="bf-wing bf-wing-r" /><div className="bf-body" />
    </div>
    <div className="butterfly bf-peach" style={{top: '22%', left: '25%', animationDelay: '1.4s'}}>
      <div className="bf-wing bf-wing-l" /><div className="bf-wing bf-wing-r" /><div className="bf-body" />
    </div>
  </div>
)

// ============================================
// GAME OVER
// ============================================
const GameOverScreen: React.FC<{ onRestart: () => void }> = ({ onRestart }) => (
  <div className="game-over-screen">
    <div className="game-over-content">
      <div className="game-over-title">Game over...</div>
      <div className="game-over-subtitle">Сашка умер и его не спасти 💔</div>
      <button className="game-button btn-restart" onClick={onRestart}>Попробовать снова 🔄</button>
    </div>
  </div>
)

// ============================================
// CUSTOM INPUT MODAL
// ============================================
const CustomInputModal: React.FC<{
  onSubmit: (_v: string) => void
  onCancel: () => void
}> = ({ onSubmit, onCancel }) => {
  const [input, setInput] = useState('')
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Твой вариант:</div>
        <form onSubmit={ev => { ev.preventDefault(); if (input.trim()) onSubmit(input.trim()) }}>
          <input className="custom-input" placeholder="Напиши место..." value={input} onChange={e => setInput(e.target.value)} autoFocus />
          <div className="modal-buttons">
            <button type="button" className="game-button btn-cancel" onClick={onCancel}>Отмена</button>
            <button type="submit" className="game-button btn-submit" disabled={!input.trim()}>Выбрать ✓</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// MAIN APP
// ============================================
type Phase = 'round1' | 'round1_success' | 'round2' | 'round3' | 'round4' | 'round5' | 'round5_final' | 'game_over'

export default function App() {
  const [player1Health] = useState(MAX_HEALTH)
  const [player2Health, setPlayer2Health] = useState(MAX_HEALTH)
  const [phase, setPhase] = useState<Phase>('round1')

  // --- Отправка событий в Telegram (реальное время) ---
  const sendGameEvent = useCallback((eventType: string, round: string, reason: string, prevHealth: number, newHealth: number) => {
    fetch('/api/send-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        round,
        reason,
        prevHealth,
        newHealth,
        maxHealth: MAX_HEALTH
      })
    }).catch(() => {})
  }, [])

  // One notification per page load. The event contains no identity data, only
  // that the invitation page was opened.
  useEffect(() => {
    sendGameEvent('page_opened', 'Старт', 'Ссылка открыта', MAX_HEALTH, MAX_HEALTH)
  }, [sendGameEvent])

  // --- NO button state ---
  const [noTransformed, setNoTransformed] = useState(false)
  const [noText, setNoText] = useState('Спасибо, но нет')
  // Button position offset from original
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })

  // --- Effects ---
  const [breaking, setBreaking] = useState(false)
  const [showHit, setShowHit] = useState(false)

  // --- Round 2 ---
  const [showCustom, setShowCustom] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('')

  // --- Round 3 ---
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // --- Round 4 ---
  const DRINK_OPTIONS = [
    { id: 'coffee', icon: '☕', label: 'Кофе' },
    { id: 'tea', icon: '🍵', label: 'Чай' },
    { id: 'cocoa', icon: '🍫', label: 'Какао' },
    { id: 'drink_idk', icon: '🤷‍♀️', label: 'Я не знаю', penalty: true },
    { id: 'drink_none', icon: '🙅‍♀️', label: 'Ничего не хочу', penalty: true },
  ]
  const WALK_OPTIONS = [
    { id: 'park', icon: '🌳', label: 'Пешком по парку' },
    { id: 'warm', icon: '🧣', label: 'Сидим в тепле и уюте' },
    { id: 'flexible', icon: '🎲', label: 'По обстоятельствам' },
  ]
  const INVENTORY_OPTIONS = [
    { id: 'good_mood', icon: '💖', label: 'Хорошее настроение' },
    { id: 'camera', icon: '📸', label: 'Фотик и камеру' },
  ]
  const ACTIVITY_OPTIONS = [
    { id: 'animals', icon: '🐕🐈', label: 'Будем искать всех бездомных собак и кошек и отведём их домой к Полине' },
    { id: 'travel', icon: '🚶‍♂️✈️', label: 'Пойдём пешком до Италии, потом полетим на Мальдивы' },
  ]
  const [selectedDrinks, setSelectedDrinks] = useState<Set<string>>(new Set())
  const [selectedWalk, setSelectedWalk] = useState<Set<string>>(new Set())
  const [selectedInventory, setSelectedInventory] = useState<Set<string>>(new Set())
  const [selectedActivity, setSelectedActivity] = useState<Set<string>>(new Set())

  const handleDrinkClick = useCallback((id: string, penalty: boolean) => {
    setSelectedDrinks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
        if (penalty) {
          const prevHealth = player2Health
          const newHealth = Math.max(0, player2Health - 1)
          setPlayer2Health(newHealth)
          setBreaking(true)
          setShowHit(true)
          // Отправляем уведомление о потере сердечка
          sendGameEvent('heart_loss', '4 - Напитки', `Выбрала "${id === 'drink_idk' ? 'Я не знаю' : 'Ничего не хочу'}" в напитках`, prevHealth, newHealth)
          setTimeout(() => {
            setShowHit(false)
            setBreaking(false)
            if (newHealth === 0) {
              sendGameEvent('game_over', '4 - Напитки', 'Потеря всех сердечек в напитках', prevHealth, newHealth)
              setPhase('game_over')
            }
          }, 200)
        }
      }
      return newSet
    })
  }, [player2Health, sendGameEvent])

  const handleWalkClick = useCallback((id: string) => {
    setSelectedWalk(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }, [])

  const handleInventoryClick = useCallback((id: string) => {
    setSelectedInventory(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }, [])

  const handleActivityClick = useCallback((id: string) => {
    setSelectedActivity(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }, [])

  const getSelectedLabels = () => {
    const drinks = Array.from(selectedDrinks).map(id => DRINK_OPTIONS.find(o => o.id === id)?.label).filter(Boolean)
    const walks = Array.from(selectedWalk).map(id => WALK_OPTIONS.find(o => o.id === id)?.label).filter(Boolean)
    const inv = Array.from(selectedInventory).map(id => INVENTORY_OPTIONS.find(o => o.id === id)?.label).filter(Boolean)
    const activity = Array.from(selectedActivity).map(id => ACTIVITY_OPTIONS.find(o => o.id === id)?.label).filter(Boolean)
    return { drinks, walks, inventory: inv, activity }
  }

  const handleGoToRound5 = useCallback(() => {
    // Автоматически отправляем в Telegram
    const { drinks, walks, inventory, activity } = getSelectedLabels()
    const formatDate = (d: Date) => {
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    }
    
    fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: selectedLocation,
        date: selectedDate ? formatDate(selectedDate) : '',
        time: selectedTime || '',
        drinks,
        walks,
        inventory,
        activity
      })
    }).catch(() => {})

    setPhase('round5')
  }, [selectedLocation, selectedDate, selectedTime, selectedDrinks, selectedWalk, selectedInventory, selectedActivity])

  // Refs
  const noBtnRef = useRef<HTMLButtonElement>(null)
  const escapeCountRef = useRef(0)
  // True while button is currently mid-jump
  const isJumpingRef = useRef(false)

  const [isJumping, setIsJumping] = useState(false)

  // ========================================
  // NO BUTTON: ESCAPE MECHANIC
  // Each time cursor approaches → button escapes 500px away
  // After 4 escapes → returns to original position
  // ========================================
  const handleNoMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (isJumpingRef.current || !noBtnRef.current) return

    const rect = noBtnRef.current.getBoundingClientRect()
    const bx = rect.left + rect.width / 2
    const by = rect.top + rect.height / 2
    const cx = e.clientX
    const cy = e.clientY

    const dist = Math.hypot(bx - cx, by - cy)
    const TRIGGER = 200

    if (dist > TRIGGER) return

    isJumpingRef.current = true
    escapeCountRef.current++

    // After 4 escapes → return to original position (instant, no transition)
    if (escapeCountRef.current >= 4) {
      setIsJumping(true) // disable transition for instant return
      setNoPos({ x: 0, y: 0 })
      escapeCountRef.current = 0
      // Re-enable transitions after cooldown so next moves are smooth
      setTimeout(() => {
        setIsJumping(false)
        isJumpingRef.current = false
      }, 300)
      return
    }

    // Direction: opposite of cursor direction
    let dx = bx - cx
    let dy = by - cy
    const len = Math.hypot(dx, dy) || 1
    dx /= len
    dy /= len

    // Exactly 500px per escape
    const nx = noPos.x + dx * 500
    const ny = noPos.y + dy * 500

    // Clamp to viewport bounds
    const vw = window.innerWidth
    const vh = window.innerHeight
    const bw = rect.width
    const bh = rect.height
    const margin = 20

    const origX = rect.left - noPos.x
    const origY = rect.top - noPos.y

    const maxX = vw - origX - bw - margin
    const maxY = vh - origY - bh - margin
    const minX = -origX + margin
    const minY = -origY + margin

    const clampedX = Math.max(minX, Math.min(maxX, nx))
    const clampedY = Math.max(minY, Math.min(maxY, ny))

    setIsJumping(true) // disable transition for instant jump
    setNoPos({ x: clampedX, y: clampedY })
    // Re-enable transitions after jump completes
    setTimeout(() => {
      setIsJumping(false)
      isJumpingRef.current = false
    }, 100)
  }, [noPos])

  // ========================================
  // CLICK TRANSFORMED BUTTON
  // ========================================
  const handleNoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!noTransformed) return

    const prevHealth = player2Health
    const newHealth = Math.max(0, player2Health - 1)
    setPlayer2Health(newHealth)
    setBreaking(true)
    setShowHit(true)
    // Отправляем уведомление о потере сердечка
    sendGameEvent('heart_loss', '1', 'Нажала на "Спасибо, но нет" после превращения', prevHealth, newHealth)

    setTimeout(() => {
      setShowHit(false)
      setBreaking(false)
      if (newHealth === 0) {
        sendGameEvent('game_over', '1', 'Потеря всех сердечек в раунде 1', prevHealth, newHealth)
        setPhase('game_over')
      } else {
        setPhase('round2')
      }
    }, 200)
  }, [noTransformed, player2Health, sendGameEvent])

  // ========================================
  // YES BUTTON
  // ========================================
  const handleYes = useCallback(() => {
    sendGameEvent('first_action', '1', 'Нажата кнопка «Да, погнали!»', player2Health, player2Health)
    setPhase('round2')
  }, [player2Health, sendGameEvent])

  // ========================================
  // LOCATION SELECT
  // ========================================
  const handleLocation = useCallback((id: string, displayText: string) => {
    if (id === 'idk') {
      const prevHealth = player2Health
      const newHealth = Math.max(0, player2Health - 1)
      setPlayer2Health(newHealth)
      setBreaking(true)
      setShowHit(true)
      // Отправляем уведомление о потере сердечка
      sendGameEvent('heart_loss', '2 - Место', 'Выбрала "Не знаю" как место встречи', prevHealth, newHealth)
      setTimeout(() => {
        setShowHit(false)
        setBreaking(false)
        if (newHealth === 0) {
          sendGameEvent('game_over', '2 - Место', 'Потеря всех сердечек из-за "Не знаю"', prevHealth, newHealth)
          setPhase('game_over')
        }
      }, 200)
      return
    }
    if (id === 'quit') {
      const prevHealth = player2Health
      setPlayer2Health(0)
      setBreaking(true)
      setShowHit(true)
      // Отправляем уведомление об отказе
      sendGameEvent('quit', '2 - Место', 'Выбрала "Я не хочу..." — отказ от участия', prevHealth, 0)
      setTimeout(() => {
        sendGameEvent('game_over', '2 - Место', 'Игра завершена из-за отказа', prevHealth, 0)
        setPhase('game_over')
      }, 300)
      return
    }
    if (id === 'custom') { setShowCustom(true); return }
    setSelectedLocation(displayText)
    setTimeout(() => setPhase('round3'), 300)
  }, [player2Health, sendGameEvent])

  // ========================================
  // RESTART
  // ========================================
  const handleRestart = useCallback(() => {
    setPlayer2Health(MAX_HEALTH)
    setBreaking(false)
    setShowHit(false)
    setNoTransformed(false)
    setNoText('Спасибо, но нет')
    setNoPos({ x: 0, y: 0 })
    setIsJumping(false)
    escapeCountRef.current = 0
    isJumpingRef.current = false
    setSelectedLocation('')
    setSelectedDate(null)
    setSelectedTime(null)
    setViewDate(new Date())
    setSelectedDrinks(new Set())
    setSelectedWalk(new Set())
    setSelectedInventory(new Set())
    setPhase('round1')
  }, [])

  // ========================================
  // ROUND 3 HANDLERS
  // ========================================
  const handlePrevMonth = useCallback(() => {
    setViewDate(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setViewDate(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))
  }, [])

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d)
    setSelectedTime(null) // сбрасываем время при смене даты
  }, [])

  const handleSelectTime = useCallback((t: string) => {
    setSelectedTime(t)
  }, [])

  const handleConfirmMeeting = useCallback(() => {
    if (selectedDate && selectedTime) {
      setPhase('round4')
    }
  }, [selectedDate, selectedTime])

  // ========================================
  // RENDER
  // ========================================

  // ========================================
  // CONFETTI COMPONENT
  // ========================================
  const Confetti: React.FC = () => {
    const [pieces] = useState(() => {
      const confetti: { id: number; left: number; delay: number; type: 'confetti' | 'heart'; color?: string }[] = []
      const colors = ['#E74C3C', '#F39C12', '#27AE60', '#3498DB', '#9B59B6', '#E91E63']
      for (let i = 0; i < 50; i++) {
        confetti.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 2,
          type: Math.random() > 0.7 ? 'heart' : 'confetti',
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
      return confetti
    })
    return (
      <div className="confetti-container">
        {pieces.map(p => (
          <div
            key={p.id}
            className={`confetti-piece ${p.type === 'heart' ? 'heart' : ''}`}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              backgroundColor: p.type === 'confetti' ? p.color : undefined
            }}
          >
            {p.type === 'heart' ? '❤️' : undefined}
          </div>
        ))}
      </div>
    )
  }

  // ========================================
  // RENDER
  // ========================================

  if (phase === 'game_over') {
    return (
      <div className="app game-over-bg">
        <GameOverScreen onRestart={handleRestart} />
      </div>
    )
  }

  // ========================================
  // ROUND 1
  // ========================================
  if (phase === 'round1') {
    return (
      <div className="app">
        <Sun /><Clouds /><Trees /><Ground />
        <div className="game-content">
          <div className="players-hud">
            <PlayerPanel name={PLAYER1_NAME} health={player1Health} maxHealth={MAX_HEALTH} side="left" />
            <PlayerPanel name={PLAYER2_NAME} health={player2Health} maxHealth={MAX_HEALTH} side="right" breaking={breaking} />
          </div>
          <div className="game-header">
            <div className="round-badge">ROUND 1</div>
          </div>
          <div className="versus-section"><span className="vs-text">VS</span></div>
          <div className="fight-banner"><div className="fight-text">FIGHT FOR THE WALK</div></div>
          <div className="invitation-panel">
            <div className="question-box">
              <h1 className="main-question">Как насчёт погулять?</h1>
              <p className="hint-text">Твой ход 👀</p>
            </div>
            <div className="buttons-container">
              <button className="game-button btn-yes" onClick={handleYes}>Да, погнали!</button>
              <button
                ref={noBtnRef}
                className={`game-button btn-no${isJumping ? ' jumping' : ''}${noTransformed ? ' btn-transformed' : ''}`}
                onClick={handleNoClick}
                onPointerMove={handleNoMove}
                style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }}
              >
                {noText}
              </button>
            </div>
          </div>
        </div>
        {showHit && <div className="hit-effect" />}
      </div>
    )
  }

  // ========================================
  // ROUND 1 SUCCESS
  // ========================================
  if (phase === 'round1_success') {
    return (
      <div className="app">
        <Sun /><Clouds /><Trees /><Ground />
        <div className="game-content">
          <div className="players-hud">
            <PlayerPanel name={PLAYER1_NAME} health={player1Health} maxHealth={MAX_HEALTH} side="left" />
            <PlayerPanel name={PLAYER2_NAME} health={player2Health} maxHealth={MAX_HEALTH} side="right" breaking={breaking} />
          </div>
          <div className="game-header">
            <div className="round-badge round-badge-1-success">ОНА СОГЛАСНА! ❤️</div>
          </div>
          <div className="versus-section"><span className="vs-text">VS</span></div>
          <div className="fight-banner fight-banner-success"><div className="fight-text">DEFEATED!</div></div>
          <div className="invitation-panel">
            <div className="question-box">
              <h1 className="main-question">Ого, она согласилась!</h1>
              <p className="hint-text">Так, а куда поведёшь? 🗺️</p>
            </div>
            <div className="buttons-container">
              <button className="game-button btn-next" onClick={() => setPhase('round2')}>Выбрать место →</button>
            </div>
          </div>
        </div>
        {showHit && <div className="hit-effect" />}
      </div>
    )
  }

  // ========================================
  // ROUND 2: ВЫБЕРИ ЛОКАЦИЮ
  // ========================================
  if (phase === 'round2') {
    return (
      <div className="app">
        <Sun /><Clouds /><Trees /><Ground />
        <div className="game-content">
          <div className="players-hud">
            <PlayerPanel name={PLAYER1_NAME} health={player1Health} maxHealth={MAX_HEALTH} side="left" />
            <PlayerPanel name={PLAYER2_NAME} health={player2Health} maxHealth={MAX_HEALTH} side="right" breaking={breaking} />
          </div>
          <div className="game-header">
            <div className="round-badge round-badge-2">ROUND 2: ВЫБЕРИ ЛОКАЦИЮ</div>
          </div>
          <div className="round2-panel">
            <div className="locations-list">
              {LOCATIONS.map((loc, idx) => {
                const variant = loc.id === 'quit' ? 'danger' : loc.id === 'idk' ? 'warning' : 'normal'
                return (
                  <button key={loc.id} className={`location-btn location-btn-${variant}`}
                    onClick={() => loc.id === 'custom' ? setShowCustom(true) : handleLocation(loc.id, loc.text)}>
                    <span className="location-num">{idx + 1}.</span>
                    <span className="location-text">{loc.text}</span>
                  </button>
                )
              })}
            </div>
            {showCustom && (
              <CustomInputModal
                onSubmit={(v) => {
                  setShowCustom(false)
                  setSelectedLocation(v)
                  setTimeout(() => setPhase('round3'), 300)
                }}
                onCancel={() => setShowCustom(false)}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ========================================
  // ROUND 3: КОГДА ВСТРЕЧАЕМСЯ?
  // ========================================
  if (phase === 'round3') {
    return (
      <div className="app">
        <Sun /><Clouds /><Trees /><Ground />
        <div className="game-content">
          <div className="players-hud">
            <PlayerPanel name={PLAYER1_NAME} health={player1Health} maxHealth={MAX_HEALTH} side="left" />
            <PlayerPanel name={PLAYER2_NAME} health={player2Health} maxHealth={MAX_HEALTH} side="right" breaking={breaking} />
          </div>
          <div className="game-header">
            <div className="round-badge round-badge-3">ROUND 3: КОГДА ВСТРЕЧАЕМСЯ?</div>
          </div>
          <div className="round3-panel">
            <div className="date-time-picker">
              <Calendar
                viewDate={viewDate}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
              {selectedDate && (
                <div className="time-section">
                  <TimeSelector
                    selectedTime={selectedTime}
                    onSelectTime={handleSelectTime}
                  />
                  {selectedTime && (
                    <button className="game-button btn-confirm" onClick={handleConfirmMeeting}>
                      Подтвердить встречу
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========================================
  // ROUND 4: ДОПОЛНИТЕЛЬНЫЕ ОПЦИИ
  // ========================================
  if (phase === 'round4') {
    return (
      <div className="app">
        <Sun /><Clouds /><Trees /><Ground />
        <div className="game-content">
          <div className="players-hud">
            <PlayerPanel name={PLAYER1_NAME} health={player1Health} maxHealth={MAX_HEALTH} side="left" />
            <PlayerPanel name={PLAYER2_NAME} health={player2Health} maxHealth={MAX_HEALTH} side="right" breaking={breaking} />
          </div>
          <div className="game-header">
            <div className="round-badge-4">ROUND 4: ДОПОЛНИТЕЛЬНЫЕ ОПЦИИ</div>
          </div>
          <div className="round4-panel">
            <div className="r4-subtitle">Соберём идеальный план нашей встречи ♡</div>
            
            {/* Category 1: Drinks */}
            <div className="r4-section">
              <div className="r4-section-title">☕ ЧТО БУДЕМ ПИТЬ?</div>
              <div className="r4-options-grid">
                {DRINK_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`r4-option-card ${selectedDrinks.has(opt.id) ? 'selected' : ''} ${opt.penalty ? 'penalty' : ''}`}
                    onClick={() => handleDrinkClick(opt.id, !!opt.penalty)}
                  >
                    <span className="r4-option-icon">{opt.icon}</span>
                    <span className="r4-option-label">{opt.label}</span>
                    {selectedDrinks.has(opt.id) && <span className="r4-option-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Category 2: Walk Format */}
            <div className="r4-section">
              <div className="r4-section-title">🚶 КАК БУДЕМ ГУЛЯТЬ?</div>
              <div className="r4-options-grid">
                {WALK_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`r4-option-card ${selectedWalk.has(opt.id) ? 'selected' : ''}`}
                    onClick={() => handleWalkClick(opt.id)}
                  >
                    <span className="r4-option-icon">{opt.icon}</span>
                    <span className="r4-option-label">{opt.label}</span>
                    {selectedWalk.has(opt.id) && <span className="r4-option-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Category 3: Inventory */}
            <div className="r4-section">
              <div className="r4-section-title">🎒 ЧТО БЕРЁМ С СОБОЙ?</div>
              <div className="r4-options-grid">
                {INVENTORY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`r4-option-card ${selectedInventory.has(opt.id) ? 'selected' : ''}`}
                    onClick={() => handleInventoryClick(opt.id)}
                  >
                    <span className="r4-option-icon">{opt.icon}</span>
                    <span className="r4-option-label">{opt.label}</span>
                    {selectedInventory.has(opt.id) && <span className="r4-option-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Category 4: Activity */}
            <div className="r4-section">
              <div className="r4-section-title">🎯 ЧЕМ БУДЕМ ЗАНИМАТЬСЯ?</div>
              <div className="r4-options-grid">
                {ACTIVITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`r4-option-card ${selectedActivity.has(opt.id) ? 'selected' : ''}`}
                    onClick={() => handleActivityClick(opt.id)}
                  >
                    <span className="r4-option-icon">{opt.icon}</span>
                    <span className="r4-option-label">{opt.label}</span>
                    {selectedActivity.has(opt.id) && <span className="r4-option-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-finish" onClick={handleGoToRound5}>ГОТОВО! ♡</button>
          </div>
        </div>
        {showHit && <div className="hit-effect" />}
      </div>
    )
  }

  // ========================================
  // ROUND 5: ФИНАЛ
  // ========================================
  if (phase === 'round5') {
    const formatDate = (d: Date) => {
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    }
    const { drinks, walks, inventory, activity } = getSelectedLabels()

    return (
      <div className="app">
        <Sun /><Clouds /><Trees /><Ground />
        <Confetti />
        <div className="game-content">
          <div className="game-header">
            <div className="round-badge-4">УРА! ПРИГЛАШЕНИЕ СФОРМИРОВАНО! 🎉</div>
          </div>
          <div className="round4-panel">
            <div className="result-card">
              <div className="result-title">Вы предложили Александру встретиться.</div>
              <div className="result-subtitle">В принципе, он согласен.</div>
              <div className="result-section">
                <div className="result-label">📍 Локация:</div>
                <div className="result-value">{selectedLocation}</div>
              </div>
              <div className="result-section">
                <div className="result-label">📅 Дата:</div>
                <div className="result-value">{selectedDate ? formatDate(selectedDate) : '-'}</div>
              </div>
              <div className="result-section">
                <div className="result-label">⏰ Время:</div>
                <div className="result-value">{selectedTime || '-'}</div>
              </div>
              <div className="result-section">
                <div className="result-label">☕ Напитки:</div>
                <div className="result-value">{drinks.length > 0 ? drinks.join(', ') : 'Не выбрано'}</div>
              </div>
              <div className="result-section">
                <div className="result-label">🚶 Прогулка:</div>
                <div className="result-value">{walks.length > 0 ? walks.join(', ') : 'Не выбрано'}</div>
              </div>
              <div className="result-section">
                <div className="result-label">🎒 Инвентарь:</div>
                <div className="result-value">{inventory.length > 0 ? inventory.join(', ') : 'Не выбрано'}</div>
              </div>
              <div className="result-section">
                <div className="result-label">🎯 Чем займёмся:</div>
                <div className="result-value">{activity.length > 0 ? activity.join(', ') : 'Не выбрано'}</div>
              </div>
              <div className="result-footer">
                <button className="game-button btn-restart" onClick={handleRestart}>Начать сначала 🔄</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
