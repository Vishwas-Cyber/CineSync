# CineSync
# 🎬 CineSync

**Discover. Compare. Remember. Watch.**

CineSync is a full-stack movie and music discovery platform that helps users discover movies, explore artists, browse soundtracks, find remembered dialogues or lyrics, manage a personal library, schedule movies, and submit reviews.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express.js](https://img.shields.io/badge/Express.js-Backend-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple)
![JWT](https://img.shields.io/badge/Auth-JWT-blue)

---

## 📌 About CineSync

CineSync combines useful ideas from movie discovery, review comparison, soundtrack exploration, and personal watch planning into one connected platform.

Instead of switching between multiple apps, users can:

- Discover movies using search and filters
- Explore directors, actors, and music directors
- Find a remembered song, dialogue, or scene using Memory Search
- Check external rating and OTT reference links
- Add movies to a watchlist or favourites
- Schedule movies and receive in-app reminders
- Write and view reviews
- Manage the platform through an admin dashboard

CineSync is developed as a Semester V Full-Stack Development project.

---

## ✨ Features

### User Features

- User registration and secure login
- JWT-based authentication
- Browse movies with search, filters, and sorting
- View detailed movie information
- Explore actor, director, and music director profiles
- Browse movie soundtracks and songs
- Search remembered dialogues, scenes, and song lyrics using Memory Search
- Add movies to Watchlist, Favourites, or Watched
- Schedule movies using the Watch Calendar
- Receive in-app notifications
- Submit and view movie reviews
- View external rating and OTT reference links

### Admin Features

- Secure admin login
- Add, edit, and delete movies
- Manage artists
- Manage songs
- View platform statistics
- Manage users and monitor platform activity

---

## 🧠 Memory Search

Memory Search is CineSync’s signature feature.

Users can enter:

- A movie dialogue
- A scene description
- A song lyric
- A partial movie title
- A partial song title

CineSync searches stored movie and song metadata using MongoDB case-insensitive regular expressions and displays matching movies and songs.

Example:

```text
Search: powerful people come from powerful places
Result: K.G.F: Chapter 2
```

Memory Search uses text-based database search. It does not use AI, humming recognition, or image-based scene recognition.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Bootstrap 5, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT, bcrypt |
| API Testing | Postman |
| Movie Data | TMDB API |
| Version Control | Git, GitHub |
| Development Tool | VS Code |

---

## 🗂️ Project Structure

```text
CineSync/
├── server.js               # Main backend entry point
├── seed.js                 # Adds initial demo data
├── importMovies.js         # Imports movies from TMDB
├── fixPosters.js           # Repairs missing movie posters
├── package.json            # Project dependencies and scripts
├── .env                    # Environment variables (not uploaded)
├── models/
│   └── index.js            # Mongoose schemas and models
├── middleware/
│   └── auth.js             # JWT authentication and admin authorization
├── routes/
│   ├── auth.js             # Register and login APIs
│   └── api.js              # Movies, artists, songs, library, calendar APIs
└── public/
    ├── index.html          # Frontend layout
    ├── css/
    │   └── style.css       # CineSync dark cinematic UI
    └── js/
        └── app.js          # Frontend logic and API requests
```

---

## 🗄️ Database Collections

| Collection | Purpose |
|---|---|
| `users` | User accounts, roles, hashed passwords |
| `movies` | Movie details, cast, director, songs, ratings, OTT links |
| `artists` | Actors, directors, and music directors |
| `songs` | Movie songs and soundtrack details |
| `reviews` | User reviews and ratings |
| `libraryitems` | Watchlist, favourites, and watched movies |
| `schedules` | Scheduled movie watches |
| `notifications` | In-app reminders |

### Relationships

```text
User
 ├── Watchlist Items
 ├── Reviews
 ├── Watch Schedules
 └── Notifications

Movie
 ├── Director
 ├── Cast
 ├── Music Director
 ├── Songs
 ├── Reviews
 ├── External Ratings
 └── OTT Links

Artist
 ├── Directed Movies
 ├── Acted Movies
 └── Composed Songs
```

---

## ⚙️ Installation

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB Atlas account
- TMDB API Read Access Token
- Git

### Clone the repository

```bash
git clone [https://github.com/Vishwas-Cyber/CineSync.git](https://github.com/Vishwas-Cyber/CineSync.git)
cd CineSync
```

### Install dependencies

```bash
npm install
```

### Create environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
TMDB_TOKEN=your_tmdb_read_access_token
```

> ⚠️ Never upload `.env`, database credentials, or API tokens to GitHub.

### Seed initial data

```bash
node seed.js
```

### Import real movies from TMDB

```bash
node importMovies.js
```

### Start the application

```bash
npm run dev
```

Open:

```text
http://localhost:5000
```

---

## 🔐 Demo Accounts

After running `node seed.js`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@cinesync.com | admin123 |
| User | vishwas@cinesync.com | user123 |

> Change these credentials before deploying the project publicly.

---

## 🔌 Important API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/movies` | Get movies with filters |
| GET | `/api/movies/:id` | Get movie details and reviews |
| GET | `/api/artists` | Get artists |
| GET | `/api/artists/:id` | Get artist profile and filmography |
| GET | `/api/songs` | Get and search songs |
| GET | `/api/memory/search` | Memory Search |
| POST | `/api/movies/:id/reviews` | Add a review |
| GET | `/api/library` | Get user library |
| POST | `/api/library` | Add movie to library |
| GET | `/api/schedules` | Get watch schedules |
| POST | `/api/schedules` | Schedule a movie |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/admin/stats` | Admin dashboard statistics |

---

## 🎨 UI Design

CineSync uses a premium dark cinematic interface:

- Deep black background
- Purple primary colour
- Cinematic red accents
- Dark grey content cards
- Poster-first movie cards
- Smooth hover effects
- Responsive sidebar navigation
- Toast notifications
- Empty-state messages
- Confirmation dialogs

---

## 🚀 Future Enhancements

- Live OTT availability using authorised APIs
- Personalized recommendations
- Browser and email notifications
- Playlist creation
- Advanced review filtering
- Watch history analytics
- Scene-based and humming-based search
- Deployment with CI/CD

---

## 🧪 Testing

APIs were tested using Postman.

Tested operations include:

- User registration and login
- JWT-protected routes
- Movie search and filtering
- Movie details
- Artist profiles
- Memory Search
- Watchlist operations
- Watch scheduling
- Review submission
- Admin CRUD operations
- Role-based access control

---

## 👨‍💻 Developer

**Vishwas Manjunath**  
Semester V — Full-Stack Development

GitHub: [Vishwas-Cyber](https://github.com/Vishwas-Cyber)

---

## 📄 License

This project is created for educational purposes as part of a Full-Stack Development course.
