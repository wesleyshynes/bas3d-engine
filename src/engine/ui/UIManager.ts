export class UIManager {
  private startOverlay: HTMLElement
  private pauseOverlay: HTMLElement
  private hud: HTMLElement
  private startCallback: (() => void) | null = null
  private pauseCallback: (() => void) | null = null
  private resumeCallback: (() => void) | null = null
  private _isPaused = false

  constructor() {
    this.hud = document.getElementById('app')!
    this.startOverlay = document.getElementById('start-overlay')!
    this.pauseOverlay = document.getElementById('pause-overlay')!

    const playBtn = document.getElementById('play-btn')!
    playBtn.addEventListener('click', () => {
      this.hideStartScreen()
      this.startCallback?.()
    })

    const resumeBtn = document.getElementById('resume-btn')!
    resumeBtn.addEventListener('click', () => {
      this.hidePauseOverlay()
      this.resumeCallback?.()
    })

    window.addEventListener('keydown', this.onKeyDown)
  }

  onStart(cb: () => void) { this.startCallback = cb }
  onPause(cb: () => void) { this.pauseCallback = cb }
  onResume(cb: () => void) { this.resumeCallback = cb }

  showStartScreen() {
    this.startOverlay.style.display = 'flex'
  }

  hideStartScreen() {
    this.startOverlay.style.display = 'none'
  }

  showPauseOverlay() {
    this._isPaused = true
    this.pauseOverlay.style.display = 'flex'
  }

  hidePauseOverlay() {
    this._isPaused = false
    this.pauseOverlay.style.display = 'none'
  }

  setHudText(text: string) {
    this.hud.innerHTML = `<p>${text}</p>`
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this._isPaused) {
        this.hidePauseOverlay()
        this.resumeCallback?.()
      } else {
        this.showPauseOverlay()
        this.pauseCallback?.()
      }
    }
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown)
  }
}
