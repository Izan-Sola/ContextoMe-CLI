const fetch = require('node-fetch');

const GameApi = (language, gameId) => {
    const baseUrl = 'https://api.contexto.me/machado';

    const play = async (word) => {
        const response = await fetch(`${baseUrl}/${language}/game/${gameId}/${word}`);
        if (!response.ok) throw new Error('Request failed');
        return response.json();
    };

    const tip = async (distance) => {
        const response = await fetch(`${baseUrl}/${language}/tip/${gameId}/${distance}`);
        if (!response.ok) throw new Error('Request failed');
        return response.json();
    };

    const giveUp = async () => {
        const response = await fetch(`${baseUrl}/${language}/giveup/${gameId}`);
        if (!response.ok) throw new Error('Request failed');
        return response.json();
    };

    const getClosestWords = async () => {
        const response = await fetch(`${baseUrl}/${language}/top/${gameId}`);
        if (!response.ok) throw new Error('Request failed');
        return response.json();
    };

    return {
        play,
        tip,
        giveUp,
        getClosestWords,
    };
};

module.exports = GameApi;