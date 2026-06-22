// ============================================
// WEATHER DASHBOARD - Async/Await & Fetch API
// ============================================

class WeatherDashboard {
    constructor() {
        // OpenWeatherMap API configuration
        // Note: Replace with your own free API key from https://openweathermap.org/api
        this.apiKey = 'f7e8c31a76bdd09e0e3e9a2d7c4e1f98'; // Demo key (limited calls)
        this.apiBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.storageKey = 'recentCities';
        
        // DOM elements
        this.form = document.getElementById('searchForm');
        this.cityInput = document.getElementById('cityInput');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherContent = document.getElementById('weatherContent');
        this.emptyState = document.getElementById('emptyState');
        this.recentCitiesEl = document.getElementById('recentCities');
        
        this.recentCities = [];
        this.init();
    }

    // ==================== INITIALIZATION ====================
    init() {
        this.loadRecentCities();
        this.attachEventListeners();
        this.renderRecentCities();
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const cityName = this.cityInput.value.trim();
            if (cityName) {
                this.fetchWeather(cityName);
            }
        });
    }

    // ==================== FETCH & ASYNC/AWAIT ====================
    
    /**
     * Fetch weather data from OpenWeatherMap API using async/await
     * @param {string} cityName - City name to search for
     */
    async fetchWeather(cityName) {
        try {
            this.showLoadingState();
            this.clearError();

            // Validate input
            if (!cityName || cityName.length < 2) {
                throw new Error('Please enter a valid city name (at least 2 characters)');
            }

            // Build API URL with query parameters
            const url = new URL(this.apiBaseUrl);
            url.searchParams.append('q', cityName);
            url.searchParams.append('appid', this.apiKey);
            url.searchParams.append('units', 'metric'); // Celsius

            console.log('Fetching weather data for:', cityName);

            // Fetch data using Fetch API with async/await
            const response = await fetch(url.toString());

            // Handle HTTP errors
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`City "${cityName}" not found. Please check the spelling and try again.`);
                } else if (response.status === 401) {
                    throw new Error('Invalid API key. Please update the API key in the code.');
                } else if (response.status === 429) {
                    throw new Error('Too many requests. Please wait a moment and try again.');
                } else {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
            }

            // Parse JSON response
            const weatherData = await response.json();

            // Validate data structure
            if (!weatherData.main || !weatherData.weather) {
                throw new Error('Invalid response format from API');
            }

            // Update recent cities and render weather
            this.addToRecentCities(cityName);
            this.renderWeather(weatherData);
            this.hideLoadingState();

        } catch (error) {
            this.handleError(error);
            this.hideLoadingState();
        }
    }

    // ==================== ERROR HANDLING ====================
    
    /**
     * Comprehensive error handler for network and validation errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('Weather fetch error:', error);
        
        let errorMsg = 'An unexpected error occurred';

        if (error instanceof TypeError) {
            // Network error (no internet, CORS, etc.)
            errorMsg = 'Network error: Please check your internet connection and try again.';
        } else if (error instanceof SyntaxError) {
            // JSON parse error
            errorMsg = 'Invalid response format from server. Please try again.';
        } else {
            // Use error message as-is
            errorMsg = error.message;
        }

        this.showError(errorMsg);
        this.hideWeatherContent();
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    clearError() {
        this.errorMessage.textContent = '';
        this.errorMessage.style.display = 'none';
    }

    // ==================== RENDERING ====================
    
    /**
     * Parse and dynamically render complex nested JSON object
     * @param {Object} data - Weather data from API
     */
    renderWeather(data) {
        try {
            // Extract nested data from JSON
            const {
                name,
                sys: { country, sunrise, sunset },
                coord: { lat, lon },
                weather: [{ main, description, icon }],
                main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
                wind: { speed },
                visibility
            } = data;

            // Render location info
            document.getElementById('cityName').textContent = `${name}, ${country}`;
            document.getElementById('weatherDescription').textContent = main;
            document.getElementById('lastUpdated').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

            // Render temperature data
            document.getElementById('temperature').textContent = Math.round(temp);
            document.getElementById('feelsLike').textContent = Math.round(feels_like);

            // Render weather metrics
            document.getElementById('humidity').textContent = `${humidity}%`;
            document.getElementById('windSpeed').textContent = `${speed.toFixed(1)} m/s`;
            document.getElementById('pressure').textContent = `${pressure} hPa`;
            document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
            document.getElementById('maxTemp').textContent = `${Math.round(temp_max)}°C`;
            document.getElementById('minTemp').textContent = `${Math.round(temp_min)}°C`;

            // Render sunrise/sunset times
            document.getElementById('sunrise').textContent = new Date(sunrise * 1000).toLocaleTimeString();
            document.getElementById('sunset').textContent = new Date(sunset * 1000).toLocaleTimeString();
            document.getElementById('coordinates').textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;

            // Render weather icon
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
            document.getElementById('weatherIcon').src = iconUrl;
            document.getElementById('weatherIcon').alt = description;

            this.showWeatherContent();

        } catch (error) {
            console.error('Error rendering weather data:', error);
            this.showError('Error displaying weather data. Please try again.');
        }
    }

    // ==================== UI STATE MANAGEMENT ====================
    
    showLoadingState() {
        this.loadingSpinner.style.display = 'flex';
        this.hideWeatherContent();
    }

    hideLoadingState() {
        this.loadingSpinner.style.display = 'none';
    }

    showWeatherContent() {
        this.weatherContent.style.display = 'block';
        this.emptyState.style.display = 'none';
    }

    hideWeatherContent() {
        this.weatherContent.style.display = 'none';
    }

    // ==================== RECENT CITIES ====================
    
    addToRecentCities(cityName) {
        // Remove if already exists
        this.recentCities = this.recentCities.filter(
            (city) => city.toLowerCase() !== cityName.toLowerCase()
        );

        // Add to beginning
        this.recentCities.unshift(cityName);

        // Keep only last 5
        this.recentCities = this.recentCities.slice(0, 5);

        // Save to localStorage
        this.saveRecentCities();
        this.renderRecentCities();
    }

    renderRecentCities() {
        this.recentCitiesEl.innerHTML = '';

        if (this.recentCities.length === 0) return;

        const label = document.createElement('p');
        label.className = 'recent-label';
        label.textContent = 'Recent:';
        this.recentCitiesEl.appendChild(label);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'recent-buttons';

        this.recentCities.forEach((city) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'recent-btn';
            btn.textContent = city;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.fetchWeather(city);
            });
            buttonsContainer.appendChild(btn);
        });

        this.recentCitiesEl.appendChild(buttonsContainer);
    }

    // ==================== LOCAL STORAGE ====================
    
    saveRecentCities() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.recentCities));
        } catch (error) {
            console.error('Failed to save recent cities:', error);
        }
    }

    loadRecentCities() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.recentCities = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load recent cities:', error);
            this.recentCities = [];
        }
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});
