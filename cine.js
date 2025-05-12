

// Main data storage
let moviesData = {};
let allMovies = [];

// Mood definitions with emojis and descriptions
const moodDefinitions = [
    { name: "Happy", emoji: "😊", description: "Uplifting movies to brighten your day" },
    { name: "Sad", emoji: "😢", description: "Emotional stories for when you need a good cry" },
    { name: "Action", emoji: "💥", description: "High-energy adventures full of excitement" },
    { name: "Chill", emoji: "😌", description: "Relaxing films for a laid-back mood" },
    { name: "Motivational", emoji: "💪", description: "Inspiring stories to fuel your ambition" },
    { name: "Horror", emoji: "😱", description: "Scary films that will make your heart race" },
    { name: "Nostalgic", emoji: "🌟", description: "Classic films to bring back memories" },
    { name: "Adventurous", emoji: "🌍", description: "Epic journeys and thrilling explorations" },
    { name: "Hopeful", emoji: "✨", description: "Movies that restore your faith in humanity" },
    { name: "Angry", emoji: "😠", description: "Intense films to channel your energy" },
    { name: "Inspirational", emoji: "🚀", description: "Stories of triumph against all odds" },
    { name: "Fun", emoji: "🎉", description: "Light-hearted entertainment for everyone" },
    { name: "Dark", emoji: "🌑", description: "Mysterious plots with unexpected twists" },
    { name: "Feel-good", emoji: "🥰", description: "Heartwarming tales to lift your spirits" }
];

// Initialize the application
async function init() {
    await loadMoviesData();
    generateMoodButtons();
    setupModalListeners();
}

// Load the movies data from JSON file
async function loadMoviesData() {
    try {
        showLoader(true);
        
        // Load the JSON file with movie data
        const response = await fetch('data/divided_movies.json');
        if (response.ok) {
            moviesData = await response.json();
            console.log("✅ Loaded movie data successfully");
            
            // Create a flat array of all movies for search and related movies
            Object.keys(moviesData).forEach(mood => {
                if (Array.isArray(moviesData[mood])) {
                    moviesData[mood].forEach(movie => {
                        // Add mood property to movie object
                        movie.moods = [mood];
                        allMovies.push(movie);
                    });
                }
            });
        } else {
            throw new Error("Failed to load movie data");
        }
        
        showLoader(false);
    } catch (error) {
        console.error('Error loading movies data:', error);
        showLoader(false);
        document.getElementById('moviesContainer').innerHTML = '<div class="no-movies">Error loading movies. Please check if the data file exists and try again.</div>';
    }
}

// Show or hide the loader
function showLoader(show) {
    const loader = document.getElementById('loader');
    if (show) {
        loader.style.display = 'block';
    } else {
        loader.style.display = 'none';
    }
}

// Generate mood selection buttons with emojis
function generateMoodButtons() {
    const moodSelector = document.getElementById('moodSelector');
    
    // Clear existing buttons
    moodSelector.innerHTML = '';
    
    // Create a button for each mood that exists in the data
    moodDefinitions.forEach(mood => {
        if (moviesData[mood.name]) {
            const button = document.createElement('div');
            button.className = 'mood-btn';
            button.dataset.mood = mood.name;
            button.innerHTML = `
                <span class="emoji">${mood.emoji}</span>
                <span class="mood-label">${mood.name}</span>
            `;
            button.addEventListener('click', () => setActiveMood(mood.name));
            moodSelector.appendChild(button);
        }
    });
}

// Set active mood and display related movies
function setActiveMood(mood) {
    // Update active button
    const buttons = document.querySelectorAll('.mood-btn');
    buttons.forEach(btn => {
        if (btn.dataset.mood === mood) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Find the mood definition
    const moodDef = moodDefinitions.find(m => m.name === mood);
    
    // Update mood description
    const descriptionElement = document.getElementById('moodDescription');
    if (moodDef) {
        descriptionElement.innerHTML = `${moodDef.emoji} <strong>${moodDef.description}</strong> ${moodDef.emoji}`;
        descriptionElement.style.display = 'block';
    } else {
        descriptionElement.style.display = 'none';
    }
    
    // Display movies for the selected mood
    displayMovies(mood);
}

// Display movies for the selected mood
function displayMovies(mood) {
    const moviesContainer = document.getElementById('moviesContainer');
    const movies = moviesData[mood] || [];
    
    // Clear existing movies
    moviesContainer.innerHTML = '';
    
    if (movies.length === 0) {
        moviesContainer.innerHTML = `<div class="no-movies">No movies found for ${mood} mood</div>`;
        return;
    }
    
    // Create and append movie cards
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        moviesContainer.appendChild(card);
    });
}

// Create a movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.title = movie.title;
    
    // Create poster element
    let posterElement;
    if (movie.poster_url && movie.poster_url !== 'null' && !movie.poster_url.includes('null')) {
        posterElement = `<img class="movie-poster" src="${movie.poster_url}" alt="${movie.title} poster">`;
    } else {
        posterElement = `<div class="poster-placeholder">No poster available</div>`;
    }
    
    // Format release date
    const releaseDate = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    
    // Build card HTML
    card.innerHTML = `
        ${posterElement}
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span>${releaseDate}</span>
                <span class="movie-rating">★ ${movie.rating || 'N/A'}</span>
            </div>
            <p class="movie-overview">${movie.overview || 'No overview available'}</p>
        </div>
    `;
    
    // Add click event to show movie details modal
    card.addEventListener('click', () => showMovieModal(movie));
    
    return card;
}

// Set up modal event listeners
function setupModalListeners() {
    const modal = document.getElementById('movieModal');
    const closeBtn = document.querySelector('.close-btn');
    
    // Close modal when clicking the × button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

// Show movie details modal
function showMovieModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalTitle = document.getElementById('modalMovieTitle');
    const modalMovieMeta = document.getElementById('modalMovieMeta');
    const modalMovieDetails = document.getElementById('modalMovieDetails');
    const relatedMoviesContainer = document.getElementById('relatedMoviesContainer');
    
    // Set movie title
    modalTitle.textContent = movie.title;
    
    // Format release date and rating
    const releaseDate = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    modalMovieMeta.innerHTML = `
        <span>Released: ${releaseDate}</span>
        <span class="movie-rating">★ ${movie.rating || 'N/A'}</span>
    `;
    
    // Create poster and info
    let posterHTML;
    if (movie.poster_url && movie.poster_url !== 'null' && !movie.poster_url.includes('null')) {
        posterHTML = `<img class="modal-poster" src="${movie.poster_url}" alt="${movie.title} poster">`;
    } else {
        posterHTML = `<div class="poster-placeholder modal-poster">No poster available</div>`;
    }
    
    modalMovieDetails.innerHTML = `
        ${posterHTML}
        <div class="modal-info">
            <p class="modal-overview">${movie.overview || 'No overview available'}</p>
        </div>
    `;
    
    // Find related movies (same mood or similar titles)
    const relatedMovies = findRelatedMovies(movie);
    
    // Display related movies
    relatedMoviesContainer.innerHTML = '';
    
    if (relatedMovies.length === 0) {
        relatedMoviesContainer.innerHTML = '<p>No related movies found</p>';
    } else {
        relatedMovies.forEach(relatedMovie => {
            const relatedCard = createRelatedMovieCard(relatedMovie);
            relatedMoviesContainer.appendChild(relatedCard);
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Create a related movie card for the modal
function createRelatedMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'related-movie-card';
    
    // Create poster element
    let posterElement;
    if (movie.poster_url && movie.poster_url !== 'null' && !movie.poster_url.includes('null')) {
        posterElement = `<img class="related-movie-poster" src="${movie.poster_url}" alt="${movie.title} poster">`;
    } else {
        posterElement = `<div class="poster-placeholder related-movie-poster">No poster</div>`;
    }
    
    // Build card HTML
    card.innerHTML = `
        ${posterElement}
        <div class="related-movie-title">${movie.title}</div>
    `;
    
    // Add click event to show this movie's modal
    card.addEventListener('click', () => showMovieModal(movie));
    
    return card;
}

// Find related movies based on mood and title similarity
function findRelatedMovies(movie) {
    const MAX_RELATED = 8;
    const relatedMovies = [];
    
    // First, try to find movies with the same mood
    if (movie.moods && movie.moods.length > 0) {
        const primaryMood = movie.moods[0];
        
        // Get other movies from the same mood category
        const moodMovies = moviesData[primaryMood] || [];
        
        // Filter out the current movie and sort by rating
        const otherMoodMovies = moodMovies
            .filter(m => m.title !== movie.title)
            .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        
        // Add highest rated mood movies first
        for (let i = 0; i < Math.min(otherMoodMovies.length, MAX_RELATED / 2); i++) {
            relatedMovies.push(otherMoodMovies[i]);
        }
    }
    
    // // If we don't have enough related movies by mood, add some from similar titles or random selection
    // if (relatedMovies.length < MAX_RELATED) {
    //     // Get all movies except the current one and any already in related
    //     const otherMovies = allMovies.filter(m => 
    //         m.title !== movie.title && !relatedMovies.some(r => r.title === m.title)
    //     );
        
    //     // Sort randomly for variety
    //     otherMovies.sort(() => Math.random() - 0.5);
        
    //     // Fill the remaining slots
    //     const remaining = MAX_RELATED - relatedMovies.length;
    //     for (let i = 0; i < Math.min(otherMovies.length, remaining); i++) {
    //         relatedMovies.push(otherMovies[i]);
    //     }
    // }
    
    return relatedMovies;
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', init);
