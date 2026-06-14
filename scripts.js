document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. CANVAS DE PARTÍCULAS INTERATIVAS (HTML5)
       ========================================================================== */
    const canvas = document.getElementById('canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 };

        // Ajustar tamanho do canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Capturar posição do mouse
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Classe da Partícula
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
                this.opacity = Math.random() * 0.5 + 0.15;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce nas bordas
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                // Efeito repulsão do mouse
                if (mouse.x != null && mouse.y != null) {
                    let dx = this.x - mouse.x;
                    let dy = this.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = dx / distance;
                        let directionY = dy / distance;
                        this.x += directionX * force * 2;
                        this.y += directionY * force * 2;
                    }
                }
            }

            draw() {
                ctx.fillStyle = `rgba(200, 162, 74, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Inicializar partículas
        function initParticles() {
            particles = [];
            const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 18000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        // Loop de Animação
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
       2. NAVEGAÇÃO ENTRE ABAS (TABS)
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Alterar estado dos botões
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Alterar painel ativo com animação
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetTab) {
                    // Timeout sutil para garantir a transição de fade-in
                    setTimeout(() => {
                        pane.classList.add('active');
                    }, 50);
                }
            });
        });
    });

    /* ==========================================================================
       3. EFEITO INTERATIVO 3D DO LIVRO
       ========================================================================== */
    const bookContainer = document.getElementById('book-3d-pane');
    const book = bookContainer ? bookContainer.querySelector('.book') : null;
    
    if (bookContainer && book) {
        bookContainer.addEventListener('mousemove', (e) => {
            const rect = bookContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            // Mapeamento angular
            const rotateY = x * 70 - 20; 
            const rotateX = -y * 40 + 10;
            
            book.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.08)`;
            book.style.transition = 'transform 0.08s ease';
        });
        
        bookContainer.addEventListener('mouseleave', () => {
            book.style.transform = 'rotateY(-20deg) rotateX(10deg) scale(1)';
            book.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    }

    /* ==========================================================================
       4. ACORDEÃO DE TÓPICOS (PÁGINA DO LIVRO)
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isActive = item.classList.contains('active');
            
            // Fechar todos
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-body').style.maxHeight = null;
            });
            
            // Se não estava ativo, abre
            if (!isActive) {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    /* ==========================================================================
       5. QUIZ DE ESTRESSE CANINO INTERATIVO
       ========================================================================== */
    const questions = document.querySelectorAll('.question-block');
    const nextBtn = document.getElementById('quiz-next');
    const prevBtn = document.getElementById('quiz-prev');
    const fillBar = document.getElementById('meter-bar-fill');
    const pctLabel = document.getElementById('stress-level');
    
    let currentIdx = 0;
    let scores = { q1: 0, q2: 0, q3: 0, q4: 0 };
    
    // Atualizar Barra de Progresso e Estresse
    function updateStressProgress() {
        let selectedCount = 0;
        let sum = 0;
        
        // Avalia opções selecionadas
        for (let i = 1; i <= 4; i++) {
            const checked = document.querySelector(`input[name="q${i}"]:checked`);
            if (checked) {
                scores[`q${i}`] = parseInt(checked.value);
                sum += scores[`q${i}`];
                selectedCount++;
            }
        }
        
        // Mapeia o progresso no medidor
        // Se 0 respondidos: 15% (básico). Se respondidos, soma das pontuações.
        let pct = 15;
        if (selectedCount > 0) {
            pct = Math.round((sum / (selectedCount * 30)) * 100);
            pct = Math.max(15, Math.min(pct, 100)); // Limites
        }
        
        fillBar.style.width = pct + '%';
        pctLabel.innerText = pct + '%';
        
        // Alterar cor do label se estresse for alto
        if (pct < 35) {
            pctLabel.style.color = '#10b981'; // Verde
        } else if (pct < 65) {
            pctLabel.style.color = '#f59e0b'; // Laranja
        } else {
            pctLabel.style.color = '#ef4444'; // Vermelho
        }
    }

    // Monitorar seleção de respostas para habilitar o botão "Avançar"
    questions.forEach((block, idx) => {
        const inputs = block.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                updateStressProgress();
            });
        });
    });

    // Controlar navegação do Quiz
    nextBtn.addEventListener('click', () => {
        // Se for a última pergunta, processa resultado
        if (currentIdx === questions.length - 1) {
            showQuizResult();
            return;
        }

        // Passar para a próxima pergunta
        questions[currentIdx].classList.remove('active');
        currentIdx++;
        questions[currentIdx].classList.add('active');
        
        // Configurar botões
        prevBtn.style.display = 'block';
        
        // Verificar se a próxima pergunta já tem resposta
        const nextAnswered = document.querySelector(`input[name="q${currentIdx + 1}"]:checked`);
        if (nextAnswered) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        }

        // Alterar texto do botão na última pergunta
        if (currentIdx === questions.length - 1) {
            nextBtn.innerText = 'Ver Diagnóstico';
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIdx === 0) return;

        // Voltar pergunta
        questions[currentIdx].classList.remove('active');
        currentIdx--;
        questions[currentIdx].classList.add('active');
        
        // Configurações dos botões
        nextBtn.innerText = 'Avançar';
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        
        if (currentIdx === 0) {
            prevBtn.style.display = 'none';
        }
    });

    // Mostrar Resultado Final
    function showQuizResult() {
        // Esconder blocos de perguntas e navegação
        questions.forEach(q => q.classList.remove('active'));
        nextBtn.style.display = 'none';
        prevBtn.style.display = 'none';
        
        const resultDiv = document.getElementById('quiz-result');
        const resultText = document.getElementById('result-text');
        
        let sum = scores.q1 + scores.q2 + scores.q3 + scores.q4;
        let pct = Math.round((sum / 110) * 100);
        
        resultDiv.style.display = 'flex';
        
        // Renderizar o diagnóstico específico
        if (pct < 30) {
            resultText.innerHTML = `<strong>Nível de Estresse Baixo (${pct}%)</strong><br>Seu cão apresenta um comportamento equilibrado e estável na maior parte do tempo. No entanto, cães precisam de liderança consistente. Manter limites claros e passeios diários estruturados evitará que desvios de conduta apareçam no futuro.`;
            resultText.style.background = 'rgba(16, 185, 129, 0.05)';
            resultText.style.borderColor = 'rgba(16, 185, 129, 0.25)';
        } else if (pct < 60) {
            resultText.innerHTML = `<strong>Nível de Estresse Moderado (${pct}%)</strong><br>O seu cão está demonstrando sinais claros de agitação, ansiedade leve ou desobediência pontual. Isso costuma acontecer quando há falhas sutis na comunicação de limites dentro de casa ou falta de liderança assertiva no dia a dia.`;
            resultText.style.background = 'rgba(245, 158, 11, 0.05)';
            resultText.style.borderColor = 'rgba(245, 158, 11, 0.25)';
        } else {
            resultText.innerHTML = `<strong>ALERTA: Estresse Canino Elevado (${pct}%)</strong><br>O seu cão está em um estado constante de ansiedade, hiperatividade ou dominância/reatividade. Comportamentos como destruição, reatividade na guia ou ignorar totalmente os chamados indicam que ele está sobrecarregado emocionalmente. É urgente ajustar a sua liderança e postura para reabilitar o equilíbrio dele.`;
            resultText.style.background = 'rgba(239, 68, 68, 0.05)';
            resultText.style.borderColor = 'rgba(239, 68, 68, 0.25)';
        }
    }
});
