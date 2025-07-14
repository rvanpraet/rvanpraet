const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
  XXXL: 1920,
}

const isXS = () => {
  return window.innerWidth < BREAKPOINTS.SM
}

const isSM = () => {
  return BREAKPOINTS.SM <= window.innerWidth && window.innerWidth < BREAKPOINTS.MD
}

const isMD = () => {
  return BREAKPOINTS.MD <= window.innerWidth && window.innerWidth < BREAKPOINTS.LG
}

const isLG = () => {
  return BREAKPOINTS.LG <= window.innerWidth && window.innerWidth < BREAKPOINTS.XL
}

const isXL = () => {
  return BREAKPOINTS.XL <= window.innerWidth && window.innerWidth < BREAKPOINTS.XXL
}

const isXXL = () => {
  return BREAKPOINTS.XXL <= window.innerWidth && window.innerWidth < BREAKPOINTS.XXL
}

const isXXXL = () => {
  return window.innerWidth >= BREAKPOINTS.XXXL
}

const isDesktop = () => window.innerWidth >= BREAKPOINTS.LG
const isMobile = () => !isDesktop()

const getCurrentBreakpoint = () => {
  return isXS() ? 'xs' : isSM() ? 'sm' : isMD() ? 'md' : isLG() ? 'lg' : isXL() ? 'xl' : isXXL() ? 'xxl' : 'xxxl'
}

export { BREAKPOINTS, isXS, isSM, isMD, isLG, isXL, isXXL, isXXXL, isMobile, isDesktop, getCurrentBreakpoint }
