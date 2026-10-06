import Cookies from "js-cookie"

/**
 * Aplica o tema (light | dark | system), persiste em cookie,
 * atualiza o store e ajusta status bar / navigation bar nativas (WTN).
 *
 * @param {string} theme - 'light' | 'dark' | 'system'
 * @param {{ savedTheme: import('vue').Ref<string>, store: object }} ctx
 */

export const setThemeColor = (theme, { savedTheme, store }) => {
  // Salvar preferência
  if (savedTheme.value !== theme) {
    Cookies.set('theme', theme)
    savedTheme.value = theme
    store.commit("SET_CURRENT_THEME", theme)
  }

  // Aplicar classe no HTML
  if (savedTheme.value === 'dark') {
    window?.WTN?.setNavigationBarColor({ color: "#000000" });
    window?.WTN?.statusBar({
      style: 'light',
      color: '000000',
      overlay: false // Only for android
    })
    // Aplicar tema escuro
    document.documentElement.classList.add('dark')
  } else if (savedTheme.value === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (isDark) {
      window?.WTN?.setNavigationBarColor({ color: "#000000" })
      window?.WTN?.statusBar({
        style: 'dark',
        color: '000000',
        overlay: false // Only for android
      })

      document.documentElement.classList.add('dark')
    } else {
      window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" })
      window?.WTN.statusBar({
        style: 'dark',
        color: "FFFFFF",
        overlay: false // Only for android
      })

      document.documentElement.classList.remove('dark')
    }
  } else {
    window?.WTN?.setNavigationBarColor({ color: "#FFFFFF" })
    window?.WTN.statusBar({
      style: 'dark',
      color: "FFFFFF",
      overlay: false // Only for android
    })
    // Aplicar tema claro
    document.documentElement.classList.remove('dark')
  }
}

/**
 * Tema aplicado quando NÃO há sessão (usuário deslogado):
 * segue o tema do sistema, com status bar em overlay.
 */
export const applyGuestSystemTheme = () => {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (dark) {
    window.WTN?.setNavigationBarColor({ color: "000000" })
    window.WTN?.statusBar({
      style: "light",
      color: "00000000",
      overlay: true, // Somente Android
    })
    document.documentElement.classList.add("dark", dark)
  } else {
    window.WTN.statusBar({
      style: "dark",
      color: "00000000",
      overlay: true // Somente Android
    })
    window.WTN.setNavigationBarColor({ color: "FFFFFF" })
    document.documentElement.classList.remove("dark")
  }
}