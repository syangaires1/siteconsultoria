document.addEventListener('DOMContentLoaded', function() {
    // --- Variáveis de Elementos Comuns ---
    const backToTopButton = document.querySelector('.back-top');
    const header = document.getElementById('site-header');
    const navLinks = document.querySelectorAll('.nav a[data-link]');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const yearSpan = document.getElementById('year');
    const contactForm = document.getElementById('contactForm');
    const formNote = document.querySelector('.form-note');
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    // --- Variáveis do Jogo ---
    const openGameButton = document.getElementById('open-game');
    const modal = document.getElementById('jcs-game-modal');
    const closeButton = document.getElementById('jcs-close');
    const backdrop = document.querySelector('.jcs-game-backdrop');
    const exitButton = document.getElementById('jcs-exit');
    const startButton = document.getElementById('jcs-start');
    const playAgainButton = document.getElementById('jcs-play-again');
    const gridContainer = document.getElementById('jcs-grid');
    const timerDisplay = document.getElementById('jcs-timer');
    const modelChoices = document.getElementById('jcs-models');
    const chartChoices = document.getElementById('jcs-charts');
    const contactGameButton = document.getElementById('jcs-contact-btn');
    const phase1TimerDisplay = document.getElementById('jcs-timer');

    // CORREÇÃO: A variável 'phases' precisa ser definida antes de ser usada na função 'showStage'
    const phases = {
        intro: document.querySelector('[data-stage="intro"]'),
        phase1: document.querySelector('[data-stage="phase1"]'),
        phase2: document.querySelector('[data-stage="phase2"]'),
        phase3: document.querySelector('[data-stage="phase3"]'),
        final: document.querySelector('[data-stage="final"]')
    };

    let timerInterval;
    let score = 0;
    const TOTAL_INCORRECT = 5;
    const PHASE1_TIME = 20;
    const CORRECT_MODEL = 'clustering';
    const CORRECT_CHART = 'line';

    // --- Funções de Utilidade ---
    function showStage(stageName) {
        Object.values(phases).forEach(stage => {
            if (stage) {
                stage.hidden = true;
            }
        });
        if (phases[stageName]) {
            phases[stageName].hidden = false;
        }
    }

    function openModal() {
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        showStage('intro');
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        clearInterval(timerInterval);
    }

    function resetGame() {
        score = 0;
        clearInterval(timerInterval);
        if (gridContainer) gridContainer.innerHTML = ''; 
        document.querySelectorAll('.jcs-choice').forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = false;
        });
    }

    // --- Lógica da Fase 1 (Dados Bagunçados) ---
    function startPhase1() {
        const data = [
            '25', '30', '18', '45', '22',
            '33', '40', '28', '50', '35',
            '15', '29', '38', '42', '27',
            '31', '48', '20', '55', '37'
        ];
        const incorrectIndices = [2, 7, 12, 17, 19]; 
        let foundIncorrect = 0;
        let timeLeft = PHASE1_TIME;

        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';

        data.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.textContent = value;
            cell.classList.add('jcs-cell');
            
            const isIncorrect = incorrectIndices.includes(index);
            if (isIncorrect) {
                cell.dataset.incorrect = 'true';
            }

            cell.style.cursor = 'pointer'; 

            cell.addEventListener('click', function() {
                if (this.classList.contains('clicked')) return;

                if (isIncorrect) {
                    this.classList.add('correct');
                    foundIncorrect++;
                    score += 10;
                    if (foundIncorrect === TOTAL_INCORRECT) {
                        clearInterval(timerInterval);
                        setTimeout(() => startPhase2(), 500); 
                    }
                } else {
                    this.classList.add('incorrect');
                    score -= 5;
                }
                this.classList.add('clicked');
            });
            gridContainer.appendChild(cell);
        });

        phase1TimerDisplay.textContent = timeLeft;
        timerInterval = setInterval(() => {
            timeLeft--;
            phase1TimerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                startPhase2();
            }
        }, 1000);

        showStage('phase1');
    }

    // --- Lógica da Fase 2 (Escolha do Modelo) ---
    function startPhase2() {
        showStage('phase2');
        modelChoices.querySelectorAll('.jcs-choice').forEach(button => {
            button.onclick = function() {
                modelChoices.querySelectorAll('.jcs-choice').forEach(btn => btn.disabled = true);

                const choice = this.dataset.choice;
                if (choice === CORRECT_MODEL) {
                    this.classList.add('correct');
                    score += 20;
                } else {
                    this.classList.add('incorrect');
                    modelChoices.querySelector(`[data-choice="${CORRECT_MODEL}"]`).classList.add('correct');
                }
                setTimeout(() => startPhase3(), 1500);
            };
        });
    }

    // --- Lógica da Fase 3 (Visualização) ---
    function startPhase3() {
        showStage('phase3');
        chartChoices.querySelectorAll('.jcs-choice').forEach(button => {
            button.onclick = function() {
                chartChoices.querySelectorAll('.jcs-choice').forEach(btn => btn.disabled = true);

                const choice = this.dataset.choice;
                if (choice === CORRECT_CHART) {
                    this.classList.add('correct');
                    score += 20;
                } else {
                    this.classList.add('incorrect');
                    chartChoices.querySelector(`[data-choice="${CORRECT_CHART}"]`).classList.add('correct');
                }
                setTimeout(() => showFinalScore(), 1500);
            };
        });
    }

    // --- Lógica Final ---
    function showFinalScore() {
        showStage('final');
        const finalCard = document.querySelector('.jcs-final-card');
        const finalMessage = finalCard.querySelector('p');
        
        let message = `Sua pontuação final é: ${score} pontos.`;

        if (score >= 45) {
            message += " Excelente! Você demonstrou um forte entendimento dos princípios de análise de dados.";
        } else if (score >= 20) {
            message += " Bom trabalho! Você acertou o essencial, mas há espaço para refinar suas habilidades.";
        } else {
            message += " Não se preocupe! A análise de dados é complexa. A JCS Consultoria está aqui para garantir que você sempre tome as decisões certas.";
        }

        finalMessage.textContent = message;
    }

    // --- 9. Configuração do Botão "Falar com a JCS" ---
    if (contactGameButton) {
        contactGameButton.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
            
            const contactSection = document.getElementById('contato');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }

    // --- Inicialização do Jogo ---
    if (startButton) {
        startButton.addEventListener('click', () => {
            resetGame();
            startPhase1();
        });
    }

    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            resetGame();
            showStage('intro');
        });
    }

    // --- Lógica do Modal (Abertura/Fechamento) ---
    if (openGameButton && modal) {
        openGameButton.addEventListener('click', openModal);
        closeButton.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        exitButton.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
                closeModal();
            }
        });
    }

    // --- 1. Lógica de Rolagem Suave (Smooth Scroll) para Links de Navegação ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.classList.contains('back-top')) return;
        if (anchor.id === 'open-game') return;

        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 2. Lógica do Botão Voltar ao Início (Back to Top) ---
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.style.display = 'inline-block';
            } else {
                backToTopButton.style.display = 'none';
            }

            if (header) {
                if (window.scrollY > 100) {
                    header.classList.add('shrink');
                } else {
                    header.classList.remove('shrink');
                }
            }
        });

        backToTopButton.style.display = 'none';
    }


    // --- 3. Lógica do Menu Mobile (Toggle) ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('open')) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    mainNav.classList.remove('open');
                }
            });
        });
    }

    // --- 4. Lógica do Ano no Footer ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 7. Lógica de Animação (Reveal on Scroll) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // --- 8. Lógica do Formulário de Contato (Simplificada) ---
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            formNote.textContent = 'Enviando mensagem...';
            formNote.style.color = '#fff';
            formNote.style.backgroundColor = 'var(--azul)';
            formNote.style.padding = '0.5rem';
            formNote.style.borderRadius = '4px';
            formNote.style.marginTop = '1rem';
            
            setTimeout(() => {
                formNote.textContent = 'Mensagem enviada com sucesso! Redirecionando...';
            }, 500);
        });
    }
});
