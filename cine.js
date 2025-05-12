/**
 * CineMood - A mood-based movie recommendation system
 * Connects emotions to movie recommendations with a beautiful interface
 */

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
//  // This would be your downloaded movie database
//     // In a real implementation, you would load this from a JSON file
//     const movieDatabase = [
//       {
//         id: 1,
//         title: "The Grand Budapest Hotel",
//         overview: "The adventures of Gustave H, a legendary concierge at a famous hotel, and Zero Moustafa, the lobby boy who becomes his most trusted friend.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2014-03-07",
//         voteAverage: 8.1,
//         genres: [35, 12] // Comedy, Adventure
//       },
//       {
//         id: 2,
//         title: "The Shawshank Redemption",
//         overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "1994-09-23",
//         voteAverage: 8.7,
//         genres: [18, 80] // Drama, Crime
//       },
//       {
//         id: 3,
//         title: "Parasite",
//         overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2019-05-30",
//         voteAverage: 8.5,
//         genres: [35, 53, 18] // Comedy, Thriller, Drama
//       },
//       {
//         id: 4,
//         title: "The Conjuring",
//         overview: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2013-07-19",
//         voteAverage: 7.5,
//         genres: [27, 53] // Horror, Thriller
//       },
//       {
//         id: 5,
//         title: "La La Land",
//         overview: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2016-12-09",
//         voteAverage: 7.9,
//         genres: [10749, 35, 18] // Romance, Comedy, Drama
//       },
//       {
//         id: 6,
//         title: "Interstellar",
//         overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2014-11-07",
//         voteAverage: 8.4,
//         genres: [12, 18, 878] // Adventure, Drama, Sci-Fi
//       },
//       {
//         id: 7,
//         title: "Get Out",
//         overview: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2017-02-24",
//         voteAverage: 7.7,
//         genres: [27, 9648, 53] // Horror, Mystery, Thriller
//       },
//       {
//         id: 8,
//         title: "Toy Story",
//         overview: "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "1995-11-22",
//         voteAverage: 8.0,
//         genres: [16, 12, 10751, 35] // Animation, Adventure, Family, Comedy
//       },
//       {
//         id: 9,
//         title: "The Dark Knight",
//         overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2008-07-18",
//         voteAverage: 8.5,
//         genres: [28, 80, 18] // Action, Crime, Drama
//       },
//       {
//         id: 10,
//         title: "Spirited Away",
//         overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2001-07-20",
//         voteAverage: 8.5,
//         genres: [16, 10751, 14] // Animation, Family, Fantasy
//       },
//       {
//         id: 11,
//         title: "The Notebook",
//         overview: "A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2004-06-25",
//         voteAverage: 7.8,
//         genres: [10749, 18] // Romance, Drama
//       },
//       {
//         id: 12,
//         title: "The Hangover",
//         overview: "Three buddies wake up from a bachelor party in Las Vegas, with no memory of the previous night and the bachelor missing.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2009-06-05",
//         voteAverage: 7.7,
//         genres: [35] // Comedy
//       },
//       {
//         id: 13,
//         title: "Inception",
//         overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2010-07-16",
//         voteAverage: 8.3,
//         genres: [28, 878, 12] // Action, Sci-Fi, Adventure
//       },
//       {
//         id: 14,
//         title: "The Sixth Sense",
//         overview: "A boy who communicates with spirits seeks the help of a disheartened child psychologist.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "1999-08-06",
//         voteAverage: 8.1,
//         genres: [53, 9648, 27] // Thriller, Mystery, Horror
//       },
//       {
//         id: 15,
//         title: "Finding Nemo",
//         overview: "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2003-05-30",
//         voteAverage: 7.8,
//         genres: [16, 10751, 12] // Animation, Family, Adventure
//       },
//       {
//         id: 16,
//         title: "The Matrix",
//         overview: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "1999-03-31",
//         voteAverage: 8.2,
//         genres: [28, 878] // Action, Sci-Fi
//       },
//       {
//         id: 17,
//         title: "Jurassic Park",
//         overview: "During a preview tour, a theme park suffers a major power breakdown that allows its cloned dinosaur exhibits to run amok.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "1993-06-11",
//         voteAverage: 8.0,
//         genres: [12, 878, 53] // Adventure, Sci-Fi, Thriller
//       },
//       {
//         id: 18,
//         title: "Eternal Sunshine of the Spotless Mind",
//         overview: "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "2004-03-19",
//         voteAverage: 8.1,
//         genres: [878, 18, 10749] // Sci-Fi, Drama, Romance
//       },
//       {
//         id: 19,
//         title: "The Silence of the Lambs",
//         overview: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "1991-02-14",
//         voteAverage: 8.3,
//         genres: [80, 18, 53, 27] // Crime, Drama, Thriller, Horror
//       },
//       {
//         id: 20,
//         title: "Forrest Gump",
//         overview: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75.",
//         posterPath: "/api/placeholder/220/320",
//         releaseDate: "1994-07-06",
//         voteAverage: 8.5,
//         genres: [35, 18, 10749] // Comedy, Drama, Romance
//       }
//     ];

//     // Emoji to mood/genre mapping
//     const emojiMoodMap = {
//       "😊": { name: "Happy", genres: [35, 10751], keywords: ["feel-good", "uplifting"] },
//       "😢": { name: "Sad", genres: [18, 10749], keywords: ["tearjerker", "emotional"] },
//       "😱": { name: "Scared", genres: [27, 53], keywords: ["horror", "thriller"] },
//       "😂": { name: "Funny", genres: [35], keywords: ["comedy", "laugh"] },
//       "🤔": { name: "Thoughtful", genres: [99, 878], keywords: ["thought-provoking", "philosophical"] },
//       "❤️": { name: "Romantic", genres: [10749], keywords: ["romance", "love"] },
//       "🚀": { name: "Adventurous", genres: [12, 878], keywords: ["adventure", "action"] },
//       "🔍": { name: "Mysterious", genres: [9648, 80], keywords: ["mystery", "suspense"] },
//     };

//     // UI Elements
//     const emojiContainer = document.getElementById('emojiContainer');
//     const selectedMood = document.getElementById('selectedMood');
//     const moodName = document.getElementById('moodName');
//     const selectedEmojiDisplay = document.getElementById('selectedEmojiDisplay');
//     const moviesContainer = document.getElementById('moviesContainer');
//     const loader = document.getElementById('loader');
//     const error = document.getElementById('error');

//     // Create emoji buttons
//     Object.keys(emojiMoodMap).forEach(emoji => {
//       const button = document.createElement('button');
//       button.className = 'emoji-btn';
//       button.textContent = emoji;
//       button.setAttribute('aria-label', `Feeling ${emojiMoodMap[emoji].name}`);
//       button.addEventListener('click', () => selectEmoji(emoji));
//       emojiContainer.appendChild(button);
//     });

//     // Function to handle emoji selection
//     function selectEmoji(emoji) {
//       // Reset previous selection
//       document.querySelectorAll('.emoji-btn').forEach(btn => {
//         btn.classList.remove('selected');
//       });

//       // Find and mark the selected button
//       document.querySelectorAll('.emoji-btn').forEach(btn => {
//         if (btn.textContent === emoji) {
//           btn.classList.add('selected');
//         }
//       });

//       // Update selected mood display
//       moodName.textContent = emojiMoodMap[emoji].name;
//       selectedEmojiDisplay.textContent = emoji;
//       selectedMood.style.display = 'block';

//       // Show loader
//       moviesContainer.innerHTML = '';
//       loader.style.display = 'flex';
//       error.style.display = 'none';

//       // Simulate loading (would be a real file load in production)
//       setTimeout(() => {
//         try {
//           const recommendations = getMovieRecommendations(emoji);
//           displayMovies(recommendations);
//           loader.style.display = 'none';
//         } catch (err) {
//           showError('Failed to load movie recommendations. Please try again.');
//           loader.style.display = 'none';
//         }
//       }, 800); // Simulate loading time
//     }

//     // Function to get movie recommendations based on emoji
//     function getMovieRecommendations(emoji) {
//       const moodInfo = emojiMoodMap[emoji];
//       const genreIds = moodInfo.genres;
      
//       // Filter movies that match at least one of the genres
//       return movieDatabase.filter(movie => {
//         return movie.genres.some(genre => genreIds.includes(genre));
//       }).sort(() => 0.5 - Math.random()).slice(0, 8); // Randomize and limit to 8
//     }

//     // Function to display movies
//     function displayMovies(movies) {
//       moviesContainer.innerHTML = '';
      
//       if (movies.length === 0) {
//         showError('No movies found for this mood. Try another mood!');
//         return;
//       }
      
//       movies.forEach(movie => {
//         const card = document.createElement('div');
//         card.className = 'movie-card';
        
//         // Format the date to year only
//         const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A';
        
//         card.innerHTML = `
//           <div class="movie-poster">
//             <img src="${movie.posterPath}" alt="${movie.title}" onerror="this.parentNode.innerHTML='<div class=\\'movie-poster-fallback\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'64\\' height=\\'64\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'#64748b\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'2\\' y=\\'2\\' width=\\'20\\' height=\\'20\\' rx=\\'2.18\\' ry=\\'2.18\\'></rect><line x1=\\'7\\' y1=\\'2\\' x2=\\'7\\' y2=\\'22\\'></line><line x1=\\'17\\' y1=\\'2\\' x2=\\'17\\' y2=\\'22\\'></line><line x1=\\'2\\' y1=\\'12\\' x2=\\'22\\' y2=\\'12\\'></line><line x1=\\'2\\' y1=\\'7\\' x2=\\'7\\' y2=\\'7\\'></line><line x1=\\'2\\' y1=\\'17\\' x2=\\'7\\' y2=\\'17\\'></line><line x1=\\'17\\' y1=\\'17\\' x2=\\'22\\' y2=\\'17\\'></line><line x1=\\'17\\' y1=\\'7\\' x2=\\'22\\' y2=\\'7\\'></line></svg></div>'">
//             <div class="movie-rating">
//               <span>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fcd34d" stroke="#fcd34d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="star-icon">
//                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
//                 </svg>
//                 ${movie.voteAverage.toFixed(1)}
//               </span>
//               <span>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                   <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                   <line x1="16" y1="2" x2="16" y2="6"></line>
//                   <line x1="8" y1="2" x2="8" y2="6"></line>
//                   <line x1="3" y1="10" x2="21" y2="10"></line>
//                 </svg>
//                 ${releaseYear}
//               </span>
//             </div>
//           </div>
//           <div class="movie-info">
//             <h3 class="movie-title">${movie.title}</h3>
//             <p class="movie-overview">${movie.overview}</p>
//             <div class="movie-actions">
//               <button class="favorite-btn">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
//                 </svg>
//                 Add to favorites
//               </button>
//               <button class="details-btn" data-id="${movie.id}">Details</button>
//             </div>
//           </div>
//         `;
        
//         moviesContainer.appendChild(card);
//       });
      
//       // Add event listeners to the buttons
//       document.querySelectorAll('.favorite-btn').forEach(btn => {
//         btn.addEventListener('click', function() {
//           alert('Added to favorites!');
//         });
//       });
      
//       document.querySelectorAll('.details-btn').forEach(btn => {
//         btn.addEventListener('click', function() {
//           const movieId = this.getAttribute('data-id');
//           alert(`Showing details for movie ID: ${movieId}`);
//         });
//       });
//     }

//     // Function to show error message
//     function showError(message) {
//       error.textContent = message;
//       error.style.display = 'block';
//     }

//     // Initialize with a default mood (optional)
//     // Uncomment the line below to have a default mood selected on page load
//     // selectEmoji('😊');