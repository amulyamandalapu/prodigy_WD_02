const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');

const hoursEl = document.querySelector('.hours');
const minutesEl = document.querySelector('.minutes');
const secondsEl = document.querySelector('.seconds');
const millisecondsEl = document.querySelector('.milliseconds');

const lapsList = document.getElementById('lapsList');
const bestLapEl = document.getElementById('bestLap');
const avgLapEl = document.getElementById('avgLap');
const totalLapsEl = document.getElementById('totalLaps');

let startTime = 0;
let elapsedTime = 0;
let timerId = null;
let laps = [];

const formatUnit = (value, digits = 2) => String(value).padStart(digits, '0');

const formatElapsed = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
        hours: formatUnit(hours),
        minutes: formatUnit(minutes),
        seconds: formatUnit(seconds),
        centiseconds: formatUnit(centiseconds),
    };
};

const renderTime = (ms) => {
    const time = formatElapsed(ms);
    hoursEl.textContent = time.hours;
    minutesEl.textContent = time.minutes;
    secondsEl.textContent = time.seconds;
    millisecondsEl.textContent = time.centiseconds;
};

const formatLap = (ms) => {
    const time = formatElapsed(ms);
    return `${time.minutes}:${time.seconds}.${time.centiseconds}`;
};

const updateStats = () => {
    totalLapsEl.textContent = String(laps.length);

    if (laps.length === 0) {
        bestLapEl.textContent = '--:--';
        avgLapEl.textContent = '--:--';
        return;
    }

    const lapTimes = laps.map((lap) => lap.duration);
    const bestLap = Math.min(...lapTimes);
    const avgLap = Math.round(lapTimes.reduce((sum, value) => sum + value, 0) / lapTimes.length);

    bestLapEl.textContent = formatLap(bestLap);
    avgLapEl.textContent = formatLap(avgLap);

    document.querySelectorAll('.lap-item').forEach((item) => item.classList.remove('best'));
    const bestIndex = lapTimes.indexOf(bestLap);
    const bestItem = document.querySelector(`[data-lap-index="${bestIndex}"]`);
    if (bestItem) {
        bestItem.classList.add('best');
        const badge = bestItem.querySelector('.lap-badge');
        if (badge) {
            badge.remove();
        }
        const bestBadge = document.createElement('span');
        bestBadge.className = 'lap-badge';
        bestBadge.textContent = 'BEST';
        bestItem.querySelector('.lap-time').appendChild(bestBadge);
    }
};

const renderLaps = () => {
    if (laps.length === 0) {
        lapsList.innerHTML = '<p class="no-laps">No lap times recorded yet. Click Lap to start recording!</p>';
        updateStats();
        return;
    }

    const lapItems = laps
        .map((lap, index) => {
            return `
                <div class="lap-item" data-lap-index="${index}">
                    <span class="lap-number">Lap ${index + 1}</span>
                    <span class="lap-time">${formatLap(lap.duration)}</span>
                </div>
            `;
        })
        .join('');

    lapsList.innerHTML = lapItems;
    updateStats();
};

const startTimer = () => {
    if (timerId) {
        return;
    }

    startTime = performance.now() - elapsedTime;
    timerId = window.setInterval(() => {
        elapsedTime = performance.now() - startTime;
        renderTime(elapsedTime);
    }, 10);

    startBtn.disabled = true;
};

const stopTimer = () => {
    if (!timerId) {
        return;
    }

    window.clearInterval(timerId);
    timerId = null;

    startBtn.disabled = false;
};

const resetTimer = () => {
    window.clearInterval(timerId);
    timerId = null;
    elapsedTime = 0;
    laps = [];

    renderTime(elapsedTime);
    renderLaps();

    startBtn.disabled = false;
};

const addLap = () => {
    if (!timerId) {
        return;
    }

    const lastLapTime = laps.length ? laps[laps.length - 1].total : 0;
    const currentTotal = elapsedTime;
    const lapDuration = currentTotal - lastLapTime;

    laps.push({
        duration: lapDuration,
        total: currentTotal,
    });

    renderLaps();
};

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', addLap);

renderTime(elapsedTime);
renderLaps();
