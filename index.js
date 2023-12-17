import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to database
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 5432
});
db.connect();

const fetchMovies = async(search) => {
    const apiKey = process.env.MOVIE_API_KEY;
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${search}`;
    const response = await axios.get(url);
    return response.data.Search;
}

const fetchDetailMovie = async(id) => {
    const apiKey = process.env.MOVIE_API_KEY;
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;
    const response = await axios.get(url);
    return response.data;
}

const addToFavorite = async(movie) => {
    try {
        const {Title, Released, Runtime, Genre, Director, Actors, Plot, MovieLanguage, Poster, imdbRating, imdbID} = movie;
        await db.query("insert into movies ( Title, Released, Runtime, Genre, Director, Actors, Plot, MovieLanguage, Poster, imdbRating, imdbID ) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [
            Title, Released, Runtime, Genre, Director, Actors, Plot, MovieLanguage, Poster, imdbRating, imdbID
        ])
        return {success: true}
    } catch (error) {
        console.log("unable to add in DB", error)
        return {success: false}
    }
}

const getMyFavorite = async() => {
    try {
        const res = await db.query("select * from movies")
        if (!res.rows[0]) throw Error('No favorite movie found');
        else return res.rows;
    } catch (error) {
        console.log("Unable to fetch", error)
    }
}

const removeMyFavorite = async(id) => {
    try {
        await db.query("delete from movies where imdbid = $1", [id])
    } catch (error) {
        console.log("Unable to fetch", error)
    }
}

app.get("/", async(req, res) => {
    res.render("index.ejs");
})

app.post("/search", async(req, res) => {
    let searchInput = req.body.search.trim();
    const movies = await fetchMovies(searchInput);
    res.render("index.ejs", {movies, searchInput})
})

app.get("/details/:id", async(req, res) => {
    const id = req.params.id;
    const movie = await fetchDetailMovie(id);
    res.render("details.ejs", {movie})
})

app.post("/addfavorite", async(req, res) => {
    const movie = await fetchDetailMovie(req.body.id);
    const result = await addToFavorite(movie)
    console.log(result)
    if(req.body.search){
        let searchInput = req.body.search.trim();
        const movies = await fetchMovies(searchInput);
        res.render("index.ejs", {movies, searchInput, result})
    }else{
        res.redirect("/details/"+req.body.id)
    }
})

app.get("/myfavorite", async (req, res) => {
    const movies = await getMyFavorite()
    res.render("myFavorite.ejs", {movies});
})

app.post("/removefavorite", async(req,res) => {
    await removeMyFavorite(req.body.id);
    const movies = await getMyFavorite()
    res.render("myFavorite.ejs", {movies});
})

app.listen(3000, () => console.log("server is running on: http://localhost:3000/"))