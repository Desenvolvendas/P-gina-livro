/* ==========================================================================
   LINK TREE XENO - INTERACTIVE CANVAS & MODAL CONTROL SYSTEM
   ========================================================================== */

function initApp() {
    /* ==========================================================================
       1. CANVAS DE PARTÍCULAS INTERATIVAS (HTML5)
       ========================================================================== */
    const canvas = document.getElementById('canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = Math.random() * 0.2 - 0.1;
                this.speedY = Math.random() * 0.2 - 0.1;
                this.opacity = Math.random() * 0.35 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                if (mouse.x !== null && mouse.y !== null) {
                    let dx = this.x - mouse.x;
                    let dy = this.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = dx / distance;
                        let directionY = dy / distance;
                        this.x += directionX * force * 1.2;
                        this.y += directionY * force * 1.2;
                    }
                }
            }

            draw() {
                ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 20000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    /* ==========================================================================
       2. CONTROLE DE MODAIS (DELEGAÇÃO DE EVENTOS À PROVA DE FALHAS)
       ========================================================================== */
    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('active');
        } else {
            document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
        }
        document.body.style.overflow = '';
        
        // Remove a hash do ID da URL de forma limpa para fechar o seletor CSS :target
        if (window.location.hash) {
            try {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            } catch (err) {
                window.location.hash = '';
            }
        }
    }

    function openModal(modalElement) {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
        if (modalElement) {
            modalElement.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Escuta cliques globalmente via e.target.closest
    document.addEventListener('click', (e) => {
        // Abertura do modal ao clicar nos botões com href="#..."
        const trigger = e.target.closest('a[href^="#"]');
        if (trigger) {
            const href = trigger.getAttribute('href');
            if (href && href.length > 1) {
                const targetId = href.substring(1);
                const modal = document.getElementById(targetId);
                if (modal && modal.classList.contains('modal')) {
                    e.preventDefault();
                    openModal(modal);
                    return;
                }
            }
        }

        // Botão de fechar (X)
        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            e.preventDefault();
            const modal = closeBtn.closest('.modal');
            closeModal(modal);
            return;
        }

        // Clique no fundo escuro fora do conteúdo do modal
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
            return;
        }

        // Clique em links externos dentro de modais (ex: WhatsApp, Mercado Livre)
        const extLink = e.target.closest('.modal a[target="_blank"]');
        if (extLink) {
            const modal = extLink.closest('.modal');
            setTimeout(() => closeModal(modal), 150);
        }
    });

    // Tecla ESC para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Inicializa imediatamente se o DOM já estiver pronto, ou no evento DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
