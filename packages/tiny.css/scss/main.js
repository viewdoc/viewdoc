const onReady = (fn) => {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

onReady(() => {
  const changeThemeButton = document.getElementById('changeThemeButton')
  const themeStyles = Array.prototype.slice.call(document.querySelectorAll('link[rel=stylesheet]'))
  const getNonActiveThemeStyle = () => {
    return themeStyles.find((themeStyle) => themeStyle.media === 'none')
  }
  const updateButtonLabel = () => {
    const nonActiveThemeStyleId = getNonActiveThemeStyle().id
    changeThemeButton.innerHTML = 'Switch to ' + nonActiveThemeStyleId.split('-')[0].toUpperCase() + ' theme'
  }
  updateButtonLabel()
  changeThemeButton.addEventListener('click', () => {
    const nonActiveThemeStyleId = getNonActiveThemeStyle().id
    themeStyles.forEach((themeStyle) => {
      themeStyle.media = themeStyle.id === nonActiveThemeStyleId ? 'all' : 'none'
    })
    updateButtonLabel()
  })
})
