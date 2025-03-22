document.addEventListener('DOMContentLoaded', () => {
    const filmsList = document.getElementById('films');
    const moviePoster = document.getElementById('movie-poster');
    const movieTitle = document.getElementById('movie-title');
    const movieRuntime = document.getElementById('movie-runtime');
    const movieShowtime = document.getElementById('movie-showtime');
    const availableTickets = document.getElementById('movie-available-tickets');
    const buyTicketButton = document.getElementById('buy-ticket');
    const movieDescription = document.getElementById('movie-description');
    let currentMovieId = 2;
  
    function fetchAndDisplayMovie(movieId) {
      fetch(`http://localhost:3000/films/${movieId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(movie => {
          moviePoster.src = movie.poster;
          movieTitle.textContent = movie.title;
          movieRuntime.textContent = `Runtime: ${movie.runtime} minutes`;
          movieShowtime.textContent = `Showtime: ${movie.showtime}`;
          const ticketsAvailable = movie.capacity - movie.tickets_sold;
          availableTickets.textContent = `Available tickets: ${ticketsAvailable}`;
          movieDescription.textContent = movie.description;
  
          buyTicketButton.disabled = ticketsAvailable <= 0;
          buyTicketButton.textContent = ticketsAvailable <= 0 ? 'Sold Out' : 'Buy Ticket';
          buyTicketButton.classList.toggle('sold-out', ticketsAvailable <= 0);
  
          currentMovieId = movie.id;
  
          buyTicketButton.onclick = () => {
            if (movie.capacity - movie.tickets_sold > 0) {
              fetch(`http://localhost:3000/films/${movieId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickets_sold: movie.tickets_sold + 1 }),
              })
                .then(resp => {
                  if (!resp.ok) {
                    throw new Error('Failed to update tickets');
                  }
                  return resp.json();
                })
                .then(() => {
                  fetchAndDisplayMovie(movieId);
                })
                .catch(error => {
                  console.error('Error updating tickets:', error);
                  alert('Failed to update tickets. Please try again.');
                });
            }
          };
        })
        .catch(error => {
          console.error('Error fetching movie:', error);
          alert('Failed to load movie details. Please try again.');
        });
    }
  
    function fetchAndDisplayMoviesList() {
      fetch('http://localhost:3000/films')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(movies => {
          filmsList.innerHTML = '';
          movies.forEach(movie => {
            const listItem = document.createElement('li');
            listItem.classList.add('film', 'item');
            listItem.textContent = movie.title;
            listItem.addEventListener('click', () => {
              fetchAndDisplayMovie(movie.id);
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.id = "extractor"
            deleteButton.addEventListener('click', (event) => {
              event.stopPropagation();
              fetch(`http://localhost:3000/films/${movie.id}`, {
                method: 'DELETE',
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  listItem.remove();
                })
                .catch(error => {
                  console.error('Error deleting movie:', error);
                  alert('Failed to delete movie.');
                });
            });
            listItem.appendChild(deleteButton);
            filmsList.appendChild(listItem);
          });
        })
        .catch(error => {
          console.error('Error fetching movies list:', error);
          alert('Failed to load movies list.');
        });
    }
  
    fetchAndDisplayMovie(2);
    fetchAndDisplayMoviesList();
  });