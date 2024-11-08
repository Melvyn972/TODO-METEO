document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('task-form').addEventListener('submit', addTask);
document.getElementById('filter-all').addEventListener('click', () => filterTasks('all'));
document.getElementById('filter-todo').addEventListener('click', () => filterTasks('todo'));
document.getElementById('filter-done').addEventListener('click', () => filterTasks('done'));
document.getElementById('weather-form').addEventListener('submit', getWeather);

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToDOM(task));
}

function addTask(event) {
    event.preventDefault();
    const taskName = document.getElementById('task-name').value;
    const task = { name: taskName, status: 'todo' };
    addTaskToDOM(task);
    saveTask(task);
    document.getElementById('task-form').reset();
}

function addTaskToDOM(task) {
    const taskList = document.getElementById('task-list');
    const taskItem = document.createElement('li');
    taskItem.className = `list-group-item ${task.status}`;
    taskItem.textContent = task.name;
    taskItem.addEventListener('click', () => toggleTaskStatus(taskItem, task));
    taskList.appendChild(taskItem);
}

function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleTaskStatus(taskItem, task) {
    task.status = task.status === 'todo' ? 'done' : 'todo';
    taskItem.classList.toggle('done');
    updateTaskInStorage(task);
}

function updateTaskInStorage(updatedTask) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.name === updatedTask.name);
    tasks[taskIndex] = updatedTask;
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function filterTasks(status) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.filter(task => status === 'all' || task.status === status)
         .forEach(task => addTaskToDOM(task));
}

async function getWeather(event) {
    event.preventDefault();
    const cityName = document.getElementById('city-name').value;
    const apiKey = '719abd22a3b94decb5e133604240811';
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=4`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        displayError('Ville non trouvée. Veuillez réessayer.');
        console.error('Error fetching weather data:', error);
    }
}

function displayError(message) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `<p class="text-danger">${message}</p>`;
    weatherInfo.classList.remove('d-none');
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const cityTitle = document.getElementById('city-title');
    const currentWeather = document.getElementById('current-weather');
    const forecast = document.getElementById('forecast');

    cityTitle.textContent = `${data.location.name}, ${data.location.country}`;
    currentWeather.innerHTML = `
        <h3>Météo Actuelle</h3>
        <p>Température: ${data.current.temp_c}°C</p>
        <p>Condition: ${data.current.condition.text} <i class="weather-icon ${getWeatherIcon(data.current.condition.text, data.current.is_day)}"></i></p>
        <p>${data.current.is_day ? 'Jour' : 'Nuit'}</p>
    `;

    forecast.innerHTML = '';
    data.forecast.forecastday.slice(1).forEach(day => {
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <h4>${new Date(day.date).toLocaleDateString()}</h4>
            <p>Température: ${day.day.avgtemp_c}°C</p>
            <p>Condition: ${day.day.condition.text} <i class="weather-icon ${getWeatherIcon(day.day.condition.text, true)}"></i></p>
            <p>${day.day.daily_chance_of_rain}% chance de pluie</p>
        `;
        forecast.appendChild(forecastDay);
    });

    weatherInfo.classList.remove('d-none');
}

function getWeatherIcon(condition, isDay) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
        return isDay ? 'fas fa-sun' : 'fas fa-moon';
    } else if (conditionLower.includes('cloudy')) {
        return 'fas fa-cloud';
    } else if (conditionLower.includes('rain')) {
        return 'fas fa-cloud-showers-heavy';
    } else if (conditionLower.includes('snow')) {
        return 'fas fa-snowflake';
    } else {
        return 'fas fa-cloud';
    }
}