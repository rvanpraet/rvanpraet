export const detectDeviceType = () => (/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop')

// export const isMobileDevice = () => detectDeviceType() === 'Mobile'
export const isMobileDevice = () => true
// 'Mobile' or 'Desktop'
