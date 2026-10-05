import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playClickSound } from '../utils/sound';
import { Coffee, Code, Rocket, PenTool, Play, RefreshCw, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Physics & Vector Data Structures
// ─────────────────────────────────────────────────────────────
interface PhysicsProp {
  id: number;
  type: 'cup' | 'cube' | 'disk' | 'gear' | 'rocketDebris';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  angularVelocity: number;
  bounces: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  type?: 'smoke' | 'spark' | 'lightning' | 'steam' | 'fire';
}

interface FloatingSkill {
  text: string;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  rotation: number;
}

export type WorkRoutine = 'coffee' | 'design' | 'code' | 'rocket';

// Vansh's Real Skills & Experience from Resume
const VANSH_SKILLS = [
  { text: 'Tax & Accounting (CMA Practice)', cat: 'FINANCE' },
  { text: 'Tally Prime & ITR-1 Filing', cat: 'TAX' },
  { text: 'Udyam & GeM Compliance', cat: 'REGULATORY' },
  { text: 'Graphic Design (Canva)', cat: 'DESIGN' },
  { text: 'Project Coordination', cat: 'LEADERSHIP' },
  { text: 'AI Assisted Coding', cat: 'CODE' },
  { text: 'SahiRasta Platform Lead', cat: 'PRODUCT' },
  { text: 'Wishpers of the soul (Poetry)', cat: 'WRITING' },
  { text: 'Team Management', cat: 'LEADERSHIP' },
  { text: 'Generative AI Workflows', cat: 'AI' },
  { text: 'Rapid MVP Prototyping', cat: 'DEV' },
  { text: 'Meeting Strict Deadlines', cat: 'MANAGEMENT' },
  { text: 'Event Organization (200+)', cat: 'COMMUNITY' },
  { text: 'BBA - Manipal University', cat: 'EDUCATION' },
  { text: 'Full Lifecycle Execution', cat: 'STRATEGY' },
];

export const StickmanHero: React.FC<{
  onActivityChange?: (activityTitle: string, stepIndex: number) => void;
}> = ({ onActivityChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Default to coffee routine & auto mode enabled on load
  const [currentTask, setCurrentTask] = useState<WorkRoutine>('coffee');
  const [autoCycle, setAutoCycle] = useState<boolean>(true);
  const [taskName, setTaskName] = useState<string>('Morning Coffee & System Reboot ☕');
  const [score, setScore] = useState<{ launches: number; coffee: number }>({
    launches: 1,
    coffee: 1,
  });

  // State refs for animation loop
  const routineRef = useRef<WorkRoutine>('coffee');
  const routineTimeRef = useRef<number>(0);
  const autoCycleRef = useRef<boolean>(true);
  const propsRef = useRef<PhysicsProp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const skillsRef = useRef<FloatingSkill[]>([]);
  const animFrameRef = useRef<number>(0);

  // Stickman Physical Coordinates & Articulated Rig
  const stickmanRef = useRef({
    x: 180,
    y: 330,
    vx: 0,
    vy: 0,
    targetX: 180,
    isSitting: false,
    isOnRocket: false,
    isFalling: false,
    facing: -1,
    actionState: 'pouring', // pouring, walking, typing, riding, falling, fried
    headAngle: 0,
    armLAngle: 0,
    armRAngle: 0,
    squashY: 1,
    squashX: 1,
    expression: 'focus', // focus, happy, shocked, fried
  });

  // Routine Switcher
  const switchRoutine = useCallback(
    (routine: WorkRoutine, userTriggered = false) => {
      if (userTriggered) {
        setAutoCycle(false);
        autoCycleRef.current = false;
      }
      routineRef.current = routine;
      routineTimeRef.current = 0;
      setCurrentTask(routine);

      const sm = stickmanRef.current;
      sm.isOnRocket = false;
      sm.isFalling = false;
      skillsRef.current = []; // Clear previous floating text

      if (routine === 'coffee') {
        setTaskName('1. Morning Coffee & System Reboot ☕');
        sm.targetX = 180;
        sm.y = 330;
        sm.isSitting = false;
        sm.facing = -1;
        sm.expression = 'focus';
        playClickSound('paper');
        onActivityChange?.('Coffee Station & Fueling Up ☕', 1);
      } else if (routine === 'design') {
        setTaskName('2. Interconnected Hobbies & Non-Linear Mindmap 🌀');
        sm.targetX = 720;
        sm.y = 330;
        sm.isSitting = false;
        sm.facing = 1;
        sm.expression = 'focus';
        playClickSound('high');
        onActivityChange?.('Interconnected Mindmap & Non-Linear Ideas 🌀', 2);
      } else if (routine === 'code') {
        setTaskName('3. Deep Code & Skill Emission Engine 💻');
        sm.targetX = 420;
        sm.y = 330;
        sm.isSitting = true;
        sm.facing = 1;
        sm.expression = 'focus';
        playClickSound('tick');
        onActivityChange?.('Deep Coding & Skills Synthesis 💻', 3);
      } else if (routine === 'rocket') {
        setTaskName('4. Rocket Ride ➔ Mid-Air Burst ➔ PC Meltdown 🚀💥');
        sm.targetX = 630;
        sm.isSitting = false;
        sm.facing = 1;
        sm.expression = 'happy';
        playClickSound('spear');
        setScore((s) => ({ ...s, launches: s.launches + 1 }));
        onActivityChange?.('Rocket Ride, Mid-Air Burst & PC Meltdown 🚀🤯', 4);
      }
    },
    [onActivityChange]
  );

  // Drop interactive physics prop on click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const propTypes: ('cup' | 'cube' | 'disk' | 'gear')[] = ['cup', 'cube', 'disk', 'gear'];
    const selectedType = propTypes[Math.floor(Math.random() * propTypes.length)];

    propsRef.current.push({
      id: Date.now() + Math.random(),
      type: selectedType,
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: -2 - Math.random() * 4,
      radius: 12 + Math.random() * 6,
      angle: Math.random() * Math.PI,
      angularVelocity: (Math.random() - 0.5) * 0.2,
      bounces: 0,
    });

    playClickSound('pop');

    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 3 + Math.random() * 3,
        alpha: 1,
        color: '#000000',
        life: 0,
        maxLife: 30,
      });
    }
  };

  // Main Canvas Physics & Animation Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    const FLOOR_Y = 360;
    const DESK_X = 390;
    const DESK_Y = 280;
    const DESK_W = 160;
    const CHAIR_X = 405;

    const routinesList: WorkRoutine[] = ['coffee', 'design', 'code', 'rocket'];

    // Timing durations per routine (in seconds)
    const routineDurations: Record<WorkRoutine, number> = {
      coffee: 6.5,
      design: 8.0,
      code: 8.5,
      rocket: 10.5, // 0-0.8s mount, 0.8-2.8s fly, 2.8s burst, 2.8-4.2s fall, 4.2-10.5s PC burst & fried brain
    };

    let rocketExploded = false;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      routineTimeRef.current += dt;

      // ── Auto-cycle Work Routine Sequence ──
      const currentDuration = routineDurations[routineRef.current] || 8.0;
      if (autoCycleRef.current && routineTimeRef.current > currentDuration) {
        const nextIdx = (routinesList.indexOf(routineRef.current) + 1) % routinesList.length;
        switchRoutine(routinesList[nextIdx]);
      }

      // Resize canvas to match display size
      const dpr = window.devicePixelRatio || 1;
      const displayW = canvas.clientWidth;
      const displayH = canvas.clientHeight;
      if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const scaleX = displayW / 960;
      const scaleY = displayH / 440;
      ctx.scale(scaleX, scaleY);

      // Clear Canvas
      ctx.clearRect(0, 0, 960, 440);

      // Set Universal Solid Black Ink Styling
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const t = routineTimeRef.current;
      const sm = stickmanRef.current;

      // ── 1. ENVIRONMENT / LAB STAGE ─────────────────────────
      // Ground baseline
      ctx.beginPath();
      ctx.moveTo(40, FLOOR_Y);
      ctx.lineTo(920, FLOOR_Y);
      ctx.stroke();

      // Floor architectural hatch marks
      for (let i = 60; i < 900; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, FLOOR_Y + 1);
        ctx.lineTo(i - 8, FLOOR_Y + 10);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.lineWidth = 3.5;

      // ── Environment Station A: Coffee Espresso Machine ──
      ctx.strokeRect(100, 240, 65, 120);
      ctx.strokeRect(95, 330, 75, 10);
      ctx.strokeRect(120, 275, 25, 18);
      ctx.beginPath();
      ctx.arc(132, 230, 16, 0, Math.PI, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(148, 255, 7, 0, Math.PI * 2);
      ctx.stroke();

      const leverAngle = routineRef.current === 'coffee' ? 0.35 : -0.2;
      ctx.beginPath();
      ctx.moveTo(105, 255);
      ctx.lineTo(105 + Math.cos(leverAngle) * 28, 255 - Math.sin(leverAngle) * 28);
      ctx.stroke();

      if (routineRef.current === 'coffee') {
        if (Math.random() < 0.4) {
          particlesRef.current.push({
            x: 132 + (Math.random() - 0.5) * 4,
            y: 295,
            vx: 0,
            vy: 2 + Math.random() * 2,
            size: 2.5,
            alpha: 1,
            color: '#000000',
            life: 0,
            maxLife: 20,
          });
        }
        if (Math.random() < 0.25) {
          particlesRef.current.push({
            x: 132 + (Math.random() - 0.5) * 10,
            y: 330,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.2,
            size: 3.5,
            alpha: 0.8,
            color: '#000000',
            life: 0,
            maxLife: 35,
          });
        }
      }

      // ── Environment Station B: Whiteboard Hobbies & Non-Linear Mindmap ──
      ctx.strokeRect(680, 90, 230, 175);
      ctx.beginPath();
      ctx.moveTo(695, 265);
      ctx.lineTo(680, FLOOR_Y);
      ctx.moveTo(895, 265);
      ctx.lineTo(910, FLOOR_Y);
      ctx.stroke();

      ctx.font = 'bold 8px monospace';
      ctx.fillText('HOBBIES & MINDMAP', 740, 105);

      ctx.lineWidth = 1.8;

      // Mindmap nodes
      ctx.strokeRect(695, 115, 68, 20);
      ctx.fillText('Cosmology 🌌', 700, 128);

      ctx.strokeRect(825, 115, 55, 20);
      ctx.fillText('Books 📚', 832, 128);

      ctx.strokeRect(695, 155, 68, 20);
      ctx.fillText('Travelling 🧭', 698, 168);

      ctx.strokeRect(820, 155, 70, 20);
      ctx.fillText('Mountains ⛰️', 823, 168);

      ctx.strokeRect(820, 195, 65, 20);
      ctx.fillText('Trekking 🥾', 824, 208);

      // Graph connections
      ctx.beginPath();
      ctx.moveTo(763, 125);
      ctx.lineTo(825, 125);
      ctx.moveTo(855, 135);
      ctx.lineTo(855, 155);
      ctx.moveTo(763, 165);
      ctx.lineTo(820, 165);
      ctx.moveTo(855, 175);
      ctx.lineTo(855, 195);
      ctx.moveTo(729, 135);
      ctx.lineTo(729, 155);
      ctx.stroke();

      // Non-Linear Thinking (Weird tilted node + wild loop)
      ctx.save();
      ctx.translate(692, 195);
      ctx.rotate(-0.08);
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(0, 0, 108, 24);
      ctx.setLineDash([]);
      ctx.font = 'italic bold 8px "Newsreader", "Space Grotesk", monospace';
      ctx.fillText('Non-Linear Thinking 🌀', 4, 15);
      ctx.restore();

      ctx.beginPath();
      ctx.setLineDash([4, 2]);
      ctx.moveTo(796, 207);
      ctx.bezierCurveTo(775, 230, 680, 240, 690, 175);
      ctx.bezierCurveTo(680, 95, 780, 85, 855, 105);
      ctx.bezierCurveTo(915, 125, 910, 235, 885, 215);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'italic 7px monospace';
      ctx.fillText('~ (non-linear loop) ~', 710, 240);

      ctx.lineWidth = 3.5;

      // ── Environment Station C: Workstation Desk & Multi-Monitor ──
      ctx.strokeRect(DESK_X, DESK_Y, DESK_W, 12);
      ctx.beginPath();
      ctx.moveTo(DESK_X + 15, DESK_Y + 12);
      ctx.lineTo(DESK_X + 15, FLOOR_Y);
      ctx.moveTo(DESK_X + DESK_W - 15, DESK_Y + 12);
      ctx.lineTo(DESK_X + DESK_W - 15, FLOOR_Y);
      ctx.stroke();

      // Check if PC is currently BURSTED (in rocket routine after landing t > 4.2s)
      const isPcBursted = routineRef.current === 'rocket' && t > 4.2;

      if (isPcBursted) {
        // ── PC BURSTED STATE 💥 ──
        const shakeX = (Math.random() - 0.5) * 6;
        const shakeY = (Math.random() - 0.5) * 4;

        ctx.save();
        ctx.translate(DESK_X + 50 + shakeX, DESK_Y - 95 + shakeY);
        ctx.strokeRect(0, 0, 75, 70);

        // Glass Cracks
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(40, 35);
        ctx.lineTo(65, 20);
        ctx.moveTo(40, 35);
        ctx.lineTo(25, 60);
        ctx.moveTo(40, 35);
        ctx.lineTo(55, 55);
        ctx.stroke();

        ctx.font = 'bold 9px monospace';
        ctx.fillText('💥 OVERHEAT', 8, 30);
        ctx.fillText('CRITICAL ERR', 6, 45);
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(DESK_X + 87, DESK_Y - 25);
        ctx.lineTo(DESK_X + 87, DESK_Y);
        ctx.stroke();

        // Smoke & Sparks billowing from PC
        if (Math.random() < 0.6) {
          particlesRef.current.push({
            x: DESK_X + 75 + (Math.random() - 0.5) * 30,
            y: DESK_Y - 95,
            vx: (Math.random() - 0.5) * 3,
            vy: -2 - Math.random() * 3,
            size: 4 + Math.random() * 6,
            alpha: 1,
            color: '#000000',
            life: 0,
            maxLife: 40,
            type: 'smoke',
          });
        }
        if (Math.random() < 0.4) {
          particlesRef.current.push({
            x: DESK_X + 75 + (Math.random() - 0.5) * 40,
            y: DESK_Y - 60 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 7,
            vy: -Math.random() * 6,
            size: 2 + Math.random() * 2,
            alpha: 1,
            color: '#000000',
            life: 0,
            maxLife: 20,
            type: 'spark',
          });
        }

        // Secondary Vertical Monitor tilted / dead
        ctx.save();
        ctx.translate(DESK_X + 130, DESK_Y - 110);
        ctx.rotate(0.15);
        ctx.strokeRect(0, 0, 36, 85);
        ctx.font = 'bold 7px monospace';
        ctx.fillText('DEAD', 8, 40);
        ctx.restore();
      } else {
        // Normal Working Multi-Monitor Setup
        ctx.strokeRect(DESK_X + 50, DESK_Y - 95, 75, 70);
        ctx.strokeRect(DESK_X + 54, DESK_Y - 91, 67, 52);
        ctx.beginPath();
        ctx.moveTo(DESK_X + 87, DESK_Y - 25);
        ctx.lineTo(DESK_X + 87, DESK_Y);
        ctx.moveTo(DESK_X + 75, DESK_Y);
        ctx.lineTo(DESK_X + 100, DESK_Y);
        ctx.stroke();

        ctx.strokeRect(DESK_X + 130, DESK_Y - 110, 36, 85);
        ctx.beginPath();
        ctx.moveTo(DESK_X + 148, DESK_Y - 25);
        ctx.lineTo(DESK_X + 148, DESK_Y);
        ctx.stroke();

        ctx.lineWidth = 1.5;
        ctx.font = '6px monospace';
        ctx.fillText('> Vansh.init()', DESK_X + 57, DESK_Y - 78);
        ctx.fillText('> skills.emit()', DESK_X + 57, DESK_Y - 68);
        ctx.fillText('> deploy 100%', DESK_X + 57, DESK_Y - 58);
        ctx.fillText('> status: OK', DESK_X + 57, DESK_Y - 48);
        ctx.lineWidth = 3.5;
      }

      // Mechanical Keyboard
      ctx.strokeRect(DESK_X + 50, DESK_Y - 6, 32, 6);

      // Swivel Chair
      ctx.beginPath();
      ctx.moveTo(CHAIR_X - 25, DESK_Y - 55);
      ctx.lineTo(CHAIR_X - 25, DESK_Y + 5);
      ctx.lineTo(CHAIR_X + 10, DESK_Y + 5);
      ctx.moveTo(CHAIR_X - 10, DESK_Y + 5);
      ctx.lineTo(CHAIR_X - 10, FLOOR_Y - 5);
      ctx.moveTo(CHAIR_X - 25, FLOOR_Y - 3);
      ctx.lineTo(CHAIR_X + 5, FLOOR_Y - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(CHAIR_X - 25, FLOOR_Y - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(CHAIR_X + 5, FLOOR_Y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. ROCKET FLIGHT & MID-AIR BURST SEQUENCE ─────────
      const isRocketRoutine = routineRef.current === 'rocket';
      let rocketY = FLOOR_Y - 10;

      if (isRocketRoutine) {
        if (t < 0.8) {
          // Stickman runs to rocket
          sm.targetX = 630;
          sm.isSitting = false;
          sm.isOnRocket = false;
          sm.isFalling = false;
          rocketExploded = false;
        } else if (t >= 0.8 && t < 2.8) {
          // Rocket ignition & ascending flight with Stickman ON THE ROCKET!
          const flightProgress = (t - 0.8) / 2.0;
          rocketY = FLOOR_Y - 10 - flightProgress * 380;
          sm.isOnRocket = true;
          sm.isFalling = false;
          sm.x = 630;
          sm.y = rocketY + 20;

          // Thruster flames & smoke particles
          for (let i = 0; i < 4; i++) {
            particlesRef.current.push({
              x: 630 + (Math.random() - 0.5) * 8,
              y: rocketY + 20,
              vx: (Math.random() - 0.5) * 5,
              vy: 4 + Math.random() * 6,
              size: 3 + Math.random() * 4,
              alpha: 1,
              color: '#000000',
              life: 0,
              maxLife: 25,
            });
          }

          // Draw Rocket
          ctx.save();
          ctx.translate(630, rocketY);
          ctx.beginPath();
          ctx.moveTo(0, -35);
          ctx.lineTo(14, -10);
          ctx.lineTo(14, 18);
          ctx.lineTo(-14, 18);
          ctx.lineTo(-14, -10);
          ctx.closePath();
          ctx.stroke();
          // Fins
          ctx.beginPath();
          ctx.moveTo(-14, 6);
          ctx.lineTo(-24, 22);
          ctx.lineTo(-14, 20);
          ctx.moveTo(14, 6);
          ctx.lineTo(24, 22);
          ctx.lineTo(14, 20);
          ctx.stroke();
          ctx.restore();
        } else if (t >= 2.8 && t < 4.2) {
          // ── MID-AIR ROCKET BURST 💥 & FREEFALL ONTO CHAIR ──
          sm.isOnRocket = false;
          sm.isFalling = true;

          if (!rocketExploded) {
            rocketExploded = true;
            playClickSound('pop');
            // Spawn Rocket Debris props and explosion particles!
            for (let i = 0; i < 18; i++) {
              particlesRef.current.push({
                x: 630 + (Math.random() - 0.5) * 20,
                y: -10 + Math.random() * 40,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 10,
                size: 4 + Math.random() * 5,
                alpha: 1,
                color: '#000000',
                life: 0,
                maxLife: 35,
              });
            }
          }

          // Freefall physics trajectory from (x: 630, y: 10) down to chair (x: 405, y: DESK_Y + 2)
          const fallProgress = Math.min((t - 2.8) / 1.4, 1);
          // Ease in quad for gravity acceleration
          const gravityEase = fallProgress * fallProgress;
          sm.x = 630 - fallProgress * (630 - (CHAIR_X - 8));
          sm.y = -20 + gravityEase * (DESK_Y + 2 - (-20));
          sm.expression = 'shocked';

          // Draw "💥 BOOM!" in sky
          if (t < 3.4) {
            ctx.save();
            ctx.font = 'bold 16px monospace';
            ctx.fillText('💥 BOOM!', 600, 40);
            ctx.restore();
          }
        } else {
          // ── LANDED ON CHAIR ➔ SQUASH & PC BURST 🤯 ──
          sm.isFalling = false;
          sm.isOnRocket = false;
          sm.isSitting = true;
          sm.x = CHAIR_X - 8;
          sm.y = DESK_Y + 2;
          sm.expression = 'fried';
        }
      }

      // ── 3. STICKMAN RIG & ARTICULATED PHYSICS ──────────────
      if (!isRocketRoutine || t < 0.8) {
        const dx = sm.targetX - sm.x;
        if (Math.abs(dx) > 4) {
          sm.vx = Math.sign(dx) * 3.2;
          sm.x += sm.vx;
          sm.isSitting = false;
          sm.actionState = 'walking';
        } else {
          sm.x = sm.targetX;
          sm.vx = 0;
          if (routineRef.current === 'code') {
            sm.isSitting = true;
            sm.actionState = 'typing';
          }
        }
      }

      let hipY = FLOOR_Y - 55;
      let headY = FLOOR_Y - 110;
      let hipX = sm.x;

      if (sm.isOnRocket) {
        hipY = sm.y;
        headY = sm.y - 50;
      } else if (sm.isFalling) {
        hipY = sm.y;
        headY = sm.y - 50;
      } else if (sm.isSitting) {
        hipY = DESK_Y + 2;
        headY = DESK_Y - 60;
        hipX = CHAIR_X - 8;
      }

      ctx.save();
      ctx.translate(hipX, hipY);

      if (sm.isFalling) {
        // Tumble rotation while falling
        ctx.rotate(Math.sin(t * 15) * 0.4);
      }

      // A. Legs
      if (sm.isOnRocket) {
        // Gripping rocket sides
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, 18);
        ctx.lineTo(-14, 30);
        ctx.moveTo(0, 0);
        ctx.lineTo(12, 18);
        ctx.lineTo(14, 30);
        ctx.stroke();
      } else if (sm.isFalling) {
        // Flailing legs in freefall
        const flail = Math.sin(t * 24) * 20;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, 15 + flail);
        ctx.lineTo(-24, 35 - flail);
        ctx.moveTo(0, 0);
        ctx.lineTo(18, 15 - flail);
        ctx.lineTo(24, 35 + flail);
        ctx.stroke();
      } else if (sm.isSitting) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(26, 0);
        ctx.lineTo(26, FLOOR_Y - hipY);
        ctx.moveTo(-4, 0);
        ctx.lineTo(22, 0);
        ctx.lineTo(22, FLOOR_Y - hipY);
        ctx.stroke();
      } else {
        const walkCycle = Math.sin(t * 12) * (sm.vx !== 0 ? 0.6 : 0.05);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.sin(walkCycle) * 25, 28);
        ctx.lineTo(Math.sin(walkCycle) * 32, FLOOR_Y - hipY);
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.sin(-walkCycle) * 25, 28);
        ctx.lineTo(Math.sin(-walkCycle) * 32, FLOOR_Y - hipY);
        ctx.stroke();
      }

      // B. Torso (Spine)
      const isFried = isPcBursted;
      const spineBend = isFried ? -0.35 : sm.isSitting ? 0.1 : Math.sin(t * 4) * 0.04;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.sin(spineBend) * 16, headY - hipY + 18);
      ctx.stroke();

      const neckX = Math.sin(spineBend) * 16;
      const neckY = headY - hipY + 18;

      // C. Head & Expressions
      const headRadius = 14;
      const headCenterX = neckX + (isFried ? -4 : 0);
      const headCenterY = neckY - headRadius;

      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.stroke();

      // D. Expressions & BRAIN FRIED EFFECTS 🧠⚡
      if (isFried) {
        ctx.lineWidth = 2;
        // Left eye 'X'
        ctx.beginPath();
        ctx.moveTo(headCenterX - 3, headCenterY - 4);
        ctx.lineTo(headCenterX + 1, headCenterY);
        ctx.moveTo(headCenterX + 1, headCenterY - 4);
        ctx.lineTo(headCenterX - 3, headCenterY);
        // Right eye 'X'
        ctx.moveTo(headCenterX + 4, headCenterY - 4);
        ctx.lineTo(headCenterX + 8, headCenterY);
        ctx.moveTo(headCenterX + 8, headCenterY - 4);
        ctx.lineTo(headCenterX + 4, headCenterY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(headCenterX + 2, headCenterY + 5, 5, 0, Math.PI);
        ctx.stroke();
        ctx.lineWidth = 3.5;

        // Smoking Brain Fumes & Lightning zig-zags
        const sparkPhase = Math.sin(t * 20);
        ctx.beginPath();
        ctx.moveTo(headCenterX - 6, headCenterY - headRadius);
        ctx.lineTo(headCenterX - 10, headCenterY - headRadius - 12);
        ctx.lineTo(headCenterX - 4, headCenterY - headRadius - 16);
        ctx.lineTo(headCenterX - 8 + sparkPhase * 3, headCenterY - headRadius - 26);
        ctx.moveTo(headCenterX + 6, headCenterY - headRadius);
        ctx.lineTo(headCenterX + 10, headCenterY - headRadius - 14);
        ctx.lineTo(headCenterX + 5, headCenterY - headRadius - 18);
        ctx.lineTo(headCenterX + 12 - sparkPhase * 3, headCenterY - headRadius - 28);
        ctx.stroke();

        if (Math.random() < 0.35) {
          particlesRef.current.push({
            x: hipX + headCenterX + (Math.random() - 0.5) * 12,
            y: hipY + headCenterY - headRadius - 10,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2,
            size: 3 + Math.random() * 4,
            alpha: 0.9,
            color: '#000000',
            life: 0,
            maxLife: 30,
            type: 'smoke',
          });
        }
      } else if (sm.isFalling) {
        // Shocked O-mouth in freefall
        ctx.fillRect(headCenterX - 2, headCenterY - 4, 3, 3);
        ctx.fillRect(headCenterX + 3, headCenterY - 4, 3, 3);
        ctx.beginPath();
        ctx.arc(headCenterX + 1, headCenterY + 4, 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (sm.isOnRocket) {
        // Thrilled grinning eyes
        ctx.beginPath();
        ctx.arc(headCenterX + 3, headCenterY - 1, 3, Math.PI, 0);
        ctx.arc(headCenterX + 3, headCenterY + 3, 4, 0, Math.PI);
        ctx.stroke();
      } else {
        ctx.fillRect(headCenterX + 4 * sm.facing, headCenterY - 2, 2.5, 2.5);
      }

      // E. Arms & Hands
      if (sm.isOnRocket) {
        // Clinging tightly to rocket fuselage
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX - 16, neckY + 8);
        ctx.lineTo(neckX - 12, neckY + 18);
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 16, neckY + 8);
        ctx.lineTo(neckX + 12, neckY + 18);
        ctx.stroke();
      } else if (sm.isFalling) {
        // Flailing arms up in air
        const flailArm = Math.sin(t * 22) * 15;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX - 22, neckY - 15 + flailArm);
        ctx.lineTo(neckX - 30, neckY - 30 - flailArm);
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 22, neckY - 15 - flailArm);
        ctx.lineTo(neckX + 30, neckY - 30 + flailArm);
        ctx.stroke();
      } else if (isFried) {
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX - 18, neckY + 28);
        ctx.lineTo(neckX - 24, neckY + 52);
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 12, neckY + 26);
        ctx.lineTo(neckX + 18, neckY + 48);
        ctx.stroke();
      } else if (sm.actionState === 'typing') {
        const typeL = Math.sin(t * 32) * 5;
        const typeR = Math.cos(t * 32) * 5;

        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 22, neckY + 18 + typeL);
        ctx.lineTo(neckX + 44, DESK_Y - hipY - 4 + typeL);
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 20, neckY + 22 + typeR);
        ctx.lineTo(neckX + 48, DESK_Y - hipY - 4 + typeR);
        ctx.stroke();

        if (Math.random() < 0.16) {
          const randomSkill = VANSH_SKILLS[Math.floor(Math.random() * VANSH_SKILLS.length)];
          skillsRef.current.push({
            text: randomSkill.text,
            category: randomSkill.cat,
            x: DESK_X + 60 + (Math.random() - 0.5) * 30,
            y: DESK_Y - 40,
            vx: (Math.random() - 0.5) * 0.9,
            vy: -1.6 - Math.random() * 1.6,
            alpha: 1,
            rotation: (Math.random() - 0.5) * 0.08,
          });
        }
      } else if (routineRef.current === 'coffee') {
        const sipPhase = Math.sin(t * 3);
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX - 16, neckY + 12);
        ctx.lineTo(neckX - 12 + sipPhase * 2, headCenterY + 4);
        ctx.stroke();
        ctx.strokeRect(neckX - 18, headCenterY + 2, 10, 10);
      } else if (routineRef.current === 'design') {
        const drawArmX = Math.sin(t * 8) * 16;
        const drawArmY = Math.cos(t * 8) * 16;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 24, neckY + drawArmY);
        ctx.lineTo(neckX + 50 + drawArmX, neckY - 20 + drawArmY);
        ctx.stroke();
      }

      ctx.restore();

      // ── 4. FLOATING SKILLS GOING UPWARD ──
      skillsRef.current = skillsRef.current.filter((sk) => {
        sk.x += sk.vx;
        sk.y += sk.vy;
        sk.alpha -= 0.012;
        if (sk.alpha <= 0 || sk.y < 30) return false;

        ctx.save();
        ctx.translate(sk.x, sk.y);
        ctx.rotate(sk.rotation);

        ctx.font = 'italic 500 11px "Space Grotesk", "Newsreader", "Courier New", monospace';
        ctx.fillStyle = `rgba(0, 0, 0, ${sk.alpha})`;

        const textMetrics = ctx.measureText(sk.text);
        const padX = 6;
        const padY = 3;
        ctx.strokeStyle = `rgba(0, 0, 0, ${sk.alpha * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(
          -padX,
          -10 - padY,
          textMetrics.width + padX * 2,
          14 + padY * 2
        );

        ctx.fillText(sk.text, 0, 0);
        ctx.restore();
        return true;
      });

      // ── 5. RIGID BODY PHYSICS PROPS ─────────────────────────
      const gravity = 0.42;
      const friction = 0.985;
      const restitution = 0.65;

      propsRef.current = propsRef.current.filter((prop) => {
        prop.vy += gravity;
        prop.vx *= friction;
        prop.x += prop.vx;
        prop.y += prop.vy;
        prop.angle += prop.angularVelocity;

        if (prop.y + prop.radius >= FLOOR_Y) {
          prop.y = FLOOR_Y - prop.radius;
          prop.vy = -prop.vy * restitution;
          prop.angularVelocity *= 0.8;
          prop.bounces++;
        }

        if (
          prop.x >= DESK_X &&
          prop.x <= DESK_X + DESK_W &&
          prop.y + prop.radius >= DESK_Y &&
          prop.y - prop.radius <= DESK_Y + 12 &&
          prop.vy > 0
        ) {
          prop.y = DESK_Y - prop.radius;
          prop.vy = -prop.vy * restitution;
          prop.bounces++;
        }

        if (prop.x - prop.radius < 20) {
          prop.x = 20 + prop.radius;
          prop.vx = -prop.vx * restitution;
        }
        if (prop.x + prop.radius > 940) {
          prop.x = 940 - prop.radius;
          prop.vx = -prop.vx * restitution;
        }

        ctx.save();
        ctx.translate(prop.x, prop.y);
        ctx.rotate(prop.angle);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;

        if (prop.type === 'cup') {
          ctx.strokeRect(-8, -10, 16, 20);
          ctx.beginPath();
          ctx.arc(8, 0, 5, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        } else {
          ctx.strokeRect(-prop.radius, -prop.radius, prop.radius * 2, prop.radius * 2);
          ctx.beginPath();
          ctx.moveTo(-prop.radius, -prop.radius);
          ctx.lineTo(prop.radius, prop.radius);
          ctx.stroke();
        }

        ctx.restore();
        return prop.bounces < 25;
      });

      // ── 6. PARTICLE ENGINE ─────────────────────────────────
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.alpha <= 0) return false;

        ctx.fillStyle = `rgba(0, 0, 0, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [switchRoutine]);

  return (
    <div className="w-full flex flex-col items-center select-none py-2 px-2">
      {/* Interactive Activity Header Bar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-2 px-3 py-2 border border-black/15 rounded bg-white shadow-2xs font-mono text-xs text-black">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-black animate-pulse" />
          <span className="font-semibold tracking-tight text-black">{taskName}</span>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-4 text-micro text-neutral-600">
          <span>
            Rocket Flights: <strong className="text-black font-mono">{score.launches}</strong>
          </span>
          <span>•</span>
          <span>
            Click Stage:{' '}
            <span className="text-neutral-900 underline decoration-dotted font-medium">Drop Physics Prop</span>
          </span>
        </div>
      </div>

      {/* Main Physics Canvas */}
      <div className="relative w-full max-w-4xl aspect-[2.18/1] bg-white border border-black/20 rounded shadow-xs overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block touch-none"
          title="Click anywhere to drop bouncing physics props!"
        />

        {/* Status Callout during rocket ride and fried brain */}
        {currentTask === 'rocket' && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black text-white text-[11px] font-mono rounded tracking-tight animate-bounce flex items-center gap-1.5 shadow-md">
            <Zap size={13} className="text-yellow-300" />
            <span>ROCKET RIDE ➔ MID-AIR BURST ➔ PC CRASH 🤯💥</span>
          </div>
        )}

        <div className="absolute top-3 right-3 px-2 py-1 bg-black text-white text-[10px] font-mono rounded tracking-tight opacity-80 pointer-events-none">
          STORY ENGINE • 60FPS VERLET
        </div>
      </div>

      {/* Task Control Ribbon (4-Step Streamlined Sequence) */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 mt-3 px-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => switchRoutine('coffee', true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
              currentTask === 'coffee'
                ? 'bg-black text-white border-black shadow-2xs'
                : 'bg-white text-black border-neutral-300 hover:border-black'
            }`}
          >
            <Coffee size={13} />
            <span>1. Coffee Brew</span>
          </button>

          <button
            onClick={() => switchRoutine('design', true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
              currentTask === 'design'
                ? 'bg-black text-white border-black shadow-2xs'
                : 'bg-white text-black border-neutral-300 hover:border-black'
            }`}
          >
            <PenTool size={13} />
            <span>2. Hobbies Mindmap</span>
          </button>

          <button
            onClick={() => switchRoutine('code', true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
              currentTask === 'code'
                ? 'bg-black text-white border-black shadow-2xs'
                : 'bg-white text-black border-neutral-300 hover:border-black'
            }`}
          >
            <Code size={13} />
            <span>3. Skills & Code</span>
          </button>

          <button
            onClick={() => switchRoutine('rocket', true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
              currentTask === 'rocket'
                ? 'bg-black text-white border-black shadow-2xs'
                : 'bg-white text-black border-neutral-300 hover:border-black'
            }`}
          >
            <Rocket size={13} />
            <span>4. Rocket Ride & Meltdown 🚀💥</span>
          </button>
        </div>

        {/* Auto Story Mode Toggle */}
        <button
          onClick={() => {
            playClickSound('high');
            setAutoCycle((prev) => {
              autoCycleRef.current = !prev;
              return !prev;
            });
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all border ${
            autoCycle
              ? 'bg-neutral-100 text-black border-black font-semibold'
              : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400'
          }`}
          title="Toggle automatic story routine progression (Coffee ➔ Mindmap ➔ Code ➔ Rocket Ride & Meltdown ➔ Reboot)"
        >
          {autoCycle ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
          <span>{autoCycle ? 'Auto Story [Active]' : 'Manual Mode'}</span>
        </button>
      </div>
    </div>
  );
};
