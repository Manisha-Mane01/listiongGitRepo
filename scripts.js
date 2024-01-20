const API_URL = 'https://api.github.com/users/';
let currentPage = 0;
let reposPerPage = 10;

const repositoriesElement = document.getElementById('repositories');
const loader = document.getElementById('loader');
const paginationElement = document.getElementById('pagination');
const profilePicture = document.getElementById('profile-picture');
const githubLink = document.getElementById('github-username');
const userInfo = document.getElementById('user-info');
const usernameInput = document.getElementById('username');
const fetchButton = document.getElementById('fetchButton');

function fetchUserInfoAndRepositories() {
    const inputUsername = usernameInput.value.trim();
    if (!inputUsername) {
        alert('Please enter a GitHub username.');
        return;
    }

    // Fetch user information, including profile picture, username, and bio
    fetch(`${API_URL}${inputUsername}`)
        .then(response => response.json())
        .then(user => {
            // Update profile picture
            profilePicture.src = user.avatar_url;

            // Update GitHub link
            githubLink.href = user.html_url;
            githubLink.textContent = user.login;

            // Update user info
            userInfo.innerHTML = `
                        <h2>${user.name}</h2>
                        <p>${user.bio || ''}</p>
                    `;

            // Fetch repositories
            fetchRepositories(inputUsername);
        })
        .catch(error => console.error('Error fetching user info:', error));
}

function fetchRepositories(username) {
    repositoriesElement.innerHTML = '';
    loader.style.display = 'block';
    paginationElement.innerHTML = '';

    // Reset currentPage to 0 for a new user
    currentPage = 0;

    const nextPage = currentPage + 1;

    fetch(`${API_URL}${username}/repos?page=${nextPage}&per_page=${reposPerPage}`)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            displayRepositories(data, nextPage);
            updatePagination(data.length);
            currentPage = nextPage;
        })
        .catch(error => {
            loader.style.display = 'none';
            repositoriesElement.innerHTML = `<p>Error fetching repositories: ${error.message}</p>`;
        });
}

function fetchPreviosRepositories(username) {
    repositoriesElement.innerHTML = '';
    loader.style.display = 'block';
    paginationElement.innerHTML = '';

    // Reset currentPage to 0 for a new user
    currentPage = 0;

    const prePage = currentPage - 1;

    fetch(`${API_URL}${username}/repos?page=${prePage}&per_page=${reposPerPage}`)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            displayRepositories(data, prePage);
            updatePagination(data.length);
            currentPage = prePage;
        })
        .catch(error => {
            loader.style.display = 'none';
            repositoriesElement.innerHTML = `<p>Error fetching repositories: ${error.message}</p>`;
        });
}


function displayRepositories(repositories, page) {
    if (repositories.length === 0) {
        repositoriesElement.innerHTML = '<p>No repositories found.</p>';
        return;
    }

    const container = document.createElement('div');
    container.className = 'repositories-container';

    repositories.forEach(repo => {
        const repoElement = document.createElement('div');
        repoElement.className = 'repository';
        repoElement.innerHTML = `
                    <h3>${repo.name}</h3>
                    <h5>${repo.description || 'No description available.'}</h5>
                    <p>${repo.language || ''}</p>
                `;
        container.appendChild(repoElement);
    });

    repositoriesElement.appendChild(container);
}

function updatePagination(totalRepositories) {
    const paginationElement = document.getElementById('pagination');
    const totalPages = Math.ceil(totalRepositories / reposPerPage);

    // Add "Previous" button
    const preButton = document.createElement('button');
    preButton.innerText = 'Previous';
    preButton.addEventListener('click', () => fetchPreviosRepositories(usernameInput.value.trim()));
    paginationElement.appendChild(preButton);

    // Add "Next" button
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.addEventListener('click', () => fetchRepositories(usernameInput.value.trim()));
    paginationElement.appendChild(nextButton);
}

fetchButton.addEventListener('click', () => fetchUserInfoAndRepositories());