import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express'
import dotenv from 'dotenv'

const app = express();
dotenv.config();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))

const fetchMovies = async(search) => {
    const apiKey = process.env.MOVIE_API_KEY;
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${search}`;
    const response = await axios.get(url);
    return response.data.Search;
}

app.get("/", async(req, res) => {
    res.render("index.ejs");
})

app.post("/search", async(req, res) => {
    let searchInput = req.body.search.trim();
    const movies = await fetchMovies(searchInput);
    res.render("index.ejs", {movies})
})

app.listen(3000, () => console.log("server is running on: http://localhost:3000/"))