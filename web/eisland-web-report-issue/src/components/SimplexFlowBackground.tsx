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
