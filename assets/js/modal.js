const modal = document.getElementById('pokemon-modal');
const modalCloseButton = document.querySelector('.modal .close');

function showPokemonModal(pokemon) {
    document.getElementById('pokemon-name').textContent = pokemon.name;
    document.getElementById('pokemon-image').src = pokemon.photo;
    document.getElementById('pokemon-height').textContent = pokemon.height;
    document.getElementById('pokemon-weight').textContent = pokemon.weight;
    document.getElementById('pokemon-abilities').textContent = pokemon.abilities.join(', ');

    modal.style.display = 'block';
}

modalCloseButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

export { showPokemonModal };
