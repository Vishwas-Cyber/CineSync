const API = "http://localhost:5000/api";
let token = localStorage.getItem("cinesync_token") || "";
let user = JSON.parse(localStorage.getItem("cinesync_user") || "null");
let authMode = "login";

const FALLBACK_POSTER = "https://placehold.co/400x600/16161d/8b5cf6?text=CineSync";

function posterImg(movie, extraClass = "poster") {
  const url = movie?.posterUrl || FALLBACK_POSTER;

  return `
    <img
      src="${url}"
      class="${extraClass}"
      alt="${movie?.title || "CineSync movie"}"
      loading="lazy"
      onerror="this.onerror=null;this.src='${FALLBACK_POSTER}';"
    >
  `;
}

const view = document.getElementById("view");
const pageTitle = document.getElementById("pageTitle");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

function toast(message, isError = false) {
  const box = document.getElementById("toast");
  const div = document.createElement("div");
  div.className = `toast-msg ${isError ? "error" : ""}`;
  div.textContent = message;
  box.appendChild(div);
  setTimeout(() => div.remove(), 3200);
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

/* ---------------- AUTH ---------------- */

document.querySelectorAll("[data-auth]").forEach(btn => {
  btn.onclick = () => {
    authMode = btn.dataset.auth;
    document.querySelectorAll("[data-auth]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("nameBox").classList.toggle("d-none", authMode === "login");
    document.getElementById("authSubmit").textContent = authMode === "login" ? "Login" : "Create Account";
  };
});

document.getElementById("authForm").onsubmit = async (e) => {
  e.preventDefault();
  const body = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const data = await api(`/auth/${authMode}`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    token = data.token;
    user = data.user;
    localStorage.setItem("cinesync_token", token);
    localStorage.setItem("cinesync_user", JSON.stringify(user));
    showApp();
    toast(`Welcome, ${user.name}`);
  } catch (err) {
    toast(err.message, true);
  }
};

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.reload();
};

function showApp() {
  document.getElementById("authScreen").classList.add("d-none");
  document.getElementById("appScreen").classList.remove("d-none");
  document.getElementById("userChip").textContent = `${user.name} • ${user.role}`;
  document.querySelector(".admin-only").classList.toggle("d-none", user.role !== "admin");
  loadHome();
}

/* ---------------- NAVIGATION ---------------- */

document.querySelectorAll(".side-link").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".side-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const pages = {
      home: ["Entertainment Dashboard", loadHome],
      movies: ["Movie Discovery", loadMovies],
      artists: ["Discover Artists", loadArtists],
      music: ["Soundtrack Explorer", loadMusic],
      memory: ["Memory Search", loadMemory],
      library: ["My Library", loadLibrary],
      calendar: ["Watch Calendar", loadCalendar],
      admin: ["Admin Dashboard", loadAdmin]
    };
    const [title, fn] = pages[btn.dataset.view];
    pageTitle.textContent = title;
    fn();
  };
});

/* ---------------- HELPERS ---------------- */

function movieCard(movie) {
  return `
    <div class="col-md-3 col-sm-6 mb-4">
      <div class="movie-card" onclick="openMovie('${movie._id}')">
        ${posterImg(movie)}
        <div class="card-body">
          <h6>${movie.title}</h6>
          <small class="text-secondary">${movie.releaseYear || ""} • ${movie.language || ""}</small>
          <div class="mt-2">
            ${(movie.genres || []).slice(0, 2).map(g => `<span class="badge badge-genre">${g}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>`;
}
async function openMovie(id) {
  pageTitle.textContent = "Movie Details";
  const { movie, reviews } = await api(`/movies/${id}`);

  view.innerHTML = `
    <div class="row g-4">
      <div class="col-md-4">
        ${posterImg(movie, "poster rounded-4 w-100")}
      </div>
      <div class="col-md-8">
        <h2>${movie.title}</h2>
        <p class="text-secondary">${movie.releaseYear} • ${movie.language}</p>
        <p>${movie.synopsis}</p>

        <div class="mb-3">
          ${(movie.genres || []).map(g => `<span class="badge badge-genre">${g}</span>`).join("")}
        </div>

        <p><strong>Director:</strong> ${movie.director?.name || "N/A"}</p>
        <p><strong>Music Director:</strong> ${movie.musicDirector?.name || "N/A"}</p>
        <p><strong>Cast:</strong> ${(movie.cast || []).map(a => a.name).join(", ") || "N/A"}</p>

        <div class="d-flex flex-wrap gap-2 mt-3">
          <button class="btn btn-purple" onclick="addToLibrary('${movie._id}','watchlist')">Add Watchlist</button>
          <button class="btn btn-outline-light" onclick="addToLibrary('${movie._id}','favourite')">Favourite</button>
          <button class="btn btn-outline-light" onclick="addToLibrary('${movie._id}','watched')">Mark Watched</button>
          <button class="btn btn-red" onclick="scheduleMovie('${movie._id}')">Schedule</button>
        </div>

        <h5 class="section-title">External Ratings</h5>
        ${(movie.externalRatings || []).map(r => `
          <a href="${r.url}" target="_blank" class="d-block text-decoration-none text-light mb-1">
            ${r.source}: ${r.rating}
          </a>`).join("") || "<p class='text-secondary'>No external ratings added.</p>"}

        <h5 class="section-title">OTT Availability</h5>
        ${(movie.ottLinks || []).map(o => `
          <a href="${o.url}" target="_blank" class="d-block text-decoration-none text-light mb-1">
            ${o.platform} • ${o.type}
          </a>`).join("") || "<p class='text-secondary'>No OTT links added.</p>"}
      </div>
    </div>

    <h4 class="section-title">Soundtracks</h4>
    <div class="row">
      ${(movie.songs || []).map(s => `
        <div class="col-md-4 mb-3">
          <div class="movie-card p-3">
            <h6>${s.title}</h6>
            <small class="text-secondary">Singer: ${s.singer}</small><br>
            <a href="${s.listenUrl}" target="_blank" class="btn btn-sm btn-purple mt-2">Listen</a>
          </div>
        </div>`).join("") || "<p class='text-secondary'>No songs added.</p>"}
    </div>

    <h4 class="section-title">Reviews</h4>
    <div class="movie-card p-3 mb-4">
      <form onsubmit="submitReview(event,'${movie._id}')">
        <input type="number" id="reviewRating" min="1" max="10" class="form-control mb-2" placeholder="Rating 1-10" required>
        <textarea id="reviewComment" class="form-control mb-2" placeholder="Write your review"></textarea>
        <button class="btn btn-purple">Submit Review</button>
      </form>
    </div>

    ${reviews.map(r => `
      <div class="movie-card p-3 mb-2">
        <strong>${r.user.name}</strong> • ${r.rating}/10
        <p class="mb-0 text-secondary">${r.comment}</p>
      </div>`).join("")}
  `;
}

async function addToLibrary(movieId, status) {
  try {
    await api("/library", {
      method: "POST",
      body: JSON.stringify({ movieId, status })
    });
    toast(`Added to ${status}`);
  } catch (err) {
    toast(err.message, true);
  }
}

async function submitReview(e, movieId) {
  e.preventDefault();
  try {
    await api(`/movies/${movieId}/reviews`, {
      method: "POST",
      body: JSON.stringify({
        rating: document.getElementById("reviewRating").value,
        comment: document.getElementById("reviewComment").value
      })
    });
    toast("Review submitted");
    openMovie(movieId);
  } catch (err) {
    toast(err.message, true);
  }
}

async function scheduleMovie(movieId) {
  const date = prompt("Enter date (YYYY-MM-DD):");
  const time = prompt("Enter time (HH:MM):");
  if (!date || !time) return;

  try {
    await api("/schedules", {
      method: "POST",
      body: JSON.stringify({ movieId, watchDate: date, watchTime: time })
    });
    toast("Movie scheduled");
  } catch (err) {
    toast(err.message, true);
  }
}

/* ---------------- VIEWS ---------------- */

async function loadHome() {
  const movies = await api("/movies?sort=rating");
  const songs = await api("/songs");

  view.innerHTML = `
    <h5 class="section-title">Trending Movies</h5>
    <div class="row">${movies.slice(0, 8).map(movieCard).join("")}</div>

    <h5 class="section-title">Popular Soundtracks</h5>
    <div class="row">
      ${songs.slice(0, 6).map(s => `
        <div class="col-md-4 mb-3">
          <div class="movie-card p-3">
            <h6>${s.title}</h6>
            <small class="text-secondary">${s.singer} • ${s.language}</small><br>
            <a href="${s.listenUrl}" target="_blank" class="btn btn-sm btn-purple mt-2">Listen</a>
          </div>
        </div>`).join("")}
    </div>`;
}

async function loadMovies() {
  const movies = await api("/movies");
  view.innerHTML = `
    <div class="movie-card p-3 mb-4">
      <div class="row g-2">
        <div class="col-md-4"><input id="mSearch" class="form-control" placeholder="Search movies"></div>
        <div class="col-md-3"><input id="mGenre" class="form-control" placeholder="Genre"></div>
        <div class="col-md-3"><input id="mLanguage" class="form-control" placeholder="Language"></div>
        <div class="col-md-2"><button class="btn btn-purple w-100" onclick="filterMovies()">Search</button></div>
      </div>
    </div>
    <div class="row" id="movieGrid">${movies.map(movieCard).join("")}</div>`;
}

async function filterMovies() {
  const search = document.getElementById("mSearch").value;
  const genre = document.getElementById("mGenre").value;
  const language = document.getElementById("mLanguage").value;

  const movies = await api(`/movies?search=${search}&genre=${genre}&language=${language}`);
  document.getElementById("movieGrid").innerHTML = movies.map(movieCard).join("");
}

async function loadArtists() {
  const artists = await api("/artists");
  view.innerHTML = `
    <div class="row">
      ${artists.map(a => `
        <div class="col-md-4 mb-3">
          <div class="movie-card p-3" onclick="openArtist('${a._id}')">
            <h6>${a.name}</h6>
            <span class="badge badge-genre">${a.role}</span>
            <p class="text-secondary mt-2 mb-0">${a.bio}</p>
          </div>
        </div>`).join("")}
    </div>`;
}

async function openArtist(id) {
  pageTitle.textContent = "Artist Profile";
  const data = await api(`/artists/${id}`);

  view.innerHTML = `
    <div class="movie-card p-4 mb-4">
      <h2>${data.artist.name}</h2>
      <span class="badge badge-genre">${data.artist.role}</span>
      <p class="mt-3">${data.artist.bio}</p>
      <p class="text-secondary">${data.artist.awards}</p>
    </div>

    <h5 class="section-title">Movies</h5>
    <div class="row">
      ${[...data.directed, ...data.acted, ...data.composed]
        .filter((m, i, arr) => arr.findIndex(x => x._id === m._id) === i)
        .map(movieCard).join("")}
    </div>

    <h5 class="section-title">Songs</h5>
    ${data.songs.map(s => `<p>${s.title} — ${s.movie?.title || ""}</p>`).join("") || "<p class='text-secondary'>No songs found.</p>"}`;
}

async function loadMusic() {
  const songs = await api("/songs");
  view.innerHTML = `
    <div class="movie-card p-3 mb-4">
      <div class="row g-2">
        <div class="col-md-8"><input id="songSearch" class="form-control" placeholder="Search song, singer or lyric"></div>
        <div class="col-md-4"><button class="btn btn-purple w-100" onclick="filterSongs()">Search</button></div>
      </div>
    </div>
    <div class="row" id="songGrid">
      ${songs.map(s => `
        <div class="col-md-4 mb-3">
          <div class="movie-card p-3">
            <h6>${s.title}</h6>
            <small class="text-secondary">${s.singer} • ${s.movie?.title || ""}</small><br>
            <a href="${s.listenUrl}" target="_blank" class="btn btn-sm btn-purple mt-2">Listen</a>
          </div>
        </div>`).join("")}
    </div>`;
}

async function filterSongs() {
  const q = document.getElementById("songSearch").value;
  const songs = await api(`/songs?search=${q}`);
  document.getElementById("songGrid").innerHTML = songs.map(s => `
    <div class="col-md-4 mb-3">
      <div class="movie-card p-3">
        <h6>${s.title}</h6>
        <small class="text-secondary">${s.singer}</small>
      </div>
    </div>`).join("");
}

async function loadMemory() {
  view.innerHTML = `
    <div class="movie-card p-4">
      <h5>Find that song, dialogue or scene</h5>
      <p class="text-secondary">Enter a lyric line, movie dialogue, scene description or partial title.</p>
      <div class="row g-2">
        <div class="col-md-10">
          <input id="memoryQuery" class="form-control" placeholder="e.g. powerful people come from powerful places">
        </div>
        <div class="col-md-2">
          <button class="btn btn-purple w-100" onclick="memorySearch()">Search</button>
        </div>
      </div>
    </div>
    <div id="memoryResults"></div>`;
}

async function memorySearch() {
  const q = document.getElementById("memoryQuery").value;
  const data = await api(`/memory/search?q=${encodeURIComponent(q)}`);

  document.getElementById("memoryResults").innerHTML = `
    <h5 class="section-title">Movies</h5>
    <div class="row">${data.movies.map(movieCard).join("") || "<p class='text-secondary'>No movies matched.</p>"}</div>

    <h5 class="section-title">Songs</h5>
    <div class="row">
      ${data.songs.map(s => `
        <div class="col-md-4 mb-3">
          <div class="movie-card p-3">
            <h6>${s.title}</h6>
            <small class="text-secondary">${s.singer}</small><br>
            <a href="${s.listenUrl}" target="_blank" class="btn btn-sm btn-purple mt-2">Listen</a>
          </div>
        </div>`).join("") || "<p class='text-secondary'>No songs matched.</p>"}
    </div>`;
}

async function loadLibrary() {
  const items = await api("/library");

  const group = (status) => items.filter(i => i.status === status);

  view.innerHTML = `
    <h5 class="section-title">Watchlist</h5>
    <div class="row">${group("watchlist").map(i => movieCard(i.movie)).join("") || "<p class='text-secondary'>Your watchlist is empty.</p>"}</div>

    <h5 class="section-title">Favourites</h5>
    <div class="row">${group("favourite").map(i => movieCard(i.movie)).join("") || "<p class='text-secondary'>No favourites yet.</p>"}</div>

    <h5 class="section-title">Watched</h5>
    <div class="row">${group("watched").map(i => movieCard(i.movie)).join("") || "<p class='text-secondary'>No watched movies yet.</p>"}</div>`;
}

async function loadCalendar() {
  const schedules = await api("/schedules");

  view.innerHTML = `
    <div class="movie-card p-4 mb-4">
      <h5>Upcoming Watch Schedule</h5>
      ${schedules.map(s => `
        <div class="d-flex justify-content-between align-items-center border-bottom border-secondary py-2">
          <div>
            <strong>${s.movie.title}</strong><br>
            <small class="text-secondary">${new Date(s.watchDate).toDateString()} at ${s.watchTime} • ${s.status}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-purple" onclick="markWatched('${s._id}')">Mark Watched</button>
            <button class="btn btn-sm btn-red" onclick="cancelSchedule('${s._id}')">Cancel</button>
          </div>
        </div>`).join("") || "<p class='text-secondary'>No scheduled movies.</p>"}
    </div>`;
}

async function markWatched(id) {
  await api(`/schedules/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Watched" })
  });
  toast("Marked as watched");
  loadCalendar();
}

