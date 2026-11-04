require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  User, Artist, Movie, Song, Review
} = require("./models");

const artistsData = [
  ["Christopher Nolan", "Director", "British-American filmmaker known for complex, large-scale cinema.", "Academy Award"],
  ["Denis Villeneuve", "Director", "Canadian director known for visually ambitious science fiction.", "Academy Award nomination"],
  ["James Cameron", "Director", "Canadian filmmaker known for epic science-fiction and action films.", "Academy Awards"],
  ["Ridley Scott", "Director", "British director known for science fiction, historical epics and thrillers.", "BAFTA Fellowship"],
  ["Steven Spielberg", "Director", "American filmmaker and pioneer of modern blockbuster cinema.", "Academy Awards"],
  ["Prashanth Neel", "Director", "Indian filmmaker known for large-scale action dramas.", "Filmfare Award South"],
  ["Rajkumar Hirani", "Director", "Indian director known for socially relevant commercial cinema.", "National Film Awards"],
  ["Karan Johar", "Director", "Indian filmmaker known for romantic dramas and ensemble films.", "National Film Award"],
  ["S. S. Rajamouli", "Director", "Indian filmmaker known for grand action and mythological cinema.", "National Film Awards"],
  ["Mani Ratnam", "Director", "Indian filmmaker known for influential Tamil and Indian cinema.", "National Film Awards"],
  ["Lokesh Kanagaraj", "Director", "Tamil filmmaker known for action thrillers.", "SIIMA Award"],
  ["Nelson Dilipkumar", "Director", "Tamil filmmaker known for action comedy.", "SIIMA nomination"],
  ["Sandeep Reddy Vanga", "Director", "Indian filmmaker known for intense romantic dramas.", "Filmfare nomination"],
  ["Sukumar", "Director", "Telugu filmmaker known for stylish action dramas.", "Filmfare Award South"],
  ["Trivikram Srinivas", "Director", "Telugu filmmaker known for dialogue-driven family entertainers.", "Nandi Awards"],
  ["Pawan Kumar", "Director", "Kannada filmmaker known for experimental and emotional cinema.", "Karnataka State Film Award"],
  ["Rishab Shetty", "Director", "Kannada actor-filmmaker known for rooted commercial cinema.", "National Film Award"],
  ["Hemanth M. Rao", "Director", "Kannada filmmaker known for neo-noir and emotional dramas.", "Karnataka State Film Award"],
  ["Hans Zimmer", "Music Director", "German composer known for influential film scores.", "Academy Awards"],
  ["Ludwig Göransson", "Music Director", "Swedish composer known for modern film scores.", "Academy Awards"],
  ["A. R. Rahman", "Music Director", "Indian composer known for globally influential film music.", "Academy Awards"],
  ["Pritam", "Music Director", "Indian music composer known for Bollywood soundtracks.", "Filmfare Awards"],
  ["Anirudh Ravichander", "Music Director", "Indian composer known for Tamil film music.", "SIIMA Awards"],
  ["Devi Sri Prasad", "Music Director", "Indian composer known for energetic Telugu soundtracks.", "Filmfare Award South"],
  ["S. Thaman", "Music Director", "Indian composer known for Telugu and Tamil film scores.", "SIIMA Award"],
  ["Ravi Basrur", "Music Director", "Indian composer known for powerful action film music.", "Filmfare Award South"],
  ["B. Ajaneesh Loknath", "Music Director", "Kannada composer known for atmospheric film scores.", "Karnataka State Film Award"],
  ["Charan Raj", "Music Director", "Kannada composer known for modern Kannada film music.", "Filmfare Award South"],
  ["Tom Hanks", "Actor", "American actor known for drama, comedy and historical films.", "Academy Awards"],
  ["Leonardo DiCaprio", "Actor", "American actor known for acclaimed dramatic performances.", "Academy Award"],
  ["Christian Bale", "Actor", "British actor known for transformative performances.", "Academy Awards"],
  ["Robert Downey Jr.", "Actor", "American actor known for charismatic screen performances.", "Academy Award"],
  ["Yash", "Actor", "Indian actor known for action cinema.", "SIIMA Award"],
  ["Ranbir Kapoor", "Actor", "Indian actor known for romantic and dramatic roles.", "Filmfare Awards"],
  ["Aamir Khan", "Actor", "Indian actor and filmmaker known for socially driven cinema.", "National Film Awards"],
  ["Shah Rukh Khan", "Actor", "Indian actor known as one of Hindi cinema's biggest stars.", "National Film Awards"],
  ["Prabhas", "Actor", "Indian actor known for pan-Indian action cinema.", "Nandi Award"],
  ["Allu Arjun", "Actor", "Telugu actor known for stylish action entertainers.", "National Film Award"],
  ["N. T. Rama Rao Jr.", "Actor", "Telugu actor known for action and dance-oriented cinema.", "Nandi Award"],
  ["Ram Charan", "Actor", "Telugu actor known for action dramas.", "Nandi Award"],
  ["Vijay Sethupathi", "Actor", "Tamil actor known for versatile character roles.", "National Film Award"],
  ["Rakshit Shetty", "Actor", "Kannada actor-filmmaker known for experimental cinema.", "Karnataka State Film Award"],
  ["Rishab Shetty", "Actor", "Kannada actor-filmmaker known for rooted performances.", "National Film Award"],
  ["Puneeth Rajkumar", "Actor", "Kannada actor and singer beloved in Kannada cinema.", "National Film Awards"]
];

const moviesData = [
  ["Inception", 2010, "English", ["Science Fiction", "Thriller", "Action"], "A thief enters dreams to steal secrets and is tasked with planting an idea.", "Christopher Nolan", "Hans Zimmer", ["Leonardo DiCaprio"]],
  ["Interstellar", 2014, "English", ["Science Fiction", "Drama", "Adventure"], "Explorers travel through a wormhole to find humanity a new home.", "Christopher Nolan", "Hans Zimmer", ["Matthew McConaughey"]],
  ["The Dark Knight", 2008, "English", ["Action", "Crime", "Thriller"], "Batman faces the Joker in a battle for Gotham's soul.", "Christopher Nolan", "Hans Zimmer", ["Christian Bale"]],
  ["Oppenheimer", 2023, "English", ["Biography", "Drama", "History"], "The story of J. Robert Oppenheimer and the creation of the atomic bomb.", "Christopher Nolan", "Ludwig Göransson", ["Cillian Murphy"]],
  ["Dune", 2021, "English", ["Science Fiction", "Adventure", "Drama"], "A noble family becomes embroiled in a war for control of a desert planet.", "Denis Villeneuve", "Hans Zimmer", ["Timothée Chalamet"]],
  ["Dune: Part Two", 2024, "English", ["Science Fiction", "Adventure", "Drama"], "Paul Atreides unites with the Fremen to confront his destiny.", "Denis Villeneuve", "Hans Zimmer", ["Timothée Chalamet"]],
  ["Avatar", 2009, "English", ["Science Fiction", "Adventure", "Action"], "A human becomes part of the Na'vi world on Pandora.", "James Cameron", "James Horner", ["Sam Worthington"]],
  ["Titanic", 1997, "English", ["Romance", "Drama", "History"], "A young couple fall in love aboard the ill-fated Titanic.", "James Cameron", "James Horner", ["Leonardo DiCaprio"]],
  ["Gladiator", 2000, "English", ["Action", "Drama", "History"], "A betrayed Roman general seeks revenge as a gladiator.", "Ridley Scott", "Hans Zimmer", ["Russell Crowe"]],
  ["Jurassic Park", 1993, "English", ["Adventure", "Science Fiction", "Thriller"], "Dinosaurs are recreated in a theme park with disastrous results.", "Steven Spielberg", "John Williams", ["Sam Neill"]],
  ["K.G.F: Chapter 1", 2018, "Kannada", ["Action", "Drama", "Crime"], "Rocky rises through violence and ambition in the Kolar Gold Fields.", "Prashanth Neel", "Ravi Basrur", ["Yash"]],
  ["K.G.F: Chapter 2", 2022, "Kannada", ["Action", "Drama", "Crime"], "Rocky confronts powerful enemies to control the Kolar Gold Fields.", "Prashanth Neel", "Ravi Basrur", ["Yash"]],
  ["Kantara", 2022, "Kannada", ["Action", "Drama", "Thriller"], "A tribal man confronts tradition, nature and power in coastal Karnataka.", "Rishab Shetty", "B. Ajaneesh Loknath", ["Rishab Shetty"]],
  ["Ulidavaru Kandanthe", 2014, "Kannada", ["Crime", "Drama", "Mystery"], "Interconnected stories unfold around a violent incident in a coastal town.", "Rakshit Shetty", "B. Ajaneesh Loknath", ["Rakshit Shetty"]],
  ["Kirik Party", 2016, "Kannada", ["Comedy", "Drama", "Romance"], "A group of engineering students experience friendship, love and loss.", "Rishab Shetty", "B. Ajaneesh Loknath", ["Rakshit Shetty"]],
  ["Dia", 2020, "Kannada", ["Romance", "Drama", "Thriller"], "A young woman's life changes after a fateful encounter.", "K. S. Ashoka", "B. Ajaneesh Loknath", ["Kushee Ravi"]],
  ["Lucia", 2013, "Kannada", ["Mystery", "Drama", "Romance"], "A man discovers a drug that gives him vivid dreams.", "Pawan Kumar", "Poornachandra Tejaswi", ["Sathish Ninasam"]],
  ["Life Is Beautiful", 2022, "Kannada", ["Drama", "Romance"], "A story about youth, ambition and emotional relationships.", "Pawan Kumar", "Charan Raj", ["Rakshit Shetty"]],
  ["3 Idiots", 2009, "Hindi", ["Comedy", "Drama"], "Three engineering students challenge conventional education and expectations.", "Rajkumar Hirani", "Shantanu Moitra", ["Aamir Khan"]],
  ["PK", 2014, "Hindi", ["Comedy", "Drama", "Science Fiction"], "An alien questions religious beliefs and social practices on Earth.", "Rajkumar Hirani", "Ajit Singh", ["Aamir Khan"]],
  ["Dil Chahta Hai", 2001, "Hindi", ["Comedy", "Drama", "Romance"], "Three friends navigate love, friendship and adulthood.", "Farhan Akhtar", "Shankar-Ehsaan-Loy", ["Aamir Khan"]],
  ["Rockstar", 2011, "Hindi", ["Drama", "Music", "Romance"], "A musician's rise to fame intertwines with love and loss.", "Imtiaz Ali", "A. R. Rahman", ["Ranbir Kapoor"]],
  ["Barfi!", 2012, "Hindi", ["Comedy", "Drama", "Romance"], "A hearing-impaired man forms a tender bond with two women.", "Anurag Basu", "Pritam", ["Ranbir Kapoor"]],
  ["Yeh Jawaani Hai Deewani", 2013, "Hindi", ["Romance", "Drama", "Comedy"], "A traveler reconnects with friends and love during a wedding.", "Ayan Mukerji", "Pritam", ["Ranbir Kapoor"]],
  ["Brahmastra", 2022, "Hindi", ["Fantasy", "Action", "Adventure"], "A young man discovers his connection to ancient astral powers.", "Ayan Mukerji", "Simon Franglen", ["Ranbir Kapoor"]],
  ["Jawan", 2023, "Hindi", ["Action", "Thriller", "Drama"], "A vigilante takes on corruption through a powerful mission.", "Atlee", "Anirudh Ravichander", ["Shah Rukh Khan"]],
  ["Pathaan", 2023, "Hindi", ["Action", "Thriller"], "An Indian agent battles a dangerous private army.", "Siddharth Anand", "Vishal-Sheykhar", ["Shah Rukh Khan"]],
  ["RRR", 2022, "Telugu", ["Action", "Drama", "History"], "Two revolutionaries unite against colonial oppression.", "S. S. Rajamouli", "M. M. Keeravani", ["N. T. Rama Rao Jr.", "Ram Charan"]],
  ["Baahubali: The Beginning", 2015, "Telugu", ["Action", "Fantasy", "Drama"], "A young man learns about his royal heritage and a kingdom's conflict.", "S. S. Rajamouli", "M. M. Keeravani", ["Prabhas"]],
  ["Baahubali 2: The Conclusion", 2017, "Telugu", ["Action", "Fantasy", "Drama"], "The story of Baahubali's rise, betrayal and legacy concludes.", "S. S. Rajamouli", "M. M. Keeravani", ["Prabhas"]],
  ["Pushpa: The Rise", 2021, "Telugu", ["Action", "Crime", "Drama"], "A labourer rises in the red sandalwood smuggling world.", "Sukumar", "Devi Sri Prasad", ["Allu Arjun"]],
  ["Pushpa 2: The Rule", 2024, "Telugu", ["Action", "Crime", "Drama"], "Pushpa Raj continues his battle for power and survival.", "Sukumar", "Devi Sri Prasad", ["Allu Arjun"]],
  ["Ala Vaikunthapurramuloo", 2020, "Telugu", ["Action", "Comedy", "Drama"], "A man discovers his true identity and confronts his past.", "Trivikram Srinivas", "S. Thaman", ["Allu Arjun"]],
  ["Animal", 2023, "Hindi", ["Action", "Crime", "Drama"], "A son's complicated relationship with his father turns violent.", "Sandeep Reddy Vanga", "Vishal Mishra", ["Ranbir Kapoor"]],
  ["Arjun Reddy", 2017, "Telugu", ["Drama", "Romance"], "A brilliant but volatile surgeon spirals after heartbreak.", "Sandeep Reddy Vanga", "Vijay Deverakonda", ["Vijay Deverakonda"]],
  ["Kabali", 2016, "Tamil", ["Action", "Crime", "Drama"], "A gangster returns after decades in prison to reclaim his legacy.", "Pa. Ranjith", "Santhosh Narayanan", ["Rajinikanth"]],
  ["Vikram", 2022, "Tamil", ["Action", "Crime", "Thriller"], "An investigation uncovers a dangerous network of masked vigilantes.", "Lokesh Kanagaraj", "Anirudh Ravichander", ["Kamal Haasan", "Vijay Sethupathi"]],
  ["Jailer", 2023, "Tamil", ["Action", "Comedy", "Crime"], "A retired jailer is drawn back into a criminal conflict.", "Nelson Dilipkumar", "Anirudh Ravichander", ["Rajinikanth"]],
  ["Beast", 2022, "Tamil", ["Action", "Thriller"], "An ex-raw agent must rescue hostages trapped in a mall.", "Nelson Dilipkumar", "Anirudh Ravichander", ["Vijay"]],
  ["Ponniyin Selvan: I", 2022, "Tamil", ["History", "Drama", "Adventure"], "Political conflict threatens the Chola empire.", "Mani Ratnam", "A. R. Rahman", ["Vikram"]],
  ["Ponniyin Selvan: II", 2023, "Tamil", ["History", "Drama", "Adventure"], "The Chola empire faces betrayal, war and succession.", "Mani Ratnam", "A. R. Rahman", ["Vikram"]]
];

const songsData = [
  ["Time", "Hans Zimmer", "Inception", "English", "Instrumental", "Dreams become real and time bends around every choice."],
  ["No Time for Caution", "Hans Zimmer", "Interstellar", "English", "Instrumental", "The docking scene music with rising organ and tension."],
  ["Why So Serious", "Hans Zimmer", "The Dark Knight", "English", "Instrumental", "The Joker theme with chaotic electronic sound."],
  ["Can You Hear the Music", "Ludwig Göransson", "Oppenheimer", "English", "Instrumental", "Fast strings accompany the race to build the atomic bomb."],
  ["My Heart Will Go On", "Celine Dion", "Titanic", "English", "Romantic", "A love song remembered across the ocean."],
  ["Srivalli", "Sid Sriram", "Pushpa: The Rise", "Telugu", "Romantic", "Srivalli song with romantic melody and mountain visuals."],
  ["Oo Antava", "Indravathi Chauhan", "Pushpa: The Rise", "Telugu", "Dance", "High-energy dance song from Pushpa."],
  ["Naatu Naatu", "Rahul Sipligunj and Kaala Bhairava", "RRR", "Telugu", "Dance", "Energetic dance anthem performed at a British party."],
  ["Dosti", "Hemachandra", "RRR", "Telugu", "Friendship", "A song about friendship between two revolutionaries."],
  ["Saahore Baahubali", "Daler Mehndi", "Baahubali 2", "Telugu", "Epic", "Grand royal entry song celebrating Baahubali."],
  ["Manohari", "Divya Kumar", "Baahubali", "Telugu", "Dance", "Vibrant dance number from the Mahishmati kingdom."],
  ["Kannamma", "Sid Sriram", "K.G.F: Chapter 1", "Kannada", "Romantic", "Emotional romantic song from K.G.F Chapter 1."],
  ["Toofan", "Ananya Bhat", "K.G.F: Chapter 2", "Kannada", "Action", "Powerful anthem about Rocky's rise."],
  ["Varaha Roopam", "Vijay Prakash", "Kantara", "Kannada", "Devotional", "Spiritual song connected to the Bhoota Kola tradition."],
  ["Singara Siriye", "Ananya Bhat", "Kantara", "Kannada", "Romantic", "Melodic romantic track from Kantara."],
  ["Kaagada Bandide", "Vijay Prakash", "Lucia", "Kannada", "Melancholy", "Dreamlike song connected to Lucia's alternate reality."],
  ["Pyaar Hua Ikrar Hua", "Manna Dey and Lata Mangeshkar", "Shree 420", "Hindi", "Classic", "Timeless romantic duet in the rain."],
  ["Give Me Some Sunshine", "Suraj Jagan and Sharman Joshi", "3 Idiots", "Hindi", "Emotional", "A song about pressure, dreams and student life."],
  ["Behti Hawa Sa Tha Woh", "Mohit Chauhan", "3 Idiots", "Hindi", "Friendship", "A tribute to a free-spirited friend."],
  ["Kun Faya Kun", "A. R. Rahman", "Rockstar", "Hindi", "Sufi", "Spiritual journey expressed through Sufi music."],
  ["Tum Ho Paas Hain", "A. R. Rahman", "Rockstar", "Hindi", "Romantic", "Emotional love theme from Rockstar."],
  ["Barfi!", "Pritam", "Barfi!", "Hindi", "Romantic", "Playful and emotional theme from Barfi."],
  ["Kabira", "Tochi Raina and Rekha Bhardwaj", "Yeh Jawaani Hai Deewani", "Hindi", "Melancholy", "Reflective song about life, love and moving on."],
  ["Kesariya", "Arijit Singh", "Brahmastra", "Hindi", "Romantic", "Romantic melody from Brahmastra."],
  ["Chaleya", "Arijit Singh and Shilpa Rao", "Jawan", "Hindi", "Romantic", "Modern romantic track from Jawan."],
  ["Jhoome Jo Pathaan", "Arijit Singh", "Pathaan", "Hindi", "Dance", "High-energy action dance track."],
  ["Zinda Hoon Yaar Kaun", "Anirudh Ravichander", "Vikram", "Tamil", "Action", "Intense theme connected to Vikram's mission."],
  ["Halamithi Habibo", "Anirudh Ravichander", "Beast", "Tamil", "Dance", "Catchy dance track from Beast."],
  ["Kaattu Payale", "Dhanush", "Jagame Thandhiram", "Tamil", "Dance", "Energetic Tamil dance track."],
  ["Ponni Nadhi", "A. R. Rahman", "Ponniyin Selvan: I", "Tamil", "Epic", "Grand historical theme from Ponniyin Selvan."],
  ["Devaralan Aattam", "A. R. Rahman", "Ponniyin Selvan: I", "Tamil", "Historical", "Powerful period song from the Chola era."],
  ["Ram Siya Ram", "Ajay-Atul", "Adipurush", "Hindi", "Devotional", "Devotional theme centered on Lord Ram."],
  ["Srivalli", "Sid Sriram", "Pushpa: The Rise", "Telugu", "Romantic", "Romantic melody associated with Pushpa and Srivalli."],
  ["Butta Bomma", "Armaan Malik", "Ala Vaikunthapurramuloo", "Telugu", "Dance", "Popular dance track from Ala Vaikunthapurramuloo."],
  ["Ramuloo Ramulaa", "Anurag Kulkarni", "Ala Vaikunthapurramuloo", "Telugu", "Dance", "Celebratory Telugu dance song."],
  ["Arjun Reddy Theme", "Vijay Deverakonda", "Arjun Reddy", "Telugu", "Instrumental", "Emotional theme from Arjun Reddy."],
  ["Kabali Theme", "Santhosh Narayanan", "Kabali", "Tamil", "Action", "Bold theme associated with Kabali."],
  ["Nee Kavali", "Sid Sriram", "Life Is Beautiful", "Kannada", "Romantic", "Emotional Kannada romantic song."],
  ["Ninna Sanihake", "Vijay Prakash", "Life Is Beautiful", "Kannada", "Romantic", "Soulful Kannada melody."],
  ["Huttidare", "Shankar Mahadevan", "Kirik Party", "Kannada", "Friendship", "Energetic college friendship song."]
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany(), Artist.deleteMany(),
    Movie.deleteMany(), Song.deleteMany(), Review.deleteMany()
  ]);

  await User.create([
    {
      name: "CineSync Admin",
      email: "admin@cinesync.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin"
    },
    {
      name: "Vishwas",
      email: "vishwas@cinesync.com",
      password: await bcrypt.hash("user123", 10)
    }
  ]);

  const artistMap = {};

  for (const [name, role, bio, awards] of artistsData) {
    if (!artistMap[name]) {
      artistMap[name] = await Artist.create({ name, role, bio, awards });
    }
  }

  const songMap = {};

  for (const [title, singer, movieTitle, language, genre, lyrics] of songsData) {
    const key = title + "|" + movieTitle;

    if (!songMap[key]) {
      songMap[key] = await Song.create({
        title,
        singer,
        language,
        genre,
        lyricsSnippet: lyrics,
        listenUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " " + movieTitle + " song")}`
      });
    }
  }

  for (const [
    title, releaseYear, language, genres, synopsis,
    directorName, musicName, castNames
  ] of moviesData) {
    const movieSongs = songsData
      .filter(s => s[2] === title)
      .map(s => songMap[s[0] + "|" + s[2]]._id);

    await Movie.create({
      title,
      releaseYear,
      language,
      genres,
      synopsis,
      director: artistMap[directorName]?._id,
      musicDirector: artistMap[musicName]?._id,
      cast: castNames.map(name => artistMap[name]?._id).filter(Boolean),
      songs: movieSongs,
      posterUrl: "",
      dialogues: [`${title} memorable dialogue sample.`],
      sceneDescription: `${title}: ${synopsis}`,
      externalRatings: [
        { source: "IMDb", rating: "Open IMDb", url: `https://www.imdb.com/find/?q=${encodeURIComponent(title)}` },
        { source: "Rotten Tomatoes", rating: "Open Reviews", url: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title)}` }
      ],
      ottLinks: [
        { platform: "JustWatch", type: "Check Availability", url: `https://www.justwatch.com/in/search?q=${encodeURIComponent(title)}` }
      ]
    });
  }

  const firstMovie = await Movie.findOne({ title: "Inception" });
  const normalUser = await User.findOne({ email: "vishwas@cinesync.com" });

  await Review.create({
    user: normalUser._id,
    movie: firstMovie._id,
    rating: 10,
    comment: "A brilliant science-fiction thriller with an unforgettable concept."
  });

  console.log("Encyclopedia seed completed");
  console.log("Movies:", moviesData.length);
  console.log("Artists:", artistsData.length);
  console.log("Songs:", songsData.length);
  console.log("Admin login: admin@cinesync.com / admin123");
  console.log("User login: vishwas@cinesync.com / user123");
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});