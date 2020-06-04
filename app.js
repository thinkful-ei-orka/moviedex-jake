require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const movieList = require('./moviedex.js');
const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {

    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    next();
});


app.get('/movies', handleGetMovies);




function handleGetMovies (req, res) {
    //Search options for genre, country, avg_vote are provided in query string
    //when searching, search for if genre includes specific string
    //country:  includes specific string
    //avg_vote: >= supplied number
    const { genre, country, avg_vote } = req.query;
    const validGenre = [];
    movieList.forEach(movie => {
        if(!validGenre.includes(movie.genre.toLowerCase())) {
            validGenre.push(movie.genre.toLowerCase());
        }
    });
    const validCountry = []; 
    movieList.forEach(movie => {
        if(!validCountry.includes(movie.country.toLowerCase())) {
            validCountry.push(movie.country.toLowerCase());
        }
    });


    if(genre && !validGenre.includes(genre.toLowerCase())) {
        return res
            .status(400)
            .json({error: 'Please enter a valid genre'});
    }

    if(country && !validCountry.includes(country.toLowerCase())) {
        return res
            .status(400)
            .json({error: 'Please enter a valid country'});
    }
  
    if(avg_vote && Number.isNaN(Number(avg_vote))) {
        return res 
            .status(400)
            .json({error: 'Please enter a valid vote'});
    }

    let results = [];

    if(avg_vote) {
        movieList.forEach(movie => {
            if(movie['avg_vote'] >= parseFloat(avg_vote)) {
                results.push(movie);
            }
        });
    }
    if(genre) {
        movieList.forEach(movie => {
            if(movie.genre.toLowerCase().includes(genre.toLowerCase())) {
                results.push(movie);
            }
        });
    }
    if(country) {
        movieList.forEach(movie => {
            if(movie.country.toLowerCase().includes(country.toLowerCase())) {
                results.push(movie);
            }
        });
    }
    if(!genre && !country && !avg_vote) {
        results = movieList;
    }
    res.json(results);
}
app.listen(8000, () => {
    console.log('Express server is listening on port 8000');
});