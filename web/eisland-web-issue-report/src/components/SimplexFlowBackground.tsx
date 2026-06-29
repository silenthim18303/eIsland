/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file SimplexFlowBackground.tsx
 * @description 全屏 Simplex 噪声流动背景组件
 * @author 鸡哥
 */

import { useRef } from 'react'
import { useSimplexFlow } from '../hooks/useSimplexFlow'
import '../styles/SimplexFlowBackground.css'

function SimplexFlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useSimplexFlow(canvasRef)

  return (
    <div className="simplex-flow-background" aria-hidden="true">
      <canvas ref={canvasRef} className="simplex-flow-background__canvas" />
      <div className="simplex-flow-background__glass" />
    </div>
  )
}

export default SimplexFlowBackground
