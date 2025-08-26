const modes = {
  stopwatch: document.getElementById('panel-stopwatch'),
  timer: document.getElementById('panel-timer')
};

const modeBtns = document.querySelectorAll('.mode-btn');
const stopwatchDisplay = document.getElementById('stopwatch-display');
const timerDisplay = document.getElementById('timer-display');
const notification = document.getElementById('notification');

let currentMode = 'stopwatch';
let stopwatchState = { running: false, startTime: 0, elapsed: 0, laps: [] };
let timerState = { running: false, duration: 0, remaining: 0, startTime: 0 };

// Utility functions
function formatTime(ms, includeMs = true) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  
  if (includeMs) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}0`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

function updateDisplay(element, time, includeMs = true) {
  const formatted = formatTime(time, includeMs);
  const segments = element.querySelectorAll('.time-segment');
  const parts = includeMs ? formatted.split(/[:.]/): formatted.split(':');
  
  parts.forEach((part, i) => {
    if (segments[i]) segments[i].textContent = part;
  });
}

function showNotification(title, message) {
  const titleEl = notification.querySelector('.notification-title');
  const messageEl = notification.querySelector('.notification-message');
  titleEl.textContent = title;
  messageEl.textContent = message;
  notification.classList.add('show');
  
  // Play notification sound
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DVu3g'); 
    audio.volume = 0.3;
    audio.play();
  } catch (e) {}
  
  setTimeout(() => notification.classList.remove('show'), 5000);
}

function switchMode(mode) {
  currentMode = mode;
  Object.values(modes).forEach(panel => panel.classList.remove('current'));
  modes[mode].classList.add('current');
  modes[mode].hidden = false;
  Object.values(modes).forEach(panel => {
    if (panel !== modes[mode]) panel.hidden = true;
  });
  
  modeBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
}

// Stopwatch functionality
class Stopwatch {
  constructor() {
    this.startBtn = document.getElementById('stopwatch-start');
    this.lapBtn = document.getElementById('stopwatch-lap');
    this.resetBtn = document.getElementById('stopwatch-reset');
    this.status = document.getElementById('stopwatch-status');
    this.lapsContainer = document.getElementById('laps-container');
    this.lapsList = document.getElementById('laps-list');
    this.lapCount = document.getElementById('lap-count');
    
    this.interval = null;
    this.bindEvents();
  }
  
  bindEvents() {
    this.startBtn.addEventListener('click', () => this.toggle());
    this.lapBtn.addEventListener('click', () => this.lap());
    this.resetBtn.addEventListener('click', () => this.reset());
  }
  
  toggle() {
    if (stopwatchState.running) {
      this.pause();
    } else {
      this.start();
    }
  }
  
  start() {
    stopwatchState.running = true;
    stopwatchState.startTime = Date.now() - stopwatchState.elapsed;
    
    this.startBtn.innerHTML = `
      <svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
      </svg>
      Pause
    `;
    this.lapBtn.disabled = false;
    this.status.textContent = 'Running';
    
    this.interval = setInterval(() => {
      stopwatchState.elapsed = Date.now() - stopwatchState.startTime;
      updateDisplay(stopwatchDisplay, stopwatchState.elapsed);
    }, 10);
  }
  
  pause() {
    stopwatchState.running = false;
    clearInterval(this.interval);
    
    this.startBtn.innerHTML = `
      <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z" fill="currentColor"/>
      </svg>
      Start
    `;
    this.status.textContent = 'Paused';
  }
  
  lap() {
    if (!stopwatchState.running) return;
    
    const lapTime = stopwatchState.elapsed;
    const lapNumber = stopwatchState.laps.length + 1;
    stopwatchState.laps.push(lapTime);
    
    const lapItem = document.createElement('div');
    lapItem.className = 'lap-item';
    lapItem.innerHTML = `
      <span class="lap-number">Lap ${lapNumber}</span>
      <span class="lap-time">${formatTime(lapTime)}</span>
    `;
    
    this.lapsList.insertBefore(lapItem, this.lapsList.firstChild);
    this.lapCount.textContent = `${stopwatchState.laps.length} lap${stopwatchState.laps.length !== 1 ? 's' : ''}`;
  }
  
  reset() {
    this.pause();
    stopwatchState.elapsed = 0;
    stopwatchState.laps = [];
    
    updateDisplay(stopwatchDisplay, 0);
    this.lapBtn.disabled = true;
    this.status.textContent = 'Ready';
    this.lapsList.innerHTML = '';
    this.lapCount.textContent = '0 laps';
  }
}

// Timer functionality
class Timer {
  constructor() {
    this.startBtn = document.getElementById('timer-start');
    this.cancelBtn = document.getElementById('timer-cancel');
    this.status = document.getElementById('timer-status');
    this.hoursInput = document.getElementById('hours');
    this.minutesInput = document.getElementById('minutes');
    this.secondsInput = document.getElementById('seconds');
    this.inputContainer = document.getElementById('timer-input');
    this.displayContainer = document.getElementById('timer-display-container');
    this.progressCircle = document.getElementById('progress-circle');
    
    this.interval = null;
    this.circumference = 2 * Math.PI * 90;
    this.progressCircle.style.strokeDasharray = this.circumference;
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.startBtn.addEventListener('click', () => this.toggle());
    this.cancelBtn.addEventListener('click', () => this.cancel());
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setPreset(parseInt(btn.dataset.time)));
    });
  }
  
  setPreset(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    this.hoursInput.value = hours;
    this.minutesInput.value = minutes;
    this.secondsInput.value = remainingSeconds;
  }
  
  toggle() {
    if (timerState.running) {
      this.pause();
    } else {
      this.start();
    }
  }
  
  start() {
    if (!timerState.running && timerState.remaining === 0) {
      const hours = parseInt(this.hoursInput.value) || 0;
      const minutes = parseInt(this.minutesInput.value) || 0;
      const seconds = parseInt(this.secondsInput.value) || 0;
      
      timerState.duration = (hours * 3600 + minutes * 60 + seconds) * 1000;
      timerState.remaining = timerState.duration;
      
      if (timerState.duration === 0) return;
      
      this.inputContainer.style.display = 'none';
      this.displayContainer.style.display = 'block';
    }
    
    timerState.running = true;
    timerState.startTime = Date.now() - (timerState.duration - timerState.remaining);
    
    this.startBtn.innerHTML = `
      <svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
      </svg>
      Pause
    `;
    this.status.textContent = 'Running';
    
    this.interval = setInterval(() => {
      const elapsed = Date.now() - timerState.startTime;
      timerState.remaining = Math.max(0, timerState.duration - elapsed);
      
      updateDisplay(timerDisplay, timerState.remaining, false);
      this.updateProgress();
      
      if (timerState.remaining <= 0) {
        this.complete();
      } else if (timerState.remaining <= 10000) {
        this.displayContainer.classList.add('pulsing');
      }
    }, 100);
  }
  
  pause() {
    timerState.running = false;
    clearInterval(this.interval);
    
    this.startBtn.innerHTML = `
      <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z" fill="currentColor"/>
      </svg>
      Resume
    `;
    this.status.textContent = 'Paused';
    this.displayContainer.classList.remove('pulsing');
  }
  
  complete() {
    this.pause();
    this.status.textContent = 'Completed';
    showNotification('Timer Finished!', `Your ${formatTime(timerState.duration, false)} timer has completed.`);
    this.displayContainer.classList.remove('pulsing');
  }
  
  cancel() {
    this.pause();
    timerState.remaining = 0;
    timerState.duration = 0;
    
    this.inputContainer.style.display = 'block';
    this.displayContainer.style.display = 'none';
    this.status.textContent = 'Ready';
    this.displayContainer.classList.remove('pulsing');
    
    this.startBtn.innerHTML = `
      <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z" fill="currentColor"/>
      </svg>
      Start
    `;
  }
  
  updateProgress() {
    const progress = 1 - (timerState.remaining / timerState.duration);
    const offset = this.circumference * (1 - progress);
    this.progressCircle.style.strokeDashoffset = offset;
  }
}

// Initialize
const stopwatch = new Stopwatch();
const timer = new Timer();

// Mode switching
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      if (currentMode === 'stopwatch') {
        stopwatch.toggle();
      } else {
        timer.toggle();
      }
      break;
    case 'KeyL':
      if (currentMode === 'stopwatch') {
        stopwatch.lap();
      }
      break;
    case 'KeyR':
      if (currentMode === 'stopwatch') {
        stopwatch.reset();
      } else {
        timer.cancel();
      }
      break;
    case 'Tab':
      if (!e.shiftKey) {
        e.preventDefault();
        switchMode(currentMode === 'stopwatch' ? 'timer' : 'stopwatch');
      }
      break;
  }
});

// Notification close
notification.querySelector('.notification-close').addEventListener('click', () => {
  notification.classList.remove('show');
});

// Initialize display
updateDisplay(stopwatchDisplay, 0);
