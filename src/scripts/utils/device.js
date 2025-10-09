const isTouchDevice = () => 'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0

if (!isTouchDevice()) {
  console.log('is not touch')
} else {
  console.log('is touch')
}

// Helper function to only react to events inside the canvas
const isPointerInElement = (e, targetEl) => {
  const isTouch = isTouchDevice()

  const { left, right, top, bottom } = targetEl.getBoundingClientRect()
  const x = isTouch ? e.touches[0].pageX : e.clientX
  const y = isTouch ? e.touches[0].pageY : e.clientY

  return x >= left && x <= right && y >= top && y <= bottom
}

const getCenterScrollPosition = (element) => {
  const rect = element.getBoundingClientRect()
  const absoluteElementTop = rect.top + window.pageYOffset
  const offset = window.innerHeight / 2 - rect.height / 2
  return absoluteElementTop - offset
}

export { isTouchDevice, isPointerInElement, getCenterScrollPosition }
