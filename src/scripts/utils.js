export const detectDeviceType = () => (/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop')

export const isMobileDevice = () => detectDeviceType() === 'Mobile'
// export const isMobileDevice = () => false
// 'Mobile' or 'Desktop'
