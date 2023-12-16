import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express'
import dotenv from 'dotenv'
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
dotenv.config();

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(bodyParser.urlencoded({ extended: true }))

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

app.get("/", async(req, res) => {
    res.render("index.ejs");
})

app.post("/search", async(req, res) => {
    let searchInput = req.body.search.trim();
    const movies = await fetchMovies(searchInput);
    res.render("index.ejs", {movies})
})

app.get("/details/:id", async(req, res) => {
    const id = req.params.id;
    const movie = await fetchDetailMovie(id);
    console.log(movie)
    res.render("details.ejs", {movie: movie ?? {}})
})

app.listen(3000, () => console.log("server is running on: http://localhost:3000/"))