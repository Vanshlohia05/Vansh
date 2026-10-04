import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playClickSound } from '../utils/sound';
import { Coffee, Code, Bug, Rocket, PenTool, Play, RefreshCw } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Physics & Vector Data Structures
// ─────────────────────────────────────────────────────────────
interface PhysicsProp {
  id: number;
  type: 'cup' | 'bug' | 'cube' | 'disk' | 'gear';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  angularVelocity: number;
  bounces: number;
  squashed?: boolean;
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
}

interface CodeToken {
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
}

export type WorkRoutine = 'coffee' | 'design' | 'code' | 'bug' | 'deploy';

export const StickmanHero: React.FC<{
  onActivityChange?: (activityTitle: string, stepIndex: number) => void;
}> = ({ onActivityChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTask, setCurrentTask] = useState<WorkRoutine>('code');
  const [autoCycle, setAutoCycle] = useState<boolean>(true);
  const [taskName, setTaskName] = useState<string>('Deep Coding & Engineering');
  const [score, setScore] = useState<{ bugs: number; deploys: number; coffee: number }>({
    bugs: 0,
    deploys: 0,
    coffee: 1,
  });

  // State refs for animation loop
  const routineRef = useRef<WorkRoutine>('code');
  const routineTimeRef = useRef<number>(0);
  const autoCycleRef = useRef<boolean>(true);
  const propsRef = useRef<PhysicsProp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const codeTokensRef = useRef<CodeToken[]>([]);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);

  // Stickman Physical Coordinates & Articulated Rig
  const stickmanRef = useRef({
    x: 420,
    y: 330,
    vx: 0,
    vy: 0,
    targetX: 420,
    isSitting: true,
    facing: 1, // 1 = right, -1 = left
    actionState: 'typing', // typing, walking, jumping, hammer, pouring, drawing
    headAngle: 0,
    armLAngle: 0,
    armRAngle: 0,
    elbowLAngle: 0,
    elbowRAngle: 0,
    legLAngle: 0,
    legRAngle: 0,
    kneeLAngle: 0,
    kneeRAngle: 0,
    squashY: 1,
    squashX: 1,
    expression: 'focus', // 'focus', 'happy', 'shocked', 'tired'
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

      if (routine === 'coffee') {
        setTaskName('Morning Coffee & Fueling Up');
        sm.targetX = 180;
        sm.isSitting = false;
        sm.facing = -1;
        playClickSound('paper');
        onActivityChange?.('Coffee Station & Fueling', 1);
      } else if (routine === 'design') {
        setTaskName('System Architecture & Whiteboard');
        sm.targetX = 720;
        sm.isSitting = false;
        sm.facing = 1;
        playClickSound('high');
        onActivityChange?.('Architecture & Whiteboard Design', 2);
      } else if (routine === 'code') {
        setTaskName('Deep Coding & Mechanical Keyboard');
        sm.targetX = 420;
        sm.isSitting = true;
        sm.facing = 1;
        playClickSound('tick');
        onActivityChange?.('Deep Coding & Architecture', 3);
      } else if (routine === 'bug') {
        setTaskName('Physics Bug Squashing');
        sm.targetX = 420;
        sm.isSitting = false;
        sm.facing = 1;
        playClickSound('pop');
        // Spawn a bouncy physics bug!
        propsRef.current.push({
          id: Date.now(),
          type: 'bug',
          x: 430 + (Math.random() * 80 - 40),
          y: 60,
          vx: (Math.random() - 0.5) * 6,
          vy: 2,
          radius: 14,
          angle: 0,
          angularVelocity: 0.15,
          bounces: 0,
        });
        onActivityChange?.('Bug Hunting & Physics Fixes', 4);
      } else if (routine === 'deploy') {
        setTaskName('Production Deploy & Rocket Launch');
        sm.targetX = 420;
        sm.isSitting = false;
        sm.facing = 1;
        playClickSound('spear');
        onActivityChange?.('Production Deployment & Launch 🚀', 5);
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

    const propTypes: ('cup' | 'cube' | 'disk' | 'bug' | 'gear')[] = ['cup', 'cube', 'disk', 'bug', 'gear'];
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

    // Spawn burst particles
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
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

    const routinesList: WorkRoutine[] = ['coffee', 'design', 'code', 'bug', 'deploy'];

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      routineTimeRef.current += dt;

      // ── Auto-cycle Work Routine every 7 seconds ──
      if (autoCycleRef.current && routineTimeRef.current > 7) {
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

      // Clear Canvas (Crisp White / Minimalist)
      ctx.clearRect(0, 0, 960, 440);

      // Set Universal Solid Black Ink Styling
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // ── 1. ENVIRONMENT / LAB STAGE ─────────────────────────
      // Ground baseline
      ctx.beginPath();
      ctx.moveTo(40, FLOOR_Y);
      ctx.lineTo(920, FLOOR_Y);
      ctx.stroke();

      // Floor hatch marks for architectural tactile feel
      for (let i = 60; i < 900; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, FLOOR_Y + 1);
        ctx.lineTo(i - 8, FLOOR_Y + 10);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.lineWidth = 3.5;

      // ── Environment Station A: Coffee Espresso Machine (x: 120-180) ──
      ctx.beginPath();
      // Machine body
      ctx.strokeRect(100, 240, 65, 120);
      // Cup tray
      ctx.strokeRect(95, 330, 75, 10);
      // Group head & nozzle
      ctx.strokeRect(120, 275, 25, 18);
      // Top bean hopper
      ctx.beginPath();
      ctx.arc(132, 230, 16, 0, Math.PI, true);
      ctx.stroke();
      // Espresso Pressure Gauge
      ctx.beginPath();
      ctx.arc(148, 255, 7, 0, Math.PI * 2);
      ctx.stroke();
      // Lever
      const leverAngle = routineRef.current === 'coffee' ? 0.35 : -0.2;
      ctx.beginPath();
      ctx.moveTo(105, 255);
      ctx.lineTo(105 + Math.cos(leverAngle) * 28, 255 - Math.sin(leverAngle) * 28);
      ctx.stroke();
      // Drip fluid particles when brewing
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
        // Steam wisps
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

      // ── Environment Station B: Whiteboard Architecture (x: 700-880) ──
      // Whiteboard frame
      ctx.strokeRect(700, 100, 190, 160);
      // Stand legs
      ctx.beginPath();
      ctx.moveTo(715, 260);
      ctx.lineTo(700, FLOOR_Y);
      ctx.moveTo(875, 260);
      ctx.lineTo(890, FLOOR_Y);
      ctx.stroke();

      // Diagram sketches on whiteboard
      ctx.lineWidth = 2;
      ctx.strokeRect(715, 120, 42, 22); // [Client]
      ctx.strokeRect(775, 120, 42, 22); // [API / Node]
      ctx.strokeRect(835, 120, 42, 22); // [Database]
      ctx.strokeRect(775, 175, 42, 22); // [Cache]
      // Flow arrows
      ctx.beginPath();
      ctx.moveTo(757, 131);
      ctx.lineTo(775, 131);
      ctx.moveTo(817, 131);
      ctx.lineTo(835, 131);
      ctx.moveTo(796, 142);
      ctx.lineTo(796, 175);
      ctx.stroke();
      // Flow labels
      ctx.font = 'bold 8px monospace';
      ctx.fillText('UI', 728, 134);
      ctx.fillText('API', 786, 134);
      ctx.fillText('DB', 848, 134);
      ctx.fillText('REDIS', 780, 189);
      ctx.lineWidth = 3.5;

      // ── Environment Station C: Workstation Desk & Multi-Monitor (Center) ──
      // Desk
      ctx.strokeRect(DESK_X, DESK_Y, DESK_W, 12);
      ctx.beginPath();
      ctx.moveTo(DESK_X + 15, DESK_Y + 12);
      ctx.lineTo(DESK_X + 15, FLOOR_Y);
      ctx.moveTo(DESK_X + DESK_W - 15, DESK_Y + 12);
      ctx.lineTo(DESK_X + DESK_W - 15, FLOOR_Y);
      ctx.stroke();

      // Main Monitor
      ctx.strokeRect(DESK_X + 50, DESK_Y - 95, 75, 70);
      ctx.strokeRect(DESK_X + 54, DESK_Y - 91, 67, 52); // Screen
      ctx.beginPath();
      ctx.moveTo(DESK_X + 87, DESK_Y - 25);
      ctx.lineTo(DESK_X + 87, DESK_Y);
      ctx.moveTo(DESK_X + 75, DESK_Y);
      ctx.lineTo(DESK_X + 100, DESK_Y);
      ctx.stroke();

      // Second Vertical Monitor (Code Docs / Metrics)
      ctx.strokeRect(DESK_X + 130, DESK_Y - 110, 36, 85);
      ctx.beginPath();
      ctx.moveTo(DESK_X + 148, DESK_Y - 25);
      ctx.lineTo(DESK_X + 148, DESK_Y);
      ctx.stroke();

      // Mechanical Keyboard
      ctx.strokeRect(DESK_X + 50, DESK_Y - 6, 32, 6);

      // Swivel Chair
      const chairX = 405;
      ctx.beginPath();
      // Backrest
      ctx.moveTo(chairX - 25, DESK_Y - 55);
      ctx.lineTo(chairX - 25, DESK_Y + 5);
      ctx.lineTo(chairX + 10, DESK_Y + 5); // seat
      // Hydraulic pole & caster wheels
      ctx.moveTo(chairX - 10, DESK_Y + 5);
      ctx.lineTo(chairX - 10, FLOOR_Y - 5);
      ctx.moveTo(chairX - 25, FLOOR_Y - 3);
      ctx.lineTo(chairX + 5, FLOOR_Y - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(chairX - 25, FLOOR_Y - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(chairX + 5, FLOOR_Y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Deploy Rocket Rig (x: 620-660)
      if (routineRef.current === 'deploy') {
        const launchProgress = Math.min(routineTimeRef.current / 3.5, 1);
        const rocketY = FLOOR_Y - 10 - launchProgress * 320;

        ctx.save();
        ctx.translate(630, rocketY);
        // Rocket body
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(12, -10);
        ctx.lineTo(12, 15);
        ctx.lineTo(-12, 15);
        ctx.lineTo(-12, -10);
        ctx.closePath();
        ctx.stroke();
        // Fins
        ctx.beginPath();
        ctx.moveTo(-12, 5);
        ctx.lineTo(-20, 20);
        ctx.lineTo(-12, 18);
        ctx.moveTo(12, 5);
        ctx.lineTo(20, 20);
        ctx.lineTo(12, 18);
        ctx.stroke();
        // Thruster sparks
        if (launchProgress > 0.1 && rocketY > -50) {
          for (let i = 0; i < 3; i++) {
            particlesRef.current.push({
              x: 630 + (Math.random() - 0.5) * 8,
              y: rocketY + 20,
              vx: (Math.random() - 0.5) * 3,
              vy: 3 + Math.random() * 4,
              size: 3 + Math.random() * 3,
              alpha: 1,
              color: '#000000',
              life: 0,
              maxLife: 25,
            });
          }
        }
        ctx.restore();
      }

      // ── 2. STICKMAN PHYSICS, SQUASH & KINEMATICS ────────────
      const sm = stickmanRef.current;

      // Kinematic movement towards targetX
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

      // Squash and stretch spring
      sm.squashX += (1 - sm.squashX) * 0.12;
      sm.squashY += (1 - sm.squashY) * 0.12;

      // Calculate articulated stickman posture based on current routine
      const t = routineTimeRef.current;

      let hipY = FLOOR_Y - 55;
      let headY = FLOOR_Y - 110;
      let hipX = sm.x;

      if (sm.isSitting) {
        hipY = DESK_Y + 2;
        headY = DESK_Y - 60;
        hipX = chairX - 8;
      }

      // Draw Stickman Rig
      ctx.save();
      ctx.translate(hipX, hipY);
      ctx.scale(sm.squashX, sm.squashY);

      // A. Legs & Feet
      if (sm.isSitting) {
        // Sitting leg angles
        ctx.beginPath();
        // Left Leg: Thigh forward, Shin down
        ctx.moveTo(0, 0);
        ctx.lineTo(26, 0);
        ctx.lineTo(26, FLOOR_Y - hipY);
        // Right Leg
        ctx.moveTo(-4, 0);
        ctx.lineTo(22, 0);
        ctx.lineTo(22, FLOOR_Y - hipY);
        ctx.stroke();
      } else {
        // Walking / Standing leg kinematic cycles
        const walkCycle = Math.sin(t * 12) * (sm.vx !== 0 ? 0.6 : 0.05);
        ctx.beginPath();
        // Leg 1
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.sin(walkCycle) * 25, 28);
        ctx.lineTo(Math.sin(walkCycle) * 32, FLOOR_Y - hipY);
        // Leg 2
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.sin(-walkCycle) * 25, 28);
        ctx.lineTo(Math.sin(-walkCycle) * 32, FLOOR_Y - hipY);
        ctx.stroke();
      }

      // B. Torso (Spine)
      const spineBend = sm.isSitting ? 0.1 : Math.sin(t * 4) * 0.04;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.sin(spineBend) * 8, headY - hipY + 18);
      ctx.stroke();

      const neckX = Math.sin(spineBend) * 8;
      const neckY = headY - hipY + 18;

      // C. Head & Dynamic Expressions
      const headRadius = 14;
      const headCenterX = neckX;
      const headCenterY = neckY - headRadius;
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Face expressions (eyes & mouth)
      ctx.fillStyle = '#000000';
      if (routineRef.current === 'bug') {
        // Intense hunter eyes
        ctx.fillRect(headCenterX + 3 * sm.facing, headCenterY - 3, 3, 3);
        ctx.beginPath();
        ctx.arc(headCenterX + 4 * sm.facing, headCenterY + 5, 4, Math.PI, 0, true);
        ctx.stroke();
      } else if (routineRef.current === 'deploy') {
        // Joyous happy smile
        ctx.beginPath();
        ctx.arc(headCenterX + 3 * sm.facing, headCenterY + 2, 5, 0, Math.PI);
        ctx.stroke();
      } else {
        // Focused coding dots
        ctx.fillRect(headCenterX + 4 * sm.facing, headCenterY - 2, 2.5, 2.5);
      }

      // D. Arms & Hands with Contextual Actions
      if (sm.actionState === 'typing') {
        // High speed typing bobbing
        const typeL = Math.sin(t * 32) * 5;
        const typeR = Math.cos(t * 32) * 5;

        // Left arm to keyboard
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 22, neckY + 18 + typeL);
        ctx.lineTo(neckX + 44, DESK_Y - hipY - 4 + typeL);
        // Right arm to keyboard
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 20, neckY + 22 + typeR);
        ctx.lineTo(neckX + 48, DESK_Y - hipY - 4 + typeR);
        ctx.stroke();

        // Spawn Flying Code Tokens from keyboard to screen!
        if (Math.random() < 0.22) {
          const tokens = ['const', 'async', 'git.push', '<React />', '200 OK', 'fn()', 'state: true', '🚀', 'λ'];
          codeTokensRef.current.push({
            text: tokens[Math.floor(Math.random() * tokens.length)],
            x: DESK_X + 60,
            y: DESK_Y - 15,
            vx: 0.5 + Math.random() * 1.5,
            vy: -1.5 - Math.random() * 2,
            alpha: 1,
          });
        }
      } else if (routineRef.current === 'coffee') {
        // Holding coffee cup to mouth
        const sipPhase = Math.sin(t * 3);
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX - 16, neckY + 12);
        ctx.lineTo(neckX - 12 + sipPhase * 2, headCenterY + 4);
        ctx.stroke();
        // Mini Cup in hand
        ctx.strokeRect(neckX - 18, headCenterY + 2, 10, 10);
      } else if (routineRef.current === 'design') {
        // Drawing on whiteboard with marker
        const drawArmX = Math.sin(t * 8) * 16;
        const drawArmY = Math.cos(t * 8) * 16;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 24, neckY + drawArmY);
        ctx.lineTo(neckX + 50 + drawArmX, neckY - 20 + drawArmY);
        ctx.stroke();
      } else if (routineRef.current === 'bug') {
        // Wielding Debugger Hammer / Squash
        const swing = Math.sin(t * 14) * 1.2;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 18, neckY - 15);
        ctx.lineTo(neckX + 25 + Math.cos(swing) * 25, neckY - 15 + Math.sin(swing) * 25);
        ctx.stroke();
        // Hammer head
        const hx = neckX + 25 + Math.cos(swing) * 25;
        const hy = neckY - 15 + Math.sin(swing) * 25;
        ctx.strokeRect(hx - 6, hy - 12, 12, 24);
      } else {
        // Relaxed arm
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 4);
        ctx.lineTo(neckX + 14 * sm.facing, neckY + 24);
        ctx.stroke();
      }

      ctx.restore();

      // ── 3. CODE TOKENS FLYING ENGINE ───────────────────────
      ctx.font = 'bold 9px monospace';
      codeTokensRef.current = codeTokensRef.current.filter((ct) => {
        ct.x += ct.vx;
        ct.y += ct.vy;
        ct.alpha -= 0.02;
        if (ct.alpha <= 0) return false;

        ctx.fillStyle = `rgba(0, 0, 0, ${ct.alpha})`;
        ctx.fillText(ct.text, ct.x, ct.y);
        return true;
      });

      // ── 4. RIGID BODY PHYSICS ENGINE (Gravity, Collisions, Restitution) ──
      const gravity = 0.42;
      const friction = 0.985;
      const restitution = 0.65;

      propsRef.current = propsRef.current.filter((prop) => {
        // Apply forces
        prop.vy += gravity;
        prop.vx *= friction;
        prop.x += prop.vx;
        prop.y += prop.vy;
        prop.angle += prop.angularVelocity;

        // Collision: Floor
        if (prop.y + prop.radius >= FLOOR_Y) {
          prop.y = FLOOR_Y - prop.radius;
          prop.vy = -prop.vy * restitution;
          prop.angularVelocity *= 0.8;
          prop.bounces++;

          // Bug squash detection
          if (prop.type === 'bug' && routineRef.current === 'bug' && prop.bounces >= 2) {
            setScore((s) => ({ ...s, bugs: s.bugs + 1 }));
            // Spawn explosion particles
            for (let i = 0; i < 14; i++) {
              particlesRef.current.push({
                x: prop.x,
                y: prop.y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 6,
                size: 3 + Math.random() * 3,
                alpha: 1,
                color: '#000000',
                life: 0,
                maxLife: 35,
              });
            }
            playClickSound('pop');
            return false;
          }
        }

        // Collision: Desk top
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

        // Left / Right wall bounds
        if (prop.x - prop.radius < 20) {
          prop.x = 20 + prop.radius;
          prop.vx = -prop.vx * restitution;
        }
        if (prop.x + prop.radius > 940) {
          prop.x = 940 - prop.radius;
          prop.vx = -prop.vx * restitution;
        }

        // Draw physical prop in solid black line art
        ctx.save();
        ctx.translate(prop.x, prop.y);
        ctx.rotate(prop.angle);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;

        if (prop.type === 'bug') {
          // Bouncy bug orb with legs & antennae
          ctx.beginPath();
          ctx.arc(0, 0, prop.radius, 0, Math.PI * 2);
          ctx.stroke();
          // Antennae
          ctx.beginPath();
          ctx.moveTo(-4, -prop.radius);
          ctx.lineTo(-8, -prop.radius - 6);
          ctx.moveTo(4, -prop.radius);
          ctx.lineTo(8, -prop.radius - 6);
          // Legs
          ctx.moveTo(-prop.radius, 0);
          ctx.lineTo(-prop.radius - 6, 4);
          ctx.moveTo(prop.radius, 0);
          ctx.lineTo(prop.radius + 6, 4);
          ctx.stroke();
        } else if (prop.type === 'cup') {
          ctx.strokeRect(-8, -10, 16, 20);
          ctx.beginPath();
          ctx.arc(8, 0, 5, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        } else if (prop.type === 'cube') {
          ctx.strokeRect(-prop.radius, -prop.radius, prop.radius * 2, prop.radius * 2);
          ctx.beginPath();
          ctx.moveTo(-prop.radius, -prop.radius);
          ctx.lineTo(prop.radius, prop.radius);
          ctx.stroke();
        } else {
          // Floppy disk / gear
          ctx.strokeRect(-10, -10, 20, 20);
          ctx.strokeRect(-6, -8, 12, 6);
        }

        ctx.restore();

        // Keep prop if not settled or young
        return prop.bounces < 25;
      });

      // ── 5. PARTICLE FX ENGINE (Sparks, Steam, Explosions) ───
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

        {/* Live Score & Metrics */}
        <div className="flex items-center gap-4 text-micro text-neutral-600">
          <span>
            Bugs Squashed: <strong className="text-black font-mono">{score.bugs}</strong>
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

        {/* Interactive Overlay Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black text-white text-[10px] font-mono rounded tracking-tight opacity-80 pointer-events-none">
          PHYSICS 60FPS • VERLET KINEMATICS
        </div>
      </div>

      {/* Task Control Ribbon */}
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
            <span>Coffee Brew</span>
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
            <span>Architecture</span>
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
            <span>Deep Code</span>
          </button>

          <button
            onClick={() => switchRoutine('bug', true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
              currentTask === 'bug'
                ? 'bg-black text-white border-black shadow-2xs'
                : 'bg-white text-black border-neutral-300 hover:border-black'
            }`}
          >
            <Bug size={13} />
            <span>Squash Bug</span>
          </button>

          <button
            onClick={() => switchRoutine('deploy', true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
              currentTask === 'deploy'
                ? 'bg-black text-white border-black shadow-2xs'
                : 'bg-white text-black border-neutral-300 hover:border-black'
            }`}
          >
            <Rocket size={13} />
            <span>Deploy</span>
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
          title="Toggle automatic story routine progression"
        >
          {autoCycle ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
          <span>{autoCycle ? 'Auto Story [Active]' : 'Manual Mode'}</span>
        </button>
      </div>
    </div>
  );
};
