import {id, sec} from '../.secret'
const params = `?client_id=${id}&client_secret=${sec}`;


async function getProfile(username) {
    const res =  await fetch(`https://api.github.com/users/${username}${params}`)
    return res.json();
}

async function getRepos(username) {
    const res = await fetch(`https://api.github.com/users/${username}/repos${params}&per_page=100`)
    return res.json()
}

function getStarCount(repos) {
    return repos.reduce((count, {
        stargazers_count
    }) => count + stargazers_count, 0)
}

function calculateScore({
    followers
}, repos) {
    return (followers * 3) + getStarCount(repos);
}

function handleError(error) {
    console.warn(error);
    return null;
}

async function getUserData(player) {
    const [ profile, repos ] = await Promise.all([
        getProfile(player),
        getRepos(player)
    ])
    return {
        profile,
        score: calculateScore(profile, repos)
    }
}

function sortPlayers(players) {
    return players.sort((a, b) => b.score - a.score);
}

export async function battle(players) {
    const results = await Promise.all(players.map(getUserData))
        .catch(handleError)
    return results === null
        ? results
        : sortPlayers(results);
}

export async function fetchPopularRepos(language) {
    const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);
    const res = await fetch(encodedURI)
        .catch(handleError)
    const repos = await res.json();
    return repos.items
}