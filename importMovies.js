require("dotenv").config();
const mongoose = require("mongoose");
const { Movie, Artist } = require("./models");

const TMDB_TOKEN = process.env.TMDB_TOKEN;
const BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TOTAL_PAGES = 5;

if (!TMDB_TOKEN) {
  console.error("TMDB_TOKEN is missing in .env");
  process.exit(1);
}

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`
    }
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return res.json();
}

async function getOrCreateArtist(name, role) {
  if (!name) return null;

  let artist = await Artist.findOne({ name, role });

  if (!artist) {
    artist = await Artist.create({
      name,
      role,
      bio: `${name} is listed as a ${role.toLowerCase()} on CineSync.`
    });
  }

  return artist;
}

async function importMovieDetails(item) {
  const details = await tmdb(`/movie/${item.id}`, {
    append_to_response: "credits,images",
    include_image_language: "en,null,kn,hi,ta,te,ml,bn,mr,pa,gu"
  });
  const releaseYear = Number((details.release_date || "").slice(0, 4));

  const existing = await Movie.findOne({
    title: details.title,
    releaseYear
  });

  if (existing) {
    console.log(`Skipped: ${details.title}`);
    return false;
  }

  const directorCredit = details.credits.crew.find(
    (person) => person.job === "Director"
  );

  const director = await getOrCreateArtist(
    directorCredit?.name,
    "Director"
  );

  const cast = [];

  for (const actor of details.credits.cast.slice(0, 5)) {
    const savedActor = await getOrCreateArtist(actor.name, "Actor");

    if (savedActor) {
      cast.push(savedActor._id);
    }
  }

  await Movie.create({
    title: details.title,
    synopsis: details.overview || "No synopsis available.",
    posterUrl: details.poster_path
      ? `${IMAGE_BASE}${details.poster_path}`
      : details.images?.posters?.length
        ? `${IMAGE_BASE}${details.images.posters[0].file_path}`
        : "",
    releaseYear,
    language: details.original_language?.toUpperCase() || "EN",
    genres: details.genres.map((genre) => genre.name),
    director: director?._id,
    cast,
    dialogues: [],
    sceneDescription: "",
    externalRatings: [
      {
        source: "TMDB",
        rating: `${details.vote_average?.toFixed(1)}/10`,
        url: `https://www.themoviedb.org/movie/${details.id}`
      }
    ],
    ottLinks: []
  });

  console.log(`Saved: ${details.title}`);
  return true;
}

async function importMovies() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log(`Importing movies from ${TOTAL_PAGES} TMDB pages...`);

  let saved = 0;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`Fetching TMDB page ${page}...`);

    const data = await tmdb("/movie/popular", { page });

    for (const item of data.results) {
      try {
        const isSaved = await importMovieDetails(item);
        if (isSaved) saved++;
      } catch (err) {
        console.log(`Failed: ${item.title} - ${err.message}`);
      }
    }
  }

  console.log(`Import completed. ${saved} new movies saved.`);
  process.exit();
}

importMovies().catch((err) => {
  console.error(err.message);
  process.exit(1);
});