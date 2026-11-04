const router = require("express").Router();
const {
  Movie, Artist, Song, Review,
  LibraryItem, Schedule, Notification
} = require("../models");
const { protect, adminOnly } = require("../middleware/auth");

/* ---------------- PUBLIC MOVIES ---------------- */

router.get("/movies", async (req, res) => {
  try {
    const { search, genre, language, year, sort } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: "i" };
    if (genre) filter.genres = genre;
    if (language) filter.language = language;
    if (year) filter.releaseYear = Number(year);

    let query = Movie.find(filter)
      .populate("director musicDirector cast songs", "name role title singer");

    if (sort === "rating") query = query.sort({ releaseYear: -1 });
    else if (sort === "title") query = query.sort({ title: 1 });
    else query = query.sort({ createdAt: -1 });

    res.json(await query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate("director musicDirector cast songs", "name role title singer photoUrl listenUrl");

    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const reviews = await Review.find({ movie: movie._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ movie, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- ARTISTS ---------------- */

router.get("/artists", async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: "i" };

    res.json(await Artist.find(filter).sort({ name: 1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/artists/:id", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    const directed = await Movie.find({ director: artist._id });
    const composed = await Movie.find({ musicDirector: artist._id });
    const acted = await Movie.find({ cast: artist._id });
    const songs = await Song.find({ musicDirector: artist._id }).populate("movie", "title");

    res.json({ artist, directed, composed, acted, songs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- SONGS ---------------- */

router.get("/songs", async (req, res) => {
  try {
    const { search, language, singer } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: "i" };
    if (language) filter.language = language;
    if (singer) filter.singer = { $regex: singer, $options: "i" };

    res.json(await Song.find(filter).populate("movie musicDirector", "title name"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- MEMORY SEARCH ---------------- */

router.get("/memory/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ movies: [], songs: [] });

    const regex = { $regex: q, $options: "i" };

    const movies = await Movie.find({
      $or: [
        { title: regex },
        { synopsis: regex },
        { sceneDescription: regex },
        { dialogues: regex }
      ]
    }).select("title posterUrl releaseYear language genres");

    const songs = await Song.find({
      $or: [
        { title: regex },
        { singer: regex },
        { lyricsSnippet: regex }
      ]
    }).populate("movie", "title posterUrl");

    res.json({ movies, songs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- REVIEWS ---------------- */

router.get("/movies/:id/reviews", async (req, res) => {
  const reviews = await Review.find({ movie: req.params.id })
    .populate("user", "name")
    .sort({ createdAt: -1 });
  res.json(reviews);
});

router.post("/movies/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      user: req.user.id,
      movie: req.params.id,
      rating: Number(rating),
      comment
    });

    const populated = await review.populate("user", "name");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- MY LIBRARY ---------------- */

router.get("/library", protect, async (req, res) => {
  const items = await LibraryItem.find({ user: req.user.id })
    .populate("movie", "title posterUrl releaseYear language genres");
  res.json(items);
});

router.post("/library", protect, async (req, res) => {
  try {
    const { movieId, status } = req.body;

    const existing = await LibraryItem.findOne({
      user: req.user.id,
      movie: movieId,
      status
    });

    if (existing) return res.json(existing);

    const item = await LibraryItem.create({
      user: req.user.id,
      movie: movieId,
      status
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/library/:id", protect, async (req, res) => {
  await LibraryItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: "Removed from library" });
});

/* ---------------- WATCH CALENDAR ---------------- */

router.get("/schedules", protect, async (req, res) => {
  const schedules = await Schedule.find({ user: req.user.id })
    .populate("movie", "title posterUrl")
    .sort({ watchDate: 1 });
  res.json(schedules);
});

router.post("/schedules", protect, async (req, res) => {
  try {
    const { movieId, watchDate, watchTime, reminderMinutes } = req.body;

    const schedule = await Schedule.create({
      user: req.user.id,
      movie: movieId,
      watchDate,
      watchTime,
      reminderMinutes
    });

    await Notification.create({
      user: req.user.id,
      message: `Movie scheduled for ${new Date(watchDate).toDateString()} at ${watchTime}.`
    });

    res.status(201).json(await schedule.populate("movie", "title posterUrl"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/schedules/:id", protect, async (req, res) => {
  const schedule = await Schedule.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  ).populate("movie", "title posterUrl");

  res.json(schedule);
});

router.delete("/schedules/:id", protect, async (req, res) => {
  await Schedule.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: "Schedule cancelled" });
});

/* ---------------- NOTIFICATIONS ---------------- */

router.get("/notifications", protect, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 });
  res.json(notifications);
});

router.patch("/notifications/read", protect, async (req, res) => {
  await Notification.updateMany({ user: req.user.id }, { isRead: true });
  res.json({ message: "All notifications marked read" });
});

/* ---------------- ADMIN ---------------- */

router.post("/admin/movies", protect, adminOnly, async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json(movie);
});

router.put("/admin/movies/:id", protect, adminOnly, async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(movie);
});

router.delete("/admin/movies/:id", protect, adminOnly, async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  res.json({ message: "Movie deleted" });
});

router.post("/admin/artists", protect, adminOnly, async (req, res) => {
  const artist = await Artist.create(req.body);
  res.status(201).json(artist);
});

router.delete("/admin/artists/:id", protect, adminOnly, async (req, res) => {
  await Artist.findByIdAndDelete(req.params.id);
  res.json({ message: "Artist deleted" });
});

router.post("/admin/songs", protect, adminOnly, async (req, res) => {
  const song = await Song.create(req.body);
  res.status(201).json(song);
});

router.delete("/admin/songs/:id", protect, adminOnly, async (req, res) => {
  await Song.findByIdAndDelete(req.params.id);
  res.json({ message: "Song deleted" });
});

router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  const [movies, artists, songs, users, reviews, schedules] = await Promise.all([
    Movie.countDocuments(),
    Artist.countDocuments(),
    Song.countDocuments(),
    require("../models").User.countDocuments(),
    Review.countDocuments(),
    Schedule.countDocuments()
  ]);

  res.json({ movies, artists, songs, users, reviews, schedules });
});

module.exports = router;