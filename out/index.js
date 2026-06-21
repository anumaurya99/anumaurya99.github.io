// ╭─────────────╮
// │ Nav Invert  │
// ╰─────────────╯

document.getElementById('nav').classList.add('nav-invert');

// ╭─────────────────╮
// │ hover auto play │
// ╰─────────────────╯

const videos = document.querySelectorAll(".work-grid>.wi>video");
if (videos.length === 0) {
    console.error(`".work-grid" does not exist.`)
}

console.log(videos)
window.addEventListener("load", () => {
    for (let video of videos) {
        // Desktop
        video.addEventListener('mouseenter', () => {
            video.classList.remove("bw")
            video.play()
        })
        video.addEventListener('mouseleave', () => {
            video.pause()
            video.classList.add("bw")
        })

        // Mobile: hold to play, release to pause
        let holding = false
        video.addEventListener('touchstart', (e) => {
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
        video.addEventListener('touchend', stopHold)
        video.addEventListener('touchcancel', stopHold)
    }
})
