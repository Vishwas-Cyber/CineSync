require("dotenv").config();
const mongoose = require("mongoose");
const { Movie } = require("./models");

const TMDB_TOKEN = process.env.TMDB_TOKEN;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

if (!TMDB_TOKEN) {
  console.error("TMDB_TOKEN is missing in .env");
  process.exit(1);
}

async function tmdb(path, params = {}) {
  const url = new URL("https://api.themoviedb.org/3" + path);

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

function pickPoster(details) {
  if (details.poster_path) {
    return `${IMAGE_BASE}${details.poster_path}`;
  }

  const posters = details.images?.posters || [];

  if (posters.length > 0) {
    return `${IMAGE_BASE}${posters[0].file_path}`;
  }

  return "";
}

async function fixPosters() {
  await mongoose.connect(process.env.MONGO_URI);

  const movies = await Movie.find({
    $or: [
      { posterUrl: "" },
      { posterUrl: { $exists: false } },
      { posterUrl: null }
    ]
  });

  console.log(`Checking ${movies.length} movies without posters...`);

  let fixed = 0;

  for (const movie of movies) {
    try {
      const search = await tmdb("/search/movie", {
        query: movie.title,
        year: movie.releaseYear || "",
        include_adult: false
      });

      const result = search.results[0];

      if (!result) {
        console.log(`No TMDB match: ${movie.title}`);
        continue;
      }

      const details = await tmdb(`/movie/${result.id}`, {
        append_to_response: "images",
        include_image_language: "en,null,kn,hi,ta,te,ml,bn,mr,pa,gu"
      });

      const posterUrl = pickPoster(details);

      if (posterUrl) {
        movie.posterUrl = posterUrl;
        await movie.save();
        console.log(`Fixed: ${movie.title}`);
        fixed++;
      } else {
        console.log(`Still no poster: ${movie.title}`);
      }
    } catch (err) {
      console.log(`Failed: ${movie.title} - ${err.message}`);
    }
  }

  console.log(`Poster repair completed. ${fixed} posters fixed.`);
  process.exit();
}

fixPosters().catch((err) => {
  console.error(err.message);
  process.exit(1);
});