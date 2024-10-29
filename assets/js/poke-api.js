const pokeApi = {};

// Função para converter os dados da API em um objeto de Pokémon
function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = types;

    pokemon.types = types;
    pokemon.type = type;

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

    // Adicione detalhes extras para o modal
    pokemon.height = pokeDetail.height;
    pokemon.weight = pokeDetail.weight;
    pokemon.abilities = pokeDetail.abilities.map((ability) => ability.ability.name);

    return pokemon;
}

// Atualize para permitir uso com URL direta ou com um objeto de Pokémon já existente
pokeApi.getPokemonDetail = (pokemonOrUrl) => {
    const url = typeof pokemonOrUrl === 'string' ? pokemonOrUrl : pokemonOrUrl.url;

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(convertPokeApiDetailToPokemon);
};

// Função para obter uma lista de Pokémons com detalhes básicos
pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails);
};
