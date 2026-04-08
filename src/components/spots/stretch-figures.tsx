'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Lightweight animated stick figures for MirrorStretch.
 * Each component is a ~400x400 SVG with a 2-second looped animation.
 */

const FIG_STROKE = '#ffffff'
const FIG_ACCENT = '#f97316'

interface FigureProps {
  size?: number
}

const baseSvgProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 400 400',
  fill: 'none' as const,
  stroke: FIG_STROKE,
  strokeWidth: 10,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

// Shared body (head + torso + legs)
const Body = () => (
  <>
    <line x1={200} y1={150} x2={200} y2={260} />
    <line x1={200} y1={260} x2={165} y2={340} />
    <line x1={200} y1={260} x2={235} y2={340} />
  </>
)

export const NeckStretch: React.FC<FigureProps> = ({ size = 400 }) => (
  <svg {...baseSvgProps(size)}>
    <motion.g
      animate={{ rotate: [-18, 18, -18] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ originX: '200px', originY: '150px' }}
    >
      <circle cx={200} cy={110} r={38} stroke={FIG_ACCENT} />
    </motion.g>
    <Body />
    <line x1={200} y1={180} x2={140} y2={230} />
    <line x1={200} y1={180} x2={260} y2={230} />
  </svg>
)

export const ShoulderStretch: React.FC<FigureProps> = ({ size = 400 }) => (
  <svg {...baseSvgProps(size)}>
    <circle cx={200} cy={110} r={38} />
    <Body />
    <motion.line
      x1={200}
      y1={180}
      x2={140}
      y2={230}
      stroke={FIG_ACCENT}
      animate={{ x2: [140, 260, 140], y2: [230, 140, 230] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.line
      x1={200}
      y1={180}
      x2={260}
      y2={230}
      stroke={FIG_ACCENT}
      animate={{ x2: [260, 140, 260], y2: [230, 140, 230] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </svg>
)

export const WaistStretch: React.FC<FigureProps> = ({ size = 400 }) => (
  <svg {...baseSvgProps(size)}>
    <motion.g
      animate={{ rotate: [-20, 20, -20] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ originX: '200px', originY: '260px' }}
    >
      <circle cx={200} cy={110} r={38} />
      <line x1={200} y1={150} x2={200} y2={260} stroke={FIG_ACCENT} />
      <line x1={200} y1={180} x2={140} y2={230} />
      <line x1={200} y1={180} x2={260} y2={230} />
    </motion.g>
    <line x1={200} y1={260} x2={165} y2={340} />
    <line x1={200} y1={260} x2={235} y2={340} />
  </svg>
)

export const WristStretch: React.FC<FigureProps> = ({ size = 400 }) => (
  <svg {...baseSvgProps(size)}>
    <circle cx={200} cy={110} r={38} />
    <Body />
    <line x1={200} y1={180} x2={150} y2={240} />
    <line x1={200} y1={180} x2={250} y2={240} />
    <motion.circle
      cx={150}
      cy={240}
      r={14}
      stroke={FIG_ACCENT}
      animate={{ cy: [240, 215, 240] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.circle
      cx={250}
      cy={240}
      r={14}
      stroke={FIG_ACCENT}
      animate={{ cy: [240, 215, 240] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </svg>
)

export const EyeStretch: React.FC<FigureProps> = ({ size = 400 }) => (
  <svg {...baseSvgProps(size)}>
    <circle cx={200} cy={140} r={70} />
    <motion.circle
      cx={175}
      cy={140}
      r={10}
      fill={FIG_ACCENT}
      stroke="none"
      animate={{ cx: [175, 225, 175], cy: [140, 140, 140] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.circle
      cx={225}
      cy={140}
      r={10}
      fill={FIG_ACCENT}
      stroke="none"
      animate={{ cx: [225, 175, 225], cy: [140, 140, 140] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  </svg>
)

export const FullBodyStretch: React.FC<FigureProps> = ({ size = 400 }) => (
  <svg {...baseSvgProps(size)}>
    <motion.g
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <circle cx={200} cy={110} r={38} stroke={FIG_ACCENT} />
      <Body />
      <line x1={200} y1={180} x2={140} y2={100} stroke={FIG_ACCENT} />
      <line x1={200} y1={180} x2={260} y2={100} stroke={FIG_ACCENT} />
    </motion.g>
  </svg>
)

export const STRETCH_FIGURES = {
  neck: NeckStretch,
  shoulder: ShoulderStretch,
  waist: WaistStretch,
  wrist: WristStretch,
  eye: EyeStretch,
  fullbody: FullBodyStretch,
} as const

export type StretchKey = keyof typeof STRETCH_FIGURES
