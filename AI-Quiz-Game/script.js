// AI-Powered Quiz Game
(function(){
	// Elements
	const categoryEl = document.getElementById('category');
	const difficultyEl = document.getElementById('difficulty');
	const amountEl = document.getElementById('amount');
	const startBtn = document.getElementById('startBtn');
	const quizCard = document.getElementById('quizCard');
	const resultCard = document.getElementById('resultCard');
	const qIndexEl = document.getElementById('qIndex');
	const qTotalEl = document.getElementById('qTotal');
	const timerEl = document.getElementById('timer');
	const questionTextEl = document.getElementById('questionText');
	const answersEl = document.getElementById('answers');
	const nextBtn = document.getElementById('nextBtn');
	const hintBtn = document.getElementById('hintBtn');
	const hintText = document.getElementById('hintText');
	const scoreText = document.getElementById('scoreText');
	const saveForm = document.getElementById('saveScoreForm');
	const nameEl = document.getElementById('playerName');
	const playAgainBtn = document.getElementById('playAgainBtn');
	const leaderboardEl = document.getElementById('leaderboard');

	// State
	let questions = [];
	let currentIndex = 0;
	let score = 0;
	let timerId = null;
	let remaining = QUIZ_CONFIG.DEFAULT_TIMER_SECS;
	let selected = null;

	init();

	function init(){
		loadCategories();
		renderLeaderboard();
		bindEvents();
	}

	function bindEvents(){
		startBtn.addEventListener('click', startQuiz);
		nextBtn.addEventListener('click', nextQuestion);
		hintBtn.addEventListener('click', provideHint);
		saveForm.addEventListener('submit', saveScore);
		playAgainBtn.addEventListener('click', resetAll);
	}

	async function loadCategories(){
		categoryEl.innerHTML = '<option value="">Any Category</option>';
		try{
			const res = await fetch(`${QUIZ_CONFIG.TRIVIA_BASE}/api_category.php`);
			const data = await res.json();
			for(const c of data.trivia_categories){
				const opt = document.createElement('option');
				opt.value = String(c.id);
				opt.textContent = c.name;
				categoryEl.appendChild(opt);
			}
		}catch(e){ /* fallback: only Any Category */ }
	}

	async function startQuiz(){
		resetQuizState();
		const amount = Number(amountEl.value) || 10;
		const params = new URLSearchParams();
		params.set('amount', String(amount));
		if(categoryEl.value) params.set('category', categoryEl.value);
		if(difficultyEl.value) params.set('difficulty', difficultyEl.value);
		params.set('type','multiple');
		const url = `${QUIZ_CONFIG.TRIVIA_BASE}/api.php?${params.toString()}`;
		try{
			const res = await fetch(url);
			const data = await res.json();
			questions = (data.results || []).map(mapTriviaToQuestion);
			if(questions.length === 0){
				alert('No questions found. Try different settings.');
				return;
			}
			qTotalEl.textContent = String(questions.length);
			quizCard.hidden = false;
			resultCard.hidden = true;
			showQuestion();
		}catch(err){
			alert('Failed to load questions.');
		}
	}

	function mapTriviaToQuestion(q){
		const all = shuffle([q.correct_answer, ...q.incorrect_answers]);
		return {
			category: q.category,
			difficulty: q.difficulty,
			question: decodeHtml(q.question),
			answers: all.map(decodeHtml),
			correct: decodeHtml(q.correct_answer)
		};
	}

	function showQuestion(){
		const q = questions[currentIndex];
		qIndexEl.textContent = String(currentIndex+1);
		questionTextEl.innerHTML = q.question;
		answersEl.innerHTML = '';
		nextBtn.disabled = true;
		hintText.hidden = true; hintText.textContent = '';
		selected = null;
		for(const ans of q.answers){
			const li = document.createElement('li');
			li.className = 'answer';
			li.textContent = ans;
			li.addEventListener('click', () => selectAnswer(li, ans));
			answersEl.appendChild(li);
		}
		resetTimer();
	}

	function selectAnswer(el, ans){
		if(selected) return; // prevent reselect
		selected = ans;
		const q = questions[currentIndex];
		for(const node of answersEl.children){ node.classList.add('disabled'); node.style.pointerEvents = 'none'; }
		if(ans === q.correct){
			el.classList.add('correct');
			score += 10 + remaining; // reward time
		} else {
			el.classList.add('wrong');
			// mark the correct one
			[...answersEl.children].forEach(n => { if(n.textContent === q.correct) n.classList.add('correct'); });
		}
		nextBtn.disabled = false;
		stopTimer();
	}

	function nextQuestion(){
		if(currentIndex < questions.length - 1){
			currentIndex++;
			showQuestion();
		}else{
			finishQuiz();
		}
	}

	function finishQuiz(){
		quizCard.hidden = true;
		resultCard.hidden = false;
		scoreText.textContent = String(score);
	}

	function resetQuizState(){
		questions = [];
		currentIndex = 0;
		score = 0;
		stopTimer();
		remaining = QUIZ_CONFIG.DEFAULT_TIMER_SECS;
	}

	function resetAll(){
		resultCard.hidden = true;
		quizCard.hidden = true;
	}

	function resetTimer(){
		stopTimer();
		remaining = QUIZ_CONFIG.DEFAULT_TIMER_SECS;
		timerEl.textContent = String(remaining);
		timerId = setInterval(() => {
			remaining -= 1;
			timerEl.textContent = String(remaining);
			if(remaining <= 0){
				stopTimer();
				// auto reveal and move on
				if(!selected){
					const q = questions[currentIndex];
					[...answersEl.children].forEach(n => { if(n.textContent === q.correct) n.classList.add('correct'); n.style.pointerEvents = 'none'; });
					nextBtn.disabled = false;
				}
			}
		}, 1000);
	}

	function stopTimer(){
		if(timerId){ clearInterval(timerId); timerId = null; }
	}

	function decodeHtml(str){
		const txt = document.createElement('textarea');
		txt.innerHTML = str;
		return txt.value;
	}

	function shuffle(arr){
		for(let i=arr.length-1;i>0;i--){
			const j = Math.floor(Math.random()*(i+1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	// Leaderboard
	function getLeaderboard(){
		try{
			return JSON.parse(localStorage.getItem(QUIZ_CONFIG.LEADERBOARD_KEY) || '[]');
		}catch{ return []; }
	}

	function setLeaderboard(list){
		localStorage.setItem(QUIZ_CONFIG.LEADERBOARD_KEY, JSON.stringify(list));
	}

	function renderLeaderboard(){
		const list = getLeaderboard().slice(0,10);
		leaderboardEl.innerHTML = '';
		if(list.length === 0){
			const li = document.createElement('li');
			li.textContent = 'No scores yet';
			leaderboardEl.appendChild(li);
			return;
		}
		list.forEach((item, idx) => {
			const li = document.createElement('li');
			li.textContent = `${idx+1}. ${item.name} - ${item.score}`;
			leaderboardEl.appendChild(li);
		});
	}

	function saveScore(e){
		e.preventDefault();
		const name = (nameEl.value || 'Player').slice(0,16);
		const list = getLeaderboard();
		list.push({ name, score, date: new Date().toISOString() });
		list.sort((a,b)=> b.score - a.score);
		setLeaderboard(list);
		renderLeaderboard();
		alert('Saved to leaderboard!');
	}

	// Optional AI hint
	async function provideHint(){
		if(!QUIZ_CONFIG.ENABLE_AI_HINTS || !QUIZ_CONFIG.AI_API_KEY){
			hintText.hidden = false;
			hintText.textContent = 'AI hints disabled. Enable in config.js with a valid key.';
			return;
		}
		const q = questions[currentIndex];
		hintText.hidden = false;
		hintText.textContent = 'Generating hint...';
		try{
			const prompt = `Provide a subtle hint (not the answer) for this multiple-choice question: ${q.question}. Choices: ${q.answers.join(', ')}.`;
			const res = await fetch(QUIZ_CONFIG.AI_ENDPOINT, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${QUIZ_CONFIG.AI_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: QUIZ_CONFIG.AI_MODEL,
					messages: [{ role:'user', content: prompt }],
					temperature: 0.7,
					max_tokens: 60
				})
			});
			const data = await res.json();
			const hint = data.choices?.[0]?.message?.content?.trim() || 'No hint available';
			hintText.textContent = hint;
		}catch(err){
			hintText.textContent = 'Failed to get hint.';
		}
	}
})();
