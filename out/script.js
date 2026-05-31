// ╭────────╮
// │ Cursor │
// ╰────────╯

const cur = document.getElementById('cur');
const ring = document.getElementById('ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function loop() {
    rx += (mx - rx) * .16;
    ry += (my - ry) * .16;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
})();

document.querySelectorAll('a, .srv-card, .wi').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cur.style.width = '12px';
        cur.style.height = '12px';
        ring.style.width = '52px';
        ring.style.height = '52px';
    });
    el.addEventListener('mouseleave', () => {
        cur.style.width = '7px';
        cur.style.height = '7px';
        ring.style.width = '34px';
        ring.style.height = '34px';
    });
});

// ╭────────────╮
// │ Nav Scroll │
// ╰────────────╯

const nav = document.getElementById("nav")
window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 36)
})

// ╭──────────────────╮
// │ Reveal on scroll │
// ╰──────────────────╯

const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('vis');
            io.unobserve(e.target);
        }
    });
}, { threshold: .1 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ╭───────────╮
// │ Send mail │
// ╰───────────╯
function sendMail() {
    const subject = encodeURIComponent(document.getElementById('subject').value);
    const body = encodeURIComponent(document.getElementById('body').value);

    window.location.href = `mailto:wechitracreativehouse@gmail.com?subject=${subject}&body=${body}`;
}
