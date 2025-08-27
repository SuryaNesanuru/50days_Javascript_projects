// AI-Quiz-Game Configuration
const QUIZ_CONFIG = {
	TRIVIA_BASE: 'https://opentdb.com',
	DEFAULT_TIMER_SECS: 30,
	LEADERBOARD_KEY: 'ai_quiz_leaderboard_v1',
	// Optional AI hints
	ENABLE_AI_HINTS: false,
	AI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
	AI_MODEL: 'gpt-3.5-turbo',
	AI_API_KEY: 'https://opentdb.com/api.php?amount=10' // set your key here to enable hints
};
