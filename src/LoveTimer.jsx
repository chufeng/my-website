import React, { useEffect, useState } from 'react';
import { CalendarHeart, Clock3, Sparkles } from 'lucide-react';
import gardenBackground from './assets/generated/love-clock-garden-bg.jpeg';
import './LoveTimer.css';

const START_DATE = new Date('2021-09-03T00:00:00+08:00');
const PETAL_SPAWN_MS = 520;
const GUST_INTERVAL_MS = 5400000;
const GUST_DURATION_MS = 4300;
const MAX_PETALS = 150;
const PUSH_RADIUS = 88;

let petalId = 0;

const pad = (value) => String(value).padStart(2, '0');

const getElapsed = () => {
  const now = new Date();
  const totalSeconds = Math.max(0, Math.floor((now.getTime() - START_DATE.getTime()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let years = now.getFullYear() - START_DATE.getFullYear();
  let months = now.getMonth() - START_DATE.getMonth();
  let dateCursor = now.getDate() - START_DATE.getDate();

  if (dateCursor < 0) {
    months -= 1;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    dateCursor += lastMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, dateCursor, days, hours, minutes, seconds };
};

const createPetal = () => {
  const size = 9 + Math.round(Math.random() * 10);
  const left = 2 + Math.random() * 96;
  const drift = -70 + Math.random() * 140;

  return {
    id: petalId++,
    left,
    size,
    drift,
    rotate: Math.round(Math.random() * 180),
    duration: 7.6 + Math.random() * 4.2,
    bottom: 1.6 + Math.random() * 7.6,
    settleX: left + drift / window.innerWidth * 100,
    settleRotate: Math.round(Math.random() * 360),
  };
};

const LoveTimer = () => {
  const [elapsed, setElapsed] = useState(getElapsed);
  const [fallingPetals, setFallingPetals] = useState(() => Array.from({ length: 12 }, createPetal));
  const [settledPetals, setSettledPetals] = useState([]);
  const [gustActive, setGustActive] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(getElapsed()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (gustActive) return undefined;

    const spawnTimer = window.setInterval(() => {
      setFallingPetals((current) => {
        const currentTotal = current.length + settledPetals.length;
        if (currentTotal >= MAX_PETALS) return current;
        return [...current, createPetal()];
      });
    }, PETAL_SPAWN_MS);

    return () => window.clearInterval(spawnTimer);
  }, [gustActive, settledPetals.length]);

  useEffect(() => {
    const gustTimer = window.setInterval(() => {
      setGustActive(true);
      window.setTimeout(() => {
        setSettledPetals([]);
        setFallingPetals([]);
        setGustActive(false);
      }, GUST_DURATION_MS);
    }, GUST_INTERVAL_MS);

    return () => window.clearInterval(gustTimer);
  }, []);

  const settlePetal = (petal) => {
    setFallingPetals((current) => current.filter((item) => item.id !== petal.id));
    if (gustActive) return;

    setSettledPetals((current) => {
      if (current.length >= MAX_PETALS) return current;

      const settled = {
        ...petal,
        left: Math.min(98, Math.max(1, petal.settleX)),
        top: 100 - petal.bottom,
      };
      return [...current, settled];
    });
  };

  const pushSettledPetals = (event) => {
    if (gustActive || settledPetals.length === 0) return;

    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const width = window.innerWidth;
    const height = window.innerHeight;

    setSettledPetals((current) => current.map((petal) => {
      const petalX = petal.left / 100 * width;
      const petalY = petal.top / 100 * height;
      const dx = petalX - pointerX;
      const dy = petalY - pointerY;
      const distance = Math.hypot(dx, dy);

      if (distance > PUSH_RADIUS) return petal;

      const force = (PUSH_RADIUS - distance) / PUSH_RADIUS;
      const angle = Math.atan2(dy || -1, dx || 1);
      const nextLeft = petal.left + Math.cos(angle) * force * 4.8;
      const nextTop = petal.top + Math.sin(angle) * force * 2.4;

      return {
        ...petal,
        left: Math.min(99, Math.max(1, nextLeft)),
        top: Math.min(98, Math.max(84, nextTop)),
        settleRotate: petal.settleRotate + Math.round(force * 44),
      };
    }));
  };

  return (
    <main className="love-page" style={{ '--garden-bg': `url(${gardenBackground})` }} onPointerMove={pushSettledPetals}>
      <div className="love-bg" aria-hidden="true">
        <div className="moon" />
        <div className="castle castle-left" />
        <div className="castle castle-right" />
        <div className="clock-halo">
          <span>XII</span>
          <span>III</span>
          <span>VI</span>
          <span>IX</span>
        </div>
        <div className="coach-line" />
        {settledPetals.map((petal) => (
          <i
            className={`sakura-petal settled${gustActive ? ' wind-swept' : ''}`}
            key={`settled-${petal.id}`}
            style={{
              left: `${petal.left}%`,
              top: `${petal.top}vh`,
              width: `${petal.size}px`,
              height: `${Math.round(petal.size * 0.62)}px`,
              '--rotate': `${petal.settleRotate}deg`,
              '--gust-x': `${window.innerWidth + 180 + Math.random() * 260}px`,
              '--gust-y': `${-80 - Math.random() * 220}px`,
            }}
          />
        ))}
        {fallingPetals.map((petal) => (
          <i
            className={`sakura-petal falling${gustActive ? ' wind-swept' : ''}`}
            key={`falling-${petal.id}`}
            onAnimationEnd={() => settlePetal(petal)}
            style={{
              left: `${petal.left}%`,
              width: `${petal.size}px`,
              height: `${Math.round(petal.size * 0.62)}px`,
              '--drift': `${petal.drift}px`,
              '--rotate': `${petal.rotate}deg`,
              '--fall-distance': `${112 - petal.bottom}vh`,
              '--gust-x': `${window.innerWidth + 180 + Math.random() * 260}px`,
              '--gust-y': `${-80 - Math.random() * 220}px`,
              animationDuration: `${petal.duration}s`,
            }}
          />
        ))}
      </div>

      <section className="love-shell">
        <div className="love-copy">
          <p className="love-kicker"><Sparkles size={18} /> 2021.09.03</p>
          <h1>
            <span>樱花落满</span>
            <span>我们的时间</span>
          </h1>
          <p className="love-subtitle">
            从偶像大师灰姑娘女孩星光舞台开始，我们把相遇后的每一天都悄悄记在夜色里。
          </p>

          <div className="time-grid" aria-label="在一起的时间">
            <div>
              <strong>{elapsed.years}</strong>
              <span>年</span>
            </div>
            <div>
              <strong>{elapsed.months}</strong>
              <span>个月</span>
            </div>
            <div>
              <strong>{elapsed.dateCursor}</strong>
              <span>天</span>
            </div>
          </div>

          <div className="exact-time">
            <CalendarHeart size={18} />
            <span>已经认识 {elapsed.days.toLocaleString('zh-CN')} 天</span>
          </div>

          <div className="ticker">
            <Clock3 size={18} />
            <span>{pad(elapsed.hours)}:{pad(elapsed.minutes)}:{pad(elapsed.seconds)}</span>
          </div>
        </div>

        <div className="memory-stage" aria-label="相遇纪念倒计时">
          <div className="memory-orbit" aria-hidden="true">
            <span>XII</span>
            <span>IX</span>
            <span>III</span>
          </div>
          <div className="memory-card">
            <span className="memory-label">Together</span>
            <strong>{elapsed.days.toLocaleString('zh-CN')}</strong>
            <span className="memory-unit">days</span>
            <p>从 2021.09.03 开始</p>
          </div>
          <div className="bench-glow" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
};

export default LoveTimer;
