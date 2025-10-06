// Utilities
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// Partie 1: QCM statique
(() => {
  const scoreBanner = document.getElementById('scoreBanner');
  const form = document.getElementById('staticQuizForm');
  const submitBtn = document.getElementById('submitStaticQuiz');
  const resetBtn = document.getElementById('resetStaticQuiz');

  // Minuterie par question
  const questionTimers = [];
  const questions = Array.from(form.querySelectorAll('.question'));
  questions.forEach((q) => {
    const timerEl = q.querySelector('.timer');
    if (!timerEl) return;
    const total = Number(timerEl.getAttribute('data-seconds')) || 20;
    let remaining = total;
    const timeEl = timerEl.querySelector('.time');
    timeEl.textContent = String(remaining);
    const intervalId = setInterval(() => {
      remaining -= 1;
      timeEl.textContent = String(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
        // Désactiver les inputs de la question
        const inputs = q.querySelectorAll('input[type="radio"]');
        inputs.forEach((i) => (i.disabled = true));
      }
    }, 1000);
    questionTimers.push(intervalId);
  });

  const computeScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const correct = q.getAttribute('data-correct');
      const name = `q${idx + 1}`;
      const picked = form.querySelector(`input[name="${name}"]:checked`);
      if (picked && picked.value === correct) score += 1;
    });
    return { score, total: questions.length };
  };

  submitBtn.addEventListener('click', () => {
    const { score, total } = computeScore();
    scoreBanner.textContent = `Score: ${score} / ${total}`;
    scrollToTop();
  });

  resetBtn.addEventListener('click', () => {
    scoreBanner.textContent = 'Score: 0';
    // Réactiver inputs et relancer les timers
    questionTimers.forEach(clearInterval);
    const timers = form.querySelectorAll('.timer');
    timers.forEach((timerEl) => {
      const q = timerEl.closest('.question');
      const inputs = q.querySelectorAll('input[type="radio"]');
      inputs.forEach((i) => (i.disabled = false));
      const total = Number(timerEl.getAttribute('data-seconds')) || 20;
      let remaining = total;
      const timeEl = timerEl.querySelector('.time');
      timeEl.textContent = String(remaining);
      const intervalId = setInterval(() => {
        remaining -= 1;
        timeEl.textContent = String(remaining);
        if (remaining <= 0) {
          clearInterval(intervalId);
          inputs.forEach((i) => (i.disabled = true));
        }
      }, 1000);
      questionTimers.push(intervalId);
    });
  });
})();

// Partie 2: Open Trivia DB
(() => {
  const categorySelect = document.getElementById('category');
  const difficultySelect = document.getElementById('difficulty');
  const typeSelect = document.getElementById('type');
  const amountInput = document.getElementById('amount');
  const startBtn = document.getElementById('startApiQuiz');
  const container = document.getElementById('apiQuizContainer');

  // Charger les catégories depuis OpenTDB
  const loadCategories = async () => {
    try {
      const res = await fetch('https://opentdb.com/api_category.php');
      const data = await res.json();
      categorySelect.innerHTML = '<option value="">Toutes</option>' +
        data.trivia_categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (e) {
      categorySelect.innerHTML = '<option value="">(Erreur de chargement)</option>';
    }
  };
  loadCategories();

  const decodeHtml = (str) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  };

  const buildApiUrl = () => {
    const params = new URLSearchParams();
    params.set('amount', String(Math.min(Math.max(Number(amountInput.value || 5), 1), 50)));
    if (categorySelect.value) params.set('category', categorySelect.value);
    if (difficultySelect.value) params.set('difficulty', difficultySelect.value);
    if (typeSelect.value) params.set('type', typeSelect.value);
    return `https://opentdb.com/api.php?${params.toString()}`;
  };

  const renderQuiz = (results) => {
    container.hidden = false;
    container.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'quiz-form';

    results.forEach((q, idx) => {
      const allAnswers = [...q.incorrect_answers, q.correct_answer]
        .map((a) => decodeHtml(a))
        .sort(() => Math.random() - 0.5);
      const wrapper = document.createElement('div');
      wrapper.className = 'quiz-item';
      wrapper.setAttribute('data-correct', decodeHtml(q.correct_answer));

      const title = document.createElement('h3');
      title.innerHTML = `${idx + 1}) ${decodeHtml(q.question)} ` +
        `<span class="chip">${q.category} · ${q.difficulty}</span>`;

      wrapper.appendChild(title);

      allAnswers.forEach((answer) => {
        const lbl = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `aq${idx}`;
        input.value = answer;
        lbl.appendChild(input);
        lbl.appendChild(document.createTextNode(' ' + answer));
        wrapper.appendChild(lbl);
      });

      form.appendChild(wrapper);
    });

    const actions = document.createElement('div');
    actions.className = 'actions';
    const submit = document.createElement('button');
    submit.type = 'button';
    submit.textContent = 'Calculer le score';
    actions.appendChild(submit);
    form.appendChild(actions);

    submit.addEventListener('click', () => {
      const items = Array.from(form.querySelectorAll('.quiz-item'));
      let score = 0;
      items.forEach((item, idx) => {
        const correct = item.getAttribute('data-correct');
        const picked = form.querySelector(`input[name="aq${idx}"]:checked`);
        if (picked && picked.value === correct) score += 1;
      });
      const banner = document.getElementById('scoreBanner');
      banner.textContent = `Score: ${score} / ${results.length}`;
      scrollToTop();
    });

    container.appendChild(form);
  };

  startBtn.addEventListener('click', async () => {
    container.hidden = true;
    container.innerHTML = '';
    const url = buildApiUrl();
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.response_code !== 0) {
        container.hidden = false;
        container.innerHTML = `<p class="error">Impossible de générer le quiz (code ${data.response_code}).</p>`;
        return;
      }
      renderQuiz(data.results);
    } catch (e) {
      container.hidden = false;
      container.innerHTML = '<p class="error">Erreur réseau lors du chargement du quiz.</p>';
    }
  });
})();


