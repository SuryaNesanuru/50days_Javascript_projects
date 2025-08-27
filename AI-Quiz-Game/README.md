# AI-Powered Quiz Game

A browser-based quiz game using the Open Trivia DB API with per-question timers, scoring, a local leaderboard, and optional AI-generated hints.

## Features
- Multiple-choice questions fetched from Open Trivia DB
- Timer per question (default 30s)
- Scoring with time bonus
- Local leaderboard (top scores stored in localStorage)
- Categories, difficulty, and question count selectors
- Optional AI hints via OpenAI API (configurable)

## Getting Started
1. Open `index.html` in a modern browser (or serve via a local server).
2. Choose category/difficulty/amount and click Start.
3. Answer within the time limit. Score is saved after the quiz.

## APIs
- Open Trivia DB (no key required): `https://opentdb.com/api.php`
- Categories endpoint: `https://opentdb.com/api_category.php`

## Optional AI Hints
1. Open `config.js` and set:
```js
QUIZ_CONFIG.ENABLE_AI_HINTS = true;
QUIZ_CONFIG.AI_API_KEY = 'your_openai_api_key';
```
2. The app will call the chat completions API to generate subtle hints.

## Data and Storage
- Leaderboard is stored under key `ai_quiz_leaderboard_v1` in localStorage.

## Configuration
See `config.js` for:
- `DEFAULT_TIMER_SECS`
- `TRIVIA_BASE`
- `ENABLE_AI_HINTS`, `AI_ENDPOINT`, `AI_MODEL`, `AI_API_KEY`

## License
MIT
