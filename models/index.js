const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["Actor", "Director", "Music Director"], required: true },
  bio: { type: String, default: "" },
  photoUrl: { type: String, default: "" },
  awards: { type: String, default: "" }
}, { timestamps: true });

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  singer: { type: String, required: true },
  musicDirector: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  language: { type: String, default: "Kannada" },
  genre: { type: String, default: "Soundtrack" },
  artworkUrl: { type: String, default: "" },
  listenUrl: { type: String, default: "" },
  lyricsSnippet: { type: String, default: "" }
}, { timestamps: true });

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  synopsis: { type: String, default: "" },
  posterUrl: { type: String, default: "" },
  releaseYear: Number,
  language: { type: String, default: "Kannada" },
  genres: [String],
  director: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  musicDirector: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  cast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }],
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  externalRatings: [{
    source: String,
    rating: String,
    url: String
  }],
  ottLinks: [{
    platform: String,
    type: { type: String, default: "Subscription" },
    url: String
  }],
  dialogues: [String],
  sceneDescription: { type: String, default: "" }
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  rating: { type: Number, min: 1, max: 10, required: true },
  comment: { type: String, default: "" }
}, { timestamps: true });

const LibraryItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  status: { type: String, enum: ["watchlist", "favourite", "watched"], required: true }
}, { timestamps: true });

const ScheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  watchDate: { type: Date, required: true },
  watchTime: { type: String, required: true },
  status: { type: String, enum: ["Planned", "Watched", "Cancelled"], default: "Planned" },
  reminderMinutes: { type: Number, default: 30 }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  User: mongoose.model("User", UserSchema),
  Artist: mongoose.model("Artist", ArtistSchema),
  Song: mongoose.model("Song", SongSchema),
  Movie: mongoose.model("Movie", MovieSchema),
  Review: mongoose.model("Review", ReviewSchema),
  LibraryItem: mongoose.model("LibraryItem", LibraryItemSchema),
  Schedule: mongoose.model("Schedule", ScheduleSchema),
  Notification: mongoose.model("Notification", NotificationSchema)
};