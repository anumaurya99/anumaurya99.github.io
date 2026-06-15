// ╭─────────────╮
// │ Nav Invert  │
// ╰─────────────╯

document.getElementById('nav').classList.add('nav-invert');

// ╭─────────────────╮
// │ hover auto play │
// ╰─────────────────╯

const heroProjects = document.querySelector(".work-grid");
window.addEventListener("load", () => {
    if (heroProjects != null) {
        for (let child of heroProjects.children) {
            const video = child.querySelector("video")

            // Desktop: hover to play
            child.addEventListener('mouseenter', () => {
                video.classList.remove("bw")
                video.play()
            })
            child.addEventListener('mouseleave', () => {
                video.pause()
                video.classList.add("bw")
            })

            // Mobile: hold to play, release to pause
            let holding = false
            child.addEventListener('touchstart', (e) => {
                e.preventDefault()
                holding = true

                video.classList.remove("bw")
                video.play()
            }, { passive: false })

            const stopHold = () => {
                if (!holding) return
                holding = false
                video.pause()
                video.classList.add("bw")
            }
            child.addEventListener('touchend', stopHold)
            child.addEventListener('touchcancel', stopHold)
        }
    }
})