async function cancelSchedule(id) {
  await api(`/schedules/${id}`, { method: "DELETE" });
  toast("Schedule cancelled");
  loadCalendar();
}

async function loadAdmin() {
  const stats = await api("/admin/stats");
  const movies = await api("/movies");

  view.innerHTML = `
    <div class="row g-3 mb-4">
      ${Object.entries(stats).map(([k, v]) => `
        <div class="col-md-2 col-6">
          <div class="stat-card">
            <div class="stat-value">${v}</div>
            <small class="text-secondary text-uppercase">${k}</small>
          </div>
        </div>`).join("")}
    </div>

    <div class="movie-card p-4 mb-4">
      <h5>Add Movie</h5>
      <form onsubmit="addMovie(event)">
        <input class="form-control mb-2" id="aTitle" placeholder="Movie title" required>
        <input class="form-control mb-2" id="aYear" placeholder="Release year" required>
        <input class="form-control mb-2" id="aLanguage" placeholder="Language" required>
        <input class="form-control mb-2" id="aGenres" placeholder="Genres, comma separated" required>
        <textarea class="form-control mb-2" id="aSynopsis" placeholder="Synopsis"></textarea>
        <button class="btn btn-purple">Add Movie</button>
      </form>
    </div>

    <h5 class="section-title">Manage Movies</h5>
    <div class="table-responsive movie-card p-3">
      <table class="table">
        <thead><tr><th>Title</th><th>Year</th><th>Language</th><th></th></tr></thead>
        <tbody>
          ${movies.map(m => `
            <tr>
              <td>${m.title}</td>
              <td>${m.releaseYear}</td>
              <td>${m.language}</td>
              <td><button class="btn btn-sm btn-red" onclick="deleteMovie('${m._id}')">Delete</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

async function addMovie(e) {
  e.preventDefault();
  try {
    await api("/admin/movies", {
      method: "POST",
      body: JSON.stringify({
        title: document.getElementById("aTitle").value,
        releaseYear: Number(document.getElementById("aYear").value),
        language: document.getElementById("aLanguage").value,
        genres: document.getElementById("aGenres").value.split(",").map(g => g.trim()),
        synopsis: document.getElementById("aSynopsis").value
      })
    });
    toast("Movie added");
    loadAdmin();
  } catch (err) {
    toast(err.message, true);
  }
}

async function deleteMovie(id) {
  if (!confirm("Delete this movie?")) return;
  await api(`/admin/movies/${id}`, { method: "DELETE" });
  toast("Movie deleted");
  loadAdmin();
}

/* ---------------- START ---------------- */

if (token && user) showApp();