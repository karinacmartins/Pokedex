const pokemonList = document.getElementById('pokemonList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearchButton = document.getElementById('clearSearchButton');
const pageInfo = document.getElementById('pageInfo'); // Elemento para o texto da página
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');

const maxRecords = 151; // Total de Pokémon disponíveis
const limit = 10; // Número de Pokémon a serem exibidos por vez
let offset = 0; // Offset inicial para carregamento
let allPokemons = []; // Armazena todos os Pokémon
let filteredPokemons = []; // Armazena Pokémon filtrados pela pesquisa
let isSearching = false; // Estado da pesquisa
let currentPage = 1; // Página atual
let totalPages = 0; // Total de páginas

// Função para converter Pokémon em elementos da lista
function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.types[0]}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>
            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>
                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>
            <div class="button-container">
                <button class="details-button" data-url="https://pokeapi.co/api/v2/pokemon/${pokemon.number}/">More Info</button>
            </div>
        </li>
    `;
}

// Função para mostrar detalhes do Pokémon
function showPokemonDetails(pokemon) {
    const modal = document.getElementById('pokemon-modal');
    const pokemonName = document.getElementById('pokemon-name');
    const pokemonImage = document.getElementById('pokemon-image');
    const pokemonHeight = document.getElementById('pokemon-height');
    const pokemonWeight = document.getElementById('pokemon-weight');
    const pokemonAbilities = document.getElementById('pokemon-abilities');

    pokemonName.textContent = pokemon.name;
    pokemonImage.src = pokemon.photo;
    pokemonHeight.textContent = pokemon.height;
    pokemonWeight.textContent = pokemon.weight;
    pokemonAbilities.textContent = pokemon.abilities.join(', ');

    modal.style.display = 'flex';
}

// Função para adicionar evento de clique no botão "Mais Info"
function addDetailsButtonEvent() {
    document.querySelectorAll('.details-button').forEach((button) => {
        button.addEventListener('click', () => {
            const url = button.getAttribute('data-url');
            pokeApi.getPokemonDetail(url).then(showPokemonDetails);
        });
    });
}

// Função para carregar todos os Pokémon
function loadAllPokemons() {
    pokeApi.getPokemons(0, maxRecords).then((pokemons = []) => {
        allPokemons = [...pokemons];
        totalPages = Math.ceil(allPokemons.length / limit);
        displayPokemons(allPokemons.slice(0, limit));
        updatePageInfo();
    });
}

// Função para exibir Pokémon na lista
function displayPokemons(pokemons) {
    pokemonList.innerHTML = pokemons.map(convertPokemonToLi).join('');
    addDetailsButtonEvent(); // Adiciona eventos após exibir a lista
}

// Função de pesquisa
function searchPokemons(searchTerm) {
    if (searchTerm === '') {
        alert("Digite algo no campo de pesquisa.");
        return;
    }

    if (searchTerm.length < 3) {
        alert("Digite pelo menos 3 caracteres para pesquisar.");
        return;
    }

    const normalizedSearchTerm = searchTerm.replace(/\s+/g, '').toLowerCase();

    const url = `https://pokeapi.co/api/v2/pokemon?limit=${maxRecords}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const filteredPokemonsPromises = data.results.map((pokemon) => {
                return fetch(pokemon.url)
                    .then(response => response.json())
                    .then(details => ({
                        number: details.id,
                        name: details.name,
                        types: details.types.map(typeInfo => typeInfo.type.name),
                        photo: details.sprites.front_default,
                        height: details.height,
                        weight: details.weight,
                        abilities: details.abilities.map(abilityInfo => abilityInfo.ability.name),
                    }));
            });

            return Promise.all(filteredPokemonsPromises);
        })
        .then(pokemons => {
            filteredPokemons = pokemons.filter(pokemon => {
                const pokemonName = pokemon.name.toLowerCase();
                const pokemonTypes = pokemon.types.map(type => type.toLowerCase()).join(' ');

                return (
                    pokemonName.includes(normalizedSearchTerm) ||
                    pokemonTypes.includes(normalizedSearchTerm)
                );
            });

            if (filteredPokemons.length === 0) {
                alert("Nenhum Pokémon encontrado com esse termo.");
            }

            offset = 0;
            isSearching = true;
            currentPage = 1;
            totalPages = Math.ceil(filteredPokemons.length / limit);
            displayPokemons(filteredPokemons.slice(offset, offset + limit));
            updatePageInfo();
        });
}

// Função para atualizar o texto de página
function updatePageInfo() {
    if (pageInfo) {
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
}

// Função para navegar para a página anterior
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePokemonList();
    }
}

// Função para navegar para a próxima página
function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updatePokemonList();
    }
}

// Função para atualizar a lista de Pokémon de acordo com a página atual
function updatePokemonList() {
    const currentPokemons = isSearching ? filteredPokemons : allPokemons;
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    displayPokemons(currentPokemons.slice(start, end));
    updatePageInfo();
}

// Carregar Pokémon iniciais
loadAllPokemons();

// Evento de pesquisa ao clicar no botão
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    searchPokemons(searchTerm);
});

// Evento para iniciar a pesquisa com a tecla Enter
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        searchPokemons(searchTerm);
    }
});

// Evento para o botão de página anterior
previousButton.addEventListener('click', goToPreviousPage);

// Evento para o botão de próxima página
nextButton.addEventListener('click', goToNextPage);

// Evento para limpar a pesquisa
clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    offset = 0;
    isSearching = false;
    currentPage = 1;
    loadAllPokemons();
});

// Evento para fechar o modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('pokemon-modal').style.display = 'none';
});
