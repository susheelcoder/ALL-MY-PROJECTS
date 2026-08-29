(function () {
    "use strict";

    /* =========================================================
       GITHUB DEVELOPER ANALYZER
       GitHub REST API → Profile → Repositories → Evidence
    ========================================================= */

    const GITHUB_API = "https://api.github.com";

    const API_HEADERS = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    };

    let developer = null;
    let repositories = [];
    let currentFilter = "all";

    /* =========================================================
       GITHUB API REQUEST
    ========================================================= */

    async function githubFetch(url) {

        const response = await fetch(url, {
            method: "GET",
            headers: API_HEADERS
        });

        if (response.status === 403) {
            const remaining =
                response.headers.get("X-RateLimit-Remaining");

            if (remaining === "0") {
                throw new Error(
                    "GitHub API rate limit reached. Please try again later."
                );
            }
        }

        if (!response.ok) {

            let message = "";

            try {
                const data = await response.json();
                message = data.message || "";
            } catch (_) {}

            throw new Error(
                `GitHub API Error ${response.status}: ${message}`
            );
        }

        return response.json();
    }

    /* =========================================================
       GET USERNAME FROM URL
    ========================================================= */

    function getUsername(value) {

        value = String(value || "").trim();

        if (!value) return null;

        value = value.replace(/\/+$/, "");

        if (value.startsWith("@")) {
            return value.substring(1);
        }

        try {

            const url = new URL(value);

            if (
                url.hostname === "github.com" ||
                url.hostname === "www.github.com"
            ) {

                const parts =
                    url.pathname
                        .split("/")
                        .filter(Boolean);

                return parts[0] || null;
            }

        } catch (_) {}

        if (
            !value.includes("/") &&
            !value.includes(".")
        ) {
            return value;
        }

        return null;
    }

    /* =========================================================
       ANALYZE DEVELOPER
    ========================================================= */

    async function analyzeDeveloper() {

        const input =
            document.getElementById("githubUrl");

        const button =
            document.getElementById("analyzeBtn");

        if (!input) {
            console.error(
                "GitHub URL input #githubUrl not found."
            );
            return;
        }

        const username =
            getUsername(input.value);

        if (!username) {
            alert(
                "Valid GitHub profile URL enter karo.\n\n" +
                "Example:\nhttps://github.com/octocat"
            );
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = "Analyzing...";
        }

        showLoading();

        try {

            /* ---------------------------------------------
               1. PROFILE
            --------------------------------------------- */

            developer =
                await githubFetch(
                    `${GITHUB_API}/users/${encodeURIComponent(username)}`
                );


            /* ---------------------------------------------
               2. ALL PUBLIC REPOSITORIES
            --------------------------------------------- */

            repositories =
                await getAllRepositories(username);


            /* ---------------------------------------------
               3. REPOSITORY ANALYSIS
            --------------------------------------------- */

            await analyzeRepositories();


            /* ---------------------------------------------
               4. UI
            --------------------------------------------- */

            renderProfile();
            renderDeveloperScore();
            renderAnalysis();
            renderRepositories();

        } catch (error) {

            console.error(error);

            showError(error.message);

        } finally {

            if (button) {
                button.disabled = false;
                button.textContent = "Analyze";
            }

        }
    }

    /* =========================================================
       GET ALL REPOSITORIES
    ========================================================= */

    async function getAllRepositories(username) {

        const allRepositories = [];

        let page = 1;

        while (true) {

            const url =
                `${GITHUB_API}/users/` +
                `${encodeURIComponent(username)}/repos` +
                `?per_page=100&page=${page}` +
                `&type=all&sort=updated`;

            const data =
                await githubFetch(url);

            allRepositories.push(...data);

            if (data.length < 100) {
                break;
            }

            page++;

            /*
             * Browser safety limit.
             * Backend version can remove this.
             */

            if (page > 20) {
                break;
            }
        }

        return allRepositories;
    }

    /* =========================================================
       ANALYZE REPOSITORIES
    ========================================================= */

    async function analyzeRepositories() {

        const batchSize = 5;

        for (
            let i = 0;
            i < repositories.length;
            i += batchSize
        ) {

            const batch =
                repositories.slice(
                    i,
                    i + batchSize
                );

            await Promise.all(
                batch.map(
                    repository =>
                        analyzeRepository(repository)
                )
            );

        }
    }

    /* =========================================================
       SINGLE REPOSITORY ANALYSIS
    ========================================================= */

    async function analyzeRepository(repo) {

        repo.analysis = {

            languages: [],

            files: [],

            readme: false,

            commits: 0,

            contributors: 0,

            issues: 0,

            pullRequests: 0,

            frontend: false,

            backend: false,

            database: false,

            authentication: false,

            deployment: false,

            complexity: 0,

            effort: 0,

            originality: 0,

            classification: "basic",

            old: false

        };


        /* ---------------------------------------------
           LANGUAGES
        --------------------------------------------- */

        try {

            const languages =
                await githubFetch(
                    repo.languages_url
                );

            repo.analysis.languages =
                Object.keys(languages);

        } catch (error) {

            console.warn(
                "Language API failed:",
                repo.name,
                error
            );

        }


        /* ---------------------------------------------
           README
        --------------------------------------------- */

        let readmeText = "";

        try {

            const readme =
                await githubFetch(
                    `${GITHUB_API}/repos/` +
                    `${repo.owner.login}/` +
                    `${repo.name}/readme`
                );

            repo.analysis.readme = true;

            if (readme.content) {

                try {

                    readmeText =
                        decodeBase64(
                            readme.content
                        );

                } catch (_) {}

            }

        } catch (_) {}


        /* ---------------------------------------------
           ROOT FILES
        --------------------------------------------- */

        try {

            const files =
                await githubFetch(
                    `${GITHUB_API}/repos/` +
                    `${repo.owner.login}/` +
                    `${repo.name}/contents`
                );

            if (Array.isArray(files)) {

                repo.analysis.files =
                    files.map(
                        file => file.name
                    );

            }

        } catch (_) {}


        /* ---------------------------------------------
           TECHNOLOGY DETECTION
        --------------------------------------------- */

        detectTechnology(
            repo,
            readmeText
        );


        /* ---------------------------------------------
           COMMITS
        --------------------------------------------- */

        try {

            const commits =
                await githubFetch(
                    `${GITHUB_API}/repos/` +
                    `${repo.owner.login}/` +
                    `${repo.name}/commits?per_page=100`
                );

            repo.analysis.commits =
                Array.isArray(commits)
                    ? commits.length
                    : 0;

        } catch (_) {}


        /* ---------------------------------------------
           CONTRIBUTORS
        --------------------------------------------- */

        try {

            const contributors =
                await githubFetch(
                    `${GITHUB_API}/repos/` +
                    `${repo.owner.login}/` +
                    `${repo.name}/contributors?per_page=100`
                );

            repo.analysis.contributors =
                Array.isArray(contributors)
                    ? contributors.length
                    : 0;

        } catch (_) {}


        /* ---------------------------------------------
           ISSUES
        --------------------------------------------- */

        try {

            const issues =
                await githubFetch(
                    `${GITHUB_API}/repos/` +
                    `${repo.owner.login}/` +
                    `${repo.name}/issues` +
                    `?state=all&per_page=100`
                );

            repo.analysis.issues =
                Array.isArray(issues)
                    ? issues.filter(
                        issue => !issue.pull_request
                    ).length
                    : 0;

        } catch (_) {}


        /* ---------------------------------------------
           PULL REQUESTS
        --------------------------------------------- */

        try {

            const pulls =
                await githubFetch(
                    `${GITHUB_API}/repos/` +
                    `${repo.owner.login}/` +
                    `${repo.name}/pulls` +
                    `?state=all&per_page=100`
                );

            repo.analysis.pullRequests =
                Array.isArray(pulls)
                    ? pulls.length
                    : 0;

        } catch (_) {}


        calculateRepositoryScore(repo);
    }

    /* =========================================================
       TECHNOLOGY DETECTION
    ========================================================= */

    function detectTechnology(repo, readme) {

        const files =
            repo.analysis.files
                .join(" ")
                .toLowerCase();

        const languages =
            repo.analysis.languages
                .join(" ")
                .toLowerCase();

        const text = (
            repo.name +
            " " +
            (repo.description || "") +
            " " +
            readme +
            " " +
            files +
            " " +
            languages
        ).toLowerCase();


        /* FRONTEND */

        if (
            /react|vue|angular|next\.?js|svelte|html|css|tailwind|bootstrap|frontend/
                .test(text)
        ) {
            repo.analysis.frontend = true;
        }


        /* BACKEND */

        if (
            /node\.?js|express|nestjs|django|flask|php|laravel|spring|fastapi|backend|server/
                .test(text)
        ) {
            repo.analysis.backend = true;
        }


        /* DATABASE */

        if (
            /mongodb|mongo|mysql|postgres|postgresql|sqlite|firebase|supabase|redis|database|prisma|mongoose/
                .test(text)
        ) {
            repo.analysis.database = true;
        }


        /* AUTHENTICATION */

        if (
            /authentication|authorization|login|signup|jwt|oauth|passport|session|auth/
                .test(text)
        ) {
            repo.analysis.authentication = true;
        }


        /* DEPLOYMENT */

        if (
            /netlify|vercel|render|railway|heroku|github pages|deployment|deploy/
                .test(text)
        ) {
            repo.analysis.deployment = true;
        }

    }

    /* =========================================================
       REPOSITORY SCORE
    ========================================================= */

    function calculateRepositoryScore(repo) {

        let complexity = 2;

        if (repo.analysis.frontend)
            complexity += 1;

        if (repo.analysis.backend)
            complexity += 2;

        if (repo.analysis.database)
            complexity += 1.5;

        if (repo.analysis.authentication)
            complexity += 0.7;

        if (repo.analysis.contributors > 1)
            complexity += 0.5;

        if (repo.analysis.pullRequests > 0)
            complexity += 0.5;

        complexity =
            Math.min(10, complexity);


        let effort = 3;

        if (repo.size > 100)
            effort += 1;

        if (repo.size > 500)
            effort += 1;

        if (repo.size > 2000)
            effort += 1;

        if (repo.analysis.contributors > 1)
            effort += 0.5;

        if (repo.analysis.pullRequests > 0)
            effort += 0.5;

        effort =
            Math.min(10, effort);


        /*
         * Fork ≠ Clone.
         * Fork only means GitHub marks it as fork.
         */

        let originality =
            repo.fork ? 2 : 5;

        if (repo.analysis.contributors > 1)
            originality += 0.5;

        if (repo.analysis.database)
            originality += 0.5;

        if (repo.analysis.backend)
            originality += 0.5;

        originality =
            Math.min(10, originality);


        repo.analysis.complexity =
            Number(
                complexity.toFixed(1)
            );

        repo.analysis.effort =
            Number(
                effort.toFixed(1)
            );

        repo.analysis.originality =
            Number(
                originality.toFixed(1)
            );


        /* CLASSIFICATION */

        if (complexity >= 7) {

            repo.analysis.classification =
                "strong";

        } else if (complexity >= 5) {

            repo.analysis.classification =
                "medium";

        } else {

            repo.analysis.classification =
                "basic";
        }


        /* OLD PROJECT */

        const updated =
            new Date(repo.updated_at);

        const yearAgo =
            Date.now() -
            365 * 24 * 60 * 60 * 1000;

        repo.analysis.old =
            updated.getTime() < yearAgo;
    }

    /* =========================================================
       DEVELOPER SCORE
    ========================================================= */

    function calculateDeveloperScore() {

        if (!repositories.length) {

            return {
                overall: 0,
                coding: 0,
                quality: 0,
                complexity: 0,
                effort: 0,
                originality: 0,
                github: 0,
                documentation: 0,
                security: 0
            };

        }


        const average = key => {

            const values =
                repositories
                    .map(
                        repo =>
                            Number(
                                repo.analysis?.[key] || 0
                            )
                    )
                    .filter(
                        value => value > 0
                    );

            if (!values.length)
                return 0;

            return values.reduce(
                (a, b) => a + b,
                0
            ) / values.length;
        };


        const complexity =
            average("complexity");

        const effort =
            average("effort");

        const originality =
            average("originality");


        const coding =
            Math.min(
                10,
                4 + complexity * 0.55
            );


        const quality =
            Math.min(
                10,
                4 + complexity * 0.5
            );


        const github =
            Math.min(
                10,
                4 +
                (
                    repositories.filter(
                        repo =>
                            repo.analysis.contributors > 1 ||
                            repo.analysis.pullRequests > 0
                    ).length /
                    repositories.length
                ) * 6
            );


        const documentation =
            Math.min(
                10,
                4 +
                (
                    repositories.filter(
                        repo =>
                            repo.analysis.readme
                    ).length /
                    repositories.length
                ) * 6
            );


        const security =
            Math.min(
                10,
                5 +
                (
                    repositories.filter(
                        repo =>
                            repo.analysis.authentication
                    ).length /
                    repositories.length
                ) * 4
            );


        const overall =
            (
                coding +
                quality +
                complexity +
                effort +
                originality +
                github +
                documentation +
                security
            ) / 8;


        return {
            overall,
            coding,
            quality,
            complexity,
            effort,
            originality,
            github,
            documentation,
            security
        };
    }

    /* =========================================================
       PROFILE RENDER
    ========================================================= */

    function renderProfile() {

        const area =
            document.getElementById(
                "profileArea"
            );

        if (!area || !developer)
            return;


        const name =
            developer.name ||
            developer.login;

        const bio =
            developer.bio ||
            "No public bio provided.";


        area.innerHTML = `

            <div class="profile">

                <img
                    class="avatar"
                    src="${safe(developer.avatar_url)}"
                    alt=""
                >

                <div>

                    <h2>
                        ${escapeHTML(name)}
                    </h2>

                    <p>
                        @${escapeHTML(developer.login)}
                    </p>

                    <a
                        href="${safe(developer.html_url)}"
                        target="_blank"
                        rel="noopener"
                    >
                        View GitHub →
                    </a>

                </div>

            </div>

            <div class="bio">
                ${escapeHTML(bio)}
            </div>

            <div class="stats">

                <div class="stat">
                    <strong>
                        ${developer.public_repos}
                    </strong>
                    <small>Repos</small>
                </div>

                <div class="stat">
                    <strong>
                        ${developer.followers}
                    </strong>
                    <small>Followers</small>
                </div>

                <div class="stat">
                    <strong>
                        ${developer.following}
                    </strong>
                    <small>Following</small>
                </div>

            </div>
        `;
    }

    /* =========================================================
       SCORE RENDER
    ========================================================= */

    function renderDeveloperScore() {

        const score =
            calculateDeveloperScore();

        const number =
            document.querySelector(
                ".score-number"
            );

        const level =
            document.querySelector(
                ".level"
            );

        const metrics =
            document.getElementById(
                "metrics"
            );


        if (number) {

            number.innerHTML =
                `${score.overall.toFixed(1)}
                 <span>/10</span>`;

        }


        if (level) {

            level.textContent =
                getDeveloperLevel(
                    score.overall
                );

        }


        if (!metrics)
            return;


        const list = [

            ["Coding Skill", score.coding],
            ["Code Quality", score.quality],
            ["Complexity", score.complexity],
            ["Development Effort", score.effort],
            ["Originality", score.originality],
            ["Git / GitHub", score.github],
            ["Documentation", score.documentation],
            ["Security", score.security]

        ];


        metrics.innerHTML =
            list.map(
                ([name, value]) => `

                    <div class="metric">

                        <div class="metric-head">

                            <span>
                                ${name}
                            </span>

                            <span>
                                ${value.toFixed(1)}
                            </span>

                        </div>

                        <div class="progress">

                            <i
                                style="
                                    width:${value * 10}%
                                "
                            ></i>

                        </div>

                    </div>

                `
            ).join("");


        updateRepositoryCounters();
    }

    /* =========================================================
       ANALYSIS CHAT
    ========================================================= */

    function renderAnalysis() {

        const container =
            document.getElementById(
                "analysisContent"
            );

        if (!container)
            return;


        const score =
            calculateDeveloperScore();


        const languages = {};


        repositories.forEach(repo => {

            repo.analysis.languages
                .forEach(language => {

                    languages[language] =
                        (languages[language] || 0) + 1;

                });

        });


        const topLanguages =
            Object.entries(languages)
                .sort(
                    (a, b) => b[1] - a[1]
                )
                .slice(0, 10);


        const frontend =
            repositories.filter(
                repo =>
                    repo.analysis.frontend
            ).length;


        const backend =
            repositories.filter(
                repo =>
                    repo.analysis.backend
            ).length;


        const database =
            repositories.filter(
                repo =>
                    repo.analysis.database
            ).length;


        const auth =
            repositories.filter(
                repo =>
                    repo.analysis.authentication
            ).length;


        const deployment =
            repositories.filter(
                repo =>
                    repo.analysis.deployment
            ).length;


        const readme =
            repositories.filter(
                repo =>
                    repo.analysis.readme
            ).length;


        const forks =
            repositories.filter(
                repo => repo.fork
            ).length;


        const old =
            repositories.filter(
                repo => repo.analysis.old
            ).length;


        container.innerHTML = `

            <div class="chat-message">

                <div class="bot">
                    AI
                </div>

                <div class="message">

                    GitHub API से

                    <strong>
                        ${repositories.length}
                    </strong>

                    repositories मिलीं और उनका
                    available public evidence analyze किया गया।

                    <br><br>

                    Rating सिर्फ stars, followers या
                    repository count पर आधारित नहीं है।

                </div>

            </div>


            <div class="analysis-card">

                <div class="card-title">
                    👤 Developer Profile
                </div>

                <div class="evidence-grid">

                    ${evidence(
                        "Name",
                        developer.name ||
                        developer.login
                    )}

                    ${evidence(
                        "Username",
                        "@" + developer.login
                    )}

                    ${evidence(
                        "Public Repositories",
                        developer.public_repos
                    )}

                    ${evidence(
                        "Followers",
                        developer.followers
                    )}

                    ${evidence(
                        "Following",
                        developer.following
                    )}

                    ${evidence(
                        "Account Created",
                        formatDate(
                            developer.created_at
                        )
                    )}

                </div>

            </div>


            <div class="analysis-card">

                <div class="card-title">
                    🧠 Technical Skills Evidence
                </div>

                <div class="evidence-grid">

                    ${
                        topLanguages.length
                        ?
                        topLanguages.map(
                            ([language, count]) =>
                                evidence(
                                    language,
                                    `${count} repositories`,
                                    "ok"
                                )
                        ).join("")
                        :
                        evidence(
                            "Languages",
                            "Not Verifiable",
                            "warn"
                        )
                    }

                </div>

            </div>


            <div class="analysis-card">

                <div class="card-title">
                    🏗️ Architecture Evidence
                </div>

                <div class="evidence-grid">

                    ${evidence(
                        "Frontend",
                        `${frontend} repos`,
                        frontend ? "ok" : "warn"
                    )}

                    ${evidence(
                        "Backend",
                        `${backend} repos`,
                        backend ? "ok" : "warn"
                    )}

                    ${evidence(
                        "Database",
                        `${database} repos`,
                        database ? "ok" : "warn"
                    )}

                    ${evidence(
                        "Authentication",
                        `${auth} repos`,
                        auth ? "ok" : "warn"
                    )}

                    ${evidence(
                        "Deployment",
                        `${deployment} repos`,
                        deployment ? "ok" : "warn"
                    )}

                    ${evidence(
                        "README",
                        `${readme} repos`,
                        readme ? "ok" : "warn"
                    )}

                </div>

            </div>


            <div class="analysis-card">

                <div class="card-title">
                    📊 Repository Classification
                </div>

                <div class="evidence-grid">

                    ${evidence(
                        "Strong Projects",
                        countClass("strong"),
                        "ok"
                    )}

                    ${evidence(
                        "Medium Projects",
                        countClass("medium"),
                        "warn"
                    )}

                    ${evidence(
                        "Basic Projects",
                        countClass("basic")
                    )}

                    ${evidence(
                        "Forks",
                        forks
                    )}

                    ${evidence(
                        "Old / Inactive",
                        old,
                        old ? "warn" : "ok"
                    )}

                    ${evidence(
                        "Active",
                        repositories.length - old,
                        "ok"
                    )}

                </div>

            </div>


            <div class="analysis-card">

                <div class="card-title">
                    🔍 Claim vs Evidence
                </div>

                <div class="claim">

                    Developer या repository description
                    में कोई technology/project claim हो,
                    system उसे repository evidence के साथ
                    compare करेगा।

                    <br><br>

                    <strong>
                        Example:
                    </strong>

                    <br><br>

                    "Full Stack Platform"

                    <br>

                    Frontend:
                    ${
                        frontend
                        ? '<span class="ok">✅ Evidence Found</span>'
                        : '<span class="warn">⚠ Not Verifiable</span>'
                    }

                    <br>

                    Backend:
                    ${
                        backend
                        ? '<span class="ok">✅ Evidence Found</span>'
                        : '<span class="warn">⚠ Not Verifiable</span>'
                    }

                    <br>

                    Database:
                    ${
                        database
                        ? '<span class="ok">✅ Evidence Found</span>'
                        : '<span class="warn">⚠ Not Verifiable</span>'
                    }

                    <br><br>

                    <span class="warn">
                        Keyword detection final proof नहीं है।
                        Actual source-code analysis में
                        stronger evidence required होगा।
                    </span>

                </div>

            </div>


            <div class="analysis-card">

                <div class="card-title">
                    🏆 Final Estimate
                </div>

                <div class="evidence-grid">

                    ${evidence(
                        "Overall",
                        `${score.overall.toFixed(1)}/10`,
                        "ok"
                    )}

                    ${evidence(
                        "Developer Level",
                        getDeveloperLevel(
                            score.overall
                        ),
                        "ok"
                    )}

                    ${evidence(
                        "Repositories",
                        repositories.length
                    )}

                </div>

            </div>


            <div class="chat-message">

                <div class="bot">
                    AI
                </div>

                <div class="message">

                    जहाँ evidence उपलब्ध नहीं है,
                    वहाँ system को अनुमान लगाने के बजाय

                    <strong>
                        Not Verifiable
                    </strong>

                    दिखाना चाहिए।

                </div>

            </div>

        `;
    }

    /* =========================================================
       REPOSITORY RENDER
    ========================================================= */

    function renderRepositories() {

        const list =
            document.getElementById(
                "repoList"
            );

        const counter =
            document.getElementById(
                "repoCount"
            );

        if (!list)
            return;


        const searchInput =
            document.getElementById(
                "repoSearch"
            );


        const search =
            String(
                searchInput?.value || ""
            )
            .toLowerCase()
            .trim();


        const filtered =
            repositories.filter(repo => {

                const text = (

                    repo.name +
                    " " +
                    (repo.description || "") +
                    " " +
                    (repo.language || "") +
                    " " +
                    repo.analysis.languages.join(" ")

                ).toLowerCase();


                const matchesSearch =
                    !search ||
                    text.includes(search);


                let matchesFilter = true;


                if (
                    currentFilter === "strong"
                ) {

                    matchesFilter =
                        repo.analysis.classification ===
                        "strong";

                }


                if (
                    currentFilter === "medium"
                ) {

                    matchesFilter =
                        repo.analysis.classification ===
                        "medium";

                }


                if (
                    currentFilter === "basic"
                ) {

                    matchesFilter =
                        repo.analysis.classification ===
                        "basic";

                }


                if (
                    currentFilter === "fork"
                ) {

                    matchesFilter =
                        repo.fork === true;

                }


                if (
                    currentFilter === "old"
                ) {

                    matchesFilter =
                        repo.analysis.old === true;

                }


                return (
                    matchesSearch &&
                    matchesFilter
                );

            });


        if (counter) {

            counter.textContent =
                `Showing ${filtered.length} of ` +
                `${repositories.length} repositories`;

        }


        if (!filtered.length) {

            list.innerHTML = `
                <div class="empty">
                    No repositories found.
                </div>
            `;

            return;
        }


        list.innerHTML =
            filtered
                .map(
                    repositoryHTML
                )
                .join("");
    }

    /* =========================================================
       REPOSITORY CARD
    ========================================================= */

    function repositoryHTML(repo) {

        const a =
            repo.analysis;


        const classification =
            a.classification;


        const classificationName =
            classification === "strong"
                ? "Strong Project"
                : classification === "medium"
                    ? "Medium Project"
                    : "Basic Project";


        return `

            <article
                class="repo"
                id="repo-${repo.id}"
            >

                <div class="repo-top">

                    <div>

                        <div class="repo-name">

                            📦

                            <a
                                href="${safe(repo.html_url)}"
                                target="_blank"
                                rel="noopener"
                            >
                                ${escapeHTML(repo.name)}
                            </a>

                        </div>

                        <div class="repo-desc">

                            ${
                                escapeHTML(
                                    repo.description ||
                                    "No description provided."
                                )
                            }

                        </div>

                    </div>


                    <div class="repo-badges">

                        <span class="badge">
                            ⭐ ${repo.stargazers_count}
                        </span>

                        <span class="badge">
                            🍴 ${repo.forks_count}
                        </span>

                        <span class="badge">
                            ${
                                escapeHTML(
                                    repo.language ||
                                    "No language"
                                )
                            }
                        </span>

                        <span class="badge">

                            ${
                                repo.fork
                                    ? "🔀 Fork"
                                    : "Original"
                            }

                        </span>

                        <span class="badge">

                            ${
                                a.old
                                    ? "Old"
                                    : "Active"
                            }

                        </span>

                    </div>

                </div>


                <div class="repo-info">

                    ${repoEvidence(
                        "Frontend",
                        a.frontend
                    )}

                    ${repoEvidence(
                        "Backend",
                        a.backend
                    )}

                    ${repoEvidence(
                        "Database",
                        a.database
                    )}

                    ${repoEvidence(
                        "README",
                        a.readme
                    )}

                </div>


                <div class="repo-bottom">

                    <div class="repo-score">

                        <span>
                            Complexity
                            <b>
                                ${a.complexity}/10
                            </b>
                        </span>

                        <span>
                            Effort
                            <b>
                                ${a.effort}/10
                            </b>
                        </span>

                        <span>
                            Originality
                            <b>
                                ${a.originality}/10
                            </b>
                        </span>

                        <span>
                            <b>
                                ${classificationName}
                            </b>
                        </span>

                    </div>


                    <div class="repo-actions">

                        <button
                            onclick="window.githubAnalyzer.toggleRepo(${repo.id})"
                        >
                            Full Analysis
                        </button>

                        <button
                            onclick="window.open(
                                '${safe(repo.html_url)}',
                                '_blank'
                            )"
                        >
                            GitHub
                        </button>

                    </div>

                </div>


                <div
                    class="repo-details"
                    id="details-${repo.id}"
                >

                    <div class="detail-grid">

                        ${detail(
                            "Repository Size",
                            formatSize(repo.size)
                        )}

                        ${detail(
                            "Commits",
                            a.commits
                        )}

                        ${detail(
                            "Contributors",
                            a.contributors
                        )}

                        ${detail(
                            "Issues",
                            a.issues
                        )}

                        ${detail(
                            "Pull Requests",
                            a.pullRequests
                        )}

                        ${detail(
                            "Authentication",
                            a.authentication
                                ? "✓ Evidence Found"
                                : "Not Verifiable",
                            a.authentication
                                ? "ok"
                                : "warn"
                        )}

                        ${detail(
                            "Deployment",
                            a.deployment
                                ? "✓ Evidence Found"
                                : "Not Verifiable",
                            a.deployment
                                ? "ok"
                                : "warn"
                        )}

                        ${detail(
                            "Created",
                            formatDate(
                                repo.created_at
                            )
                        )}

                        ${detail(
                            "Last Updated",
                            formatDate(
                                repo.updated_at
                            )
                        )}

                    </div>


                    <div
                        style="
                            margin-top:12px;
                            color:#9ca8b8;
                            font-size:11px;
                            line-height:1.7;
                        "
                    >

                        <strong
                            style="color:white"
                        >
                            Evidence:
                        </strong>

                        ${
                            a.frontend
                                ? "Frontend signals found. "
                                : "Frontend not verifiable. "
                        }

                        ${
                            a.backend
                                ? "Backend signals found. "
                                : "Backend not verifiable. "
                        }

                        ${
                            a.database
                                ? "Database signals found. "
                                : "Database not verifiable. "
                        }

                        ${
                            repo.fork
                                ? "GitHub marks this repository as a fork. "
                                : "GitHub does not mark this repository as a fork. "
                        }

                        ${
                            a.readme
                                ? "README available."
                                : "README unavailable."
                        }

                    </div>

                </div>

            </article>

        `;
    }

    /* =========================================================
       FILTER
    ========================================================= */

    function setFilter(filter, button) {

        currentFilter = filter;


        document
            .querySelectorAll(".filter")
            .forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );


        if (button) {
            button.classList.add("active");
        }


        renderRepositories();
    }

    /* =========================================================
       TOGGLE REPOSITORY
    ========================================================= */

    function toggleRepo(id) {

        const details =
            document.getElementById(
                `details-${id}`
            );

        if (details) {

            details.classList.toggle(
                "open"
            );

        }
    }

    /* =========================================================
       TAB
    ========================================================= */

    function showTab(tab, button) {

        document
            .querySelectorAll(".tab")
            .forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );


        if (button) {
            button.classList.add("active");
        }


        const analysis =
            document.getElementById(
                "analysis"
            );

        const repo =
            document.getElementById(
                "repositories"
            );


        if (analysis) {

            analysis.style.display =
                tab === "analysis"
                    ? "block"
                    : "none";

        }


        if (repo) {

            repo.style.display =
                tab === "repositories"
                    ? "block"
                    : "none";

        }


        if (
            tab === "repositories"
        ) {

            renderRepositories();

        }

    }

    /* =========================================================
       COUNTERS
    ========================================================= */

    function updateRepositoryCounters() {

        setText(
            "strongCount",
            countClass("strong")
        );

        setText(
            "mediumCount",
            countClass("medium")
        );

        setText(
            "basicCount",
            countClass("basic")
        );
    }


    function countClass(type) {

        return repositories.filter(
            repo =>
                repo.analysis.classification ===
                type
        ).length;
    }

    /* =========================================================
       HELPERS
    ========================================================= */

    function getDeveloperLevel(score) {

        if (score >= 8.5)
            return "EXPERT";

        if (score >= 7)
            return "ADVANCED";

        if (score >= 5)
            return "INTERMEDIATE";

        return "BEGINNER";
    }


    function evidence(
        title,
        value,
        className = ""
    ) {

        return `

            <div class="evidence">

                <small>
                    ${escapeHTML(title)}
                </small>

                <strong
                    class="${className}"
                >
                    ${escapeHTML(value)}
                </strong>

            </div>

        `;
    }


    function repoEvidence(
        title,
        value
    ) {

        return `

            <div>

                <small>
                    ${title}
                </small>

                <strong
                    class="${value ? "ok" : "warn"}"
                >
                    ${
                        value
                            ? "✓ Evidence Found"
                            : "⚠ Not Verifiable"
                    }
                </strong>

            </div>

        `;
    }


    function detail(
        title,
        value,
        className = ""
    ) {

        return `

            <div class="detail">

                <small>
                    ${escapeHTML(title)}
                </small>

                <strong
                    class="${className}"
                >
                    ${escapeHTML(value)}
                </strong>

            </div>

        `;
    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }


    function formatDate(date) {

        if (!date)
            return "Not Verifiable";

        return new Date(date)
            .toLocaleDateString(
                undefined,
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }
            );
    }


    function formatSize(kb) {

        if (!kb)
            return "0 KB";

        if (kb < 1024)
            return `${kb} KB`;

        if (kb < 1024 * 1024)
            return `${(
                kb / 1024
            ).toFixed(1)} MB`;

        return `${(
            kb / 1024 / 1024
        ).toFixed(2)} GB`;
    }


    function decodeBase64(value) {

        const binary =
            atob(
                value.replace(/\s/g, "")
            );

        const bytes =
            Uint8Array.from(
                binary,
                char => char.charCodeAt(0)
            );

        return new TextDecoder(
            "utf-8"
        ).decode(bytes);
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function safe(value) {

        return escapeHTML(
            String(value || "")
        );
    }


    function showLoading() {

        const area =
            document.getElementById(
                "analysisContent"
            );

        if (!area)
            return;


        area.innerHTML = `

            <div class="loading">

                <div class="loader"></div>

                Loading GitHub profile,
                repositories and evidence...

            </div>

        `;

    }


    function showError(message) {

        const area =
            document.getElementById(
                "analysisContent"
            );

        if (!area)
            return;


        area.innerHTML = `

            <div class="error">

                <strong>
                    GitHub Analysis Failed
                </strong>

                <br><br>

                ${escapeHTML(message)}

            </div>

        `;
    }

    /* =========================================================
       GLOBAL API
       Existing HTML onclick handlers ke liye
    ========================================================= */

    window.githubAnalyzer = {

        analyzeDeveloper,
        renderRepositories,
        renderAnalysis,
        renderProfile,
        renderDeveloperScore,
        setFilter,
        showTab,
        toggleRepo

    };


    /*
     * Existing HTML agar direct onclick use karta hai:
     */

    window.analyzeDeveloper =
        analyzeDeveloper;

    window.renderRepositories =
        renderRepositories;

    window.setFilter =
        setFilter;

    window.showTab =
        showTab;

    window.toggleRepo =
        toggleRepo;


    /* =========================================================
       ENTER KEY
    ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const input =
                document.getElementById(
                    "githubUrl"
                );

            if (!input)
                return;


            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        analyzeDeveloper();

                    }

                }
            );

        }
    );

})();