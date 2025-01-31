document.addEventListener('DOMContentLoaded', () => {
    const lanesContainer = document.getElementById('lanes');
    const subredditInput = document.getElementById('subreddit-input');
    const addSubredditButton = document.getElementById('add-subreddit');

    // Cargar carriles guardados al iniciar
    restoreLanes();

    // Evento para agregar un nuevo subreddit
    addSubredditButton.addEventListener('click', async () => {
        const subreddit = subredditInput.value.trim();
        if (subreddit) {
            const posts = await fetchSubredditPosts(subreddit);
            if (posts) {
                createLane(subreddit, posts);
                saveLane(subreddit);
            }
            subredditInput.value = ''; // Limpiar el campo de entrada
        }
    });

    // Función para obtener publicaciones de un subreddit
    async function fetchSubredditPosts(subreddit) {
        try {
            showLoading(subreddit);
            const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`);
            const data = await response.json();
            hideLoading(subreddit);
            return data.data.children;
        } catch (error) {
            hideLoading(subreddit);
            showError(subreddit, 'Error al cargar los datos. Inténtalo de nuevo.');
            return null;
        }
    }

    // Función para crear un nuevo carril
    function createLane(subreddit, posts) {
        const lane = document.createElement('div');
        lane.className = 'lane';
        lane.innerHTML = `<h2>${subreddit}</h2>`;

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h3>${post.data.title}</h3>
                <p>Autor: ${post.data.author}</p>
                <p>Votos: ${post.data.ups}</p>
            `;
            lane.appendChild(postElement);
        });

        // Botón para eliminar el carril
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Eliminar Carril';
        deleteButton.addEventListener('click', () => {
            lane.remove();
            removeLane(subreddit);
        });
        lane.appendChild(deleteButton);

        lanesContainer.appendChild(lane);
    }

    // Función para mostrar el estado de carga
    function showLoading(subreddit) {
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerText = 'Cargando...';
        lanesContainer.appendChild(loading);
    }

    // Función para ocultar el estado de carga
    function hideLoading(subreddit) {
        const loading = document.querySelector('.loading');
        if (loading) loading.remove();
    }

    // Función para mostrar un mensaje de error
    function showError(subreddit, message) {
        const error = document.createElement('div');
        error.className = 'error';
        error.innerText = message;
        lanesContainer.appendChild(error);
    }

    // Función para guardar un carril en localStorage
    function saveLane(subreddit) {
        const lanes = JSON.parse(localStorage.getItem('lanes')) || [];
        lanes.push(subreddit);
        localStorage.setItem('lanes', JSON.stringify(lanes));
    }

    // Función para eliminar un carril de localStorage
    function removeLane(subreddit) {
        const lanes = JSON.parse(localStorage.getItem('lanes')) || [];
        const updatedLanes = lanes.filter(lane => lane !== subreddit);
        localStorage.setItem('lanes', JSON.stringify(updatedLanes));
    }

    // Función para restaurar los carriles guardados
    function restoreLanes() {
        const lanes = JSON.parse(localStorage.getItem('lanes')) || [];
        lanes.forEach(async subreddit => {
            const posts = await fetchSubredditPosts(subreddit);
            if (posts) {
                createLane(subreddit, posts);
            }
        });
    }
});