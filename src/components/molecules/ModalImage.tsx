import { useEffect, useState } from 'react'

type ModalImageProps = {
  src: string
  alt: string
  className?: string
}

export function ModalImage({ src, alt, className }: ModalImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button
        className={`image-modal-trigger ${className ?? ''}`.trim()}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Open ${alt} in a larger view`}
      >
        <img src={src} alt={alt} />
      </button>

      {isOpen ? (
        <div
          className="image-modal-overlay"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="image-modal-frame"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="image-modal-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close image viewer"
            >
              Close
            </button>
            <img className="image-modal-image" src={src} alt={alt} />
          </div>
        </div>
      ) : null}
    </>
  )
}
