const API_URL = 'https://api.github.com/users/';
let currentPage = 1; // Start from page 1
let reposPerPage = 10;

const repositoriesElement = document.getElementById('repositories');
const loader = document.getElementById('loader');
const paginationElement = document.getElementById('pagination');
const profilePicture = document.getElementById('profile-picture');
const githubLink = document.getElementById('github-username');
const userInfo = document.getElementById('user-info');
const usernameInput = document.getElementById('username');
const fetchButton = document.getElementById('fetchButton');

function changeReposPerPage() {
    // Update reposPerPage when the select box changes
    reposPerPage = parseInt(document.getElementById('reposPerPage').value);
    // Reset currentPage to 1 when reposPerPage changes
    currentPage = 1;
    // Refetch repositories with the updated reposPerPage
    fetchUserInfoAndRepositories();
}

function fetchFilteredRepositories(username, page) {
    repositoriesElement.innerHTML = '';
    loader.style.display = 'block';
    paginationElement.innerHTML = '';


    fetch(`${API_URL}${username}/repos?page=${page}&per_page=${reposPerPage}$`)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            displayRepositories(data);
            updatePagination(data.length, username);
        })
        .catch(error => {
            loader.style.display = 'none';
            repositoriesElement.innerHTML = `<p>Error fetching repositories: ${error.message}</p>`;
        });
}

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
                <div class="location-info">
                    <i class="material-icons">place</i>
                    <p>${user.location || 'Location not specified'}</p>
                </div>
                <div class="twitter-info">
                    <i class="fab fa-twitter"></i>
                    <a href="https://twitter.com/${user.twitter_username}" target="_blank">${user.twitter_username || 'Twitter handle not specified'}</a>
                </div>
            `;

            // Fetch repositories for the first page
            fetchRepositories(inputUsername, currentPage);
        })
        .catch(error => console.error('Error fetching user info:', error));
}

function fetchRepositories(username, page) {
    repositoriesElement.innerHTML = '';
    loader.style.display = 'block';
    paginationElement.innerHTML = '';

    fetch(`${API_URL}${username}/repos?page=${page}&per_page=${reposPerPage}`)
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            displayRepositories(data); // No need to pass the page here
            updatePagination(data.length, username);
        })
        .catch(error => {
            loader.style.display = 'none';
            repositoriesElement.innerHTML = `<p>Error fetching repositories: ${error.message}</p>`;
        });
}

function fetchPreviosRepositories(username) {
    const prePage = Math.max(currentPage - 1, 1);
    fetchRepositories(username, prePage);
    currentPage = prePage; // Update the current page
}

function fetchNextRepositories(username) {
    const nextPage = currentPage + 1;
    fetchRepositories(username, nextPage);
    currentPage = nextPage; // Update the current page
}

function displayRepositories(repositories) {
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

function updatePagination(totalRepositories, username) {
    const paginationElement = document.getElementById('pagination');
    const totalPages = Math.ceil(totalRepositories / reposPerPage);

    // Add "Previous" button
    const preButton = document.createElement('button');
    preButton.innerText = 'Previous';
    preButton.addEventListener('click', () => fetchPreviosRepositories(username));
    paginationElement.appendChild(preButton);

    // Add "Next" button
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.addEventListener('click', () => fetchNextRepositories(username));
    paginationElement.appendChild(nextButton);
}

fetchButton.addEventListener('click', fetchUserInfoAndRepositories);