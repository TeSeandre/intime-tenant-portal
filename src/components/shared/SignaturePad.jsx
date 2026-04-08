import { useEffect, useRef } from 'react'
import SignaturePadLib from 'signature_pad'

/**
 * Canvas-based signature pad.
 *
 * Props:
 *   onSave(dataUrl: string) — called with PNG data URL when tenant clicks Save
 *   onClear()               — optional, called after clearing
 */
export default function SignaturePad({ onSave, onClear }) {
  const canvasRef = useRef(null)
  const padRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    padRef.current = new SignaturePadLib(canvas, {
      penColor: '#2E2E2E',
      backgroundColor: 'rgb(255,255,255)',
    })

    function resizeCanvas() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext('2d').scale(ratio, ratio)
      padRef.current.clear()
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  function handleClear() {
    padRef.current.clear()
    if (onClear) onClear()
  }

  function handleSave() {
    if (padRef.current.isEmpty()) return
    const dataUrl = padRef.current.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-sm font-medium text-brand-charcoal'>Sign below</p>
      <div className='rounded-lg border-2 border-gray-300 bg-white overflow-hidden'>
        <canvas
          ref={canvasRef}
          className='w-full'
          style={{ height: '140px', touchAction: 'none' }}
        />
      </div>
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={handleClear}
          className='flex-1 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors'
        >
          Clear
        </button>
        <button
          type='button'
          onClick={handleSave}
          className='flex-1 py-2 text-sm rounded-lg bg-brand-terra text-white hover:bg-brand-terra-dk transition-colors'
        >
          Save Signature
        </button>
      </div>
    </div>
  )
}
