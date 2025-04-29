let isScrolling = false
let scrollTimeout = null

document.addEventListener('DOMContentLoaded', (e) => {
  const sections = document.querySelectorAll('section')

  const animateSection = (element, modelId) => {
    isScrolling = true

    const id = modelId

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    // create custom events
    const swapModelEvent = new CustomEvent('swap-target', {
      detail: {
        targetId: parseInt(id),
      },
    })

    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      isScrolling = false
    }, 200)

    // dispatch the events
    console.log('dispatching id ::: ', id)
    document.dispatchEvent(swapModelEvent)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const { modelId } = entry.target.dataset

        if (modelId < 0) return

        console.log(entry.intersectionRatio)
        // if (entry.isIntersecting && !isScrolling) {
        //   animateSection(entry.target, modelId)
        // }
      })
    },
    { threshold: 0.01 }
  ) // fire when 25% of section is visible

  sections.forEach((section) => {
    observer.observe(section)
  })
})
