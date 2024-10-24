export class Confettiful {
  private el: HTMLElement
  private containerEl: HTMLElement | null = null
  private confettiColors: string[] = [
    '#fce18a',
    '#ff726d',
    '#b48def',
    '#f4306d',
  ]
  private confettiAnimations: string[] = ['slow', 'medium', 'fast']

  constructor(el: HTMLElement) {
    this.el = el

    this._setupElements()
    this._renderConfetti()

    console.log(this.el)
  }

  private _setupElements(): void {
    const containerEl = document.createElement('div')
    const elPosition = this.el.style.position

    if (elPosition !== 'relative' && elPosition !== 'absolute') {
      this.el.style.position = 'relative'
    }

    containerEl.classList.add('confetti-container')
    this.el.appendChild(containerEl)
    this.containerEl = containerEl
  }

  private _renderConfetti(): void {
    window.setInterval(() => {
      if (!this.containerEl) return

      const confettiEl = document.createElement('div')
      const confettiSize = `${Math.floor(Math.random() * 3) + 7}px`
      const confettiBackground =
        this.confettiColors[
          Math.floor(Math.random() * this.confettiColors.length)
        ]
      const confettiLeft = `${Math.floor(
        Math.random() * this.el.offsetWidth
      )}px`
      const confettiAnimation =
        this.confettiAnimations[
          Math.floor(Math.random() * this.confettiAnimations.length)
        ]

      confettiEl.classList.add(
        'confetti',
        `confetti--animation-${confettiAnimation}`
      )
      confettiEl.style.left = confettiLeft
      confettiEl.style.width = confettiSize
      confettiEl.style.height = confettiSize
      confettiEl.style.backgroundColor = confettiBackground

      window.setTimeout(() => {
        if (confettiEl.parentNode) {
          confettiEl.parentNode.removeChild(confettiEl)
        }
      }, 3000)

      this.containerEl.appendChild(confettiEl)
    }, 25)
  }
}
