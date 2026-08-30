/* =========================================
   WEBSITE CONFIGURATION
========================================= */

const CONFIG = {

    // Your YouTube channel
    channelId: "UCpA9hsXa8In1rRix9eGrJoQ",

    // Your Cloudflare Worker URL
    apiEndpoint:
        "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev",

    // Check every 60 seconds
    refreshInterval: 60000

};


/* =========================================
   SOCIAL MEDIA LINKS
========================================= */

const SOCIAL_LINKS = {

    youtube: "",

    instagram: "",

    facebook: "",

    whatsapp: "",

    telegram: "",

    linkedin: "",

    x: "",

    pinterest: ""

};


/* =========================================
   ELEMENTS
========================================= */

const statusElement =
    document.getElementById("status");

const mainTitle =
    document.getElementById("mainTitle");

const channelName =
    document.getElementById("channelName");

const thumbnail =
    document.getElementById("thumbnail");

const liveOverlay =
    document.getElementById("liveOverlay");

const videoTitle =
    document.getElementById("videoTitle");

const description =
    document.getElementById("description");

const viewers =
    document.getElementById("viewers");

const date =
    document.getElementById("date");

const watchButton =
    document.getElementById("watchButton");

const buttonText =
    document.getElementById("buttonText");

const videoCard =
    document.getElementById("videoCard");

const lastUpdated =
    document.getElementById("lastUpdated");


/* =========================================
   SOCIAL LINKS
========================================= */

function setupSocialLinks() {

    for (const platform in SOCIAL_LINKS) {

        const element =
            document.getElementById(
                platform + "Link"
            );

        if (!element) continue;

        const url =
            SOCIAL_LINKS[platform];

        if (url && url.trim() !== "") {

            element.href = url;

            element.classList.remove(
                "disabled"
            );

        } else {

            element.removeAttribute("href");

            element.classList.add(
                "disabled"
            );
        }
    }
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    return new Date(dateString)
        .toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
}


/* =========================================
   FORMAT VIEWERS
========================================= */

function formatViewers(number) {

    if (
        number === undefined ||
        number === null
    ) {
        return "—";
    }

    return Number(number)
        .toLocaleString();
}


/* =========================================
   LOAD YOUTUBE DATA
========================================= */

async function loadYouTubeData() {

    try {

        statusElement.classList.remove(
            "live"
        );

        statusElement.innerHTML =
            `<span class="status-dot"></span>
             CHECKING STATUS...`;


        const response =
            await fetch(
                `${CONFIG.apiEndpoint}?channelId=${encodeURIComponent(CONFIG.channelId)}`
            );


        if (!response.ok) {

            throw new Error(
                "API request failed"
            );

        }


        const data =
            await response.json();


        if (data.error) {

            throw new Error(
                data.error
            );

        }


        /* =================================
           UPDATE CHANNEL
        ================================= */

        channelName.textContent =
            data.channel?.title ||
            "YouTube Channel";


        /* =================================
           LIVE
        ================================= */

        if (data.live) {

            const video =
                data.live;


            statusElement.classList.add(
                "live"
            );

            statusElement.innerHTML =
                `<span class="status-dot"></span>
                 LIVE NOW`;


            mainTitle.textContent =
                "We Are Live!";


            thumbnail.src =
                video.thumbnail;


            videoTitle.textContent =
                video.title;


            description.textContent =
                video.description ||
                "No description available.";


            viewers.innerHTML =
                `<i class="fa-solid fa-eye"></i>
                 ${formatViewers(
                     video.viewers
                 )} viewers`;


            date.innerHTML =
                `<i class="fa-regular fa-clock"></i>
                 Started ${formatDate(
                     video.publishedAt
                 )}`;


            liveOverlay.classList.add(
                "active"
            );


            buttonText.textContent =
                "WATCH LIVE";


            /* Clicking live → actual video */

            const liveUrl =
                `https://www.youtube.com/watch?v=${video.id}`;


            watchButton.onclick = () => {

                window.open(
                    liveUrl,
                    "_blank"
                );

            };


            videoCard.onclick = () => {

                window.open(
                    liveUrl,
                    "_blank"
                );

            };


        }

        /* =================================
           OFFLINE
        ================================= */

        else {

            const video =
                data.latest;


            statusElement.classList.remove(
                "live"
            );

            statusElement.innerHTML =
                `<span class="status-dot"></span>
                 OFFLINE`;


            mainTitle.textContent =
                "Latest Update";


            liveOverlay.classList.remove(
                "active"
            );


            if (video) {

                thumbnail.src =
                    video.thumbnail;


                videoTitle.textContent =
                    video.title;


                description.textContent =
                    video.description ||
                    "No description available.";


                date.innerHTML =
                    `<i class="fa-regular fa-calendar"></i>
                     ${formatDate(
                         video.publishedAt
                     )}`;


            } else {

                thumbnail.src =
                    "https://via.placeholder.com/1280x720?text=No+Video";

                videoTitle.textContent =
                    "No videos available";

                description.textContent =
                    "No recent video was found.";

                date.innerHTML =
                    `<i class="fa-regular fa-calendar"></i>
                     —`;
            }


            viewers.innerHTML =
                `<i class="fa-solid fa-circle"></i>
                 Channel Offline`;


            buttonText.textContent =
                "VISIT CHANNEL";


            /*
                IMPORTANT:
                When offline, clicking the card
                goes to the CHANNEL HOME PAGE.
            */

            const channelUrl =
                `https://www.youtube.com/channel/${CONFIG.channelId}`;


            watchButton.onclick = () => {

                window.open(
                    channelUrl,
                    "_blank"
                );

            };


            videoCard.onclick = () => {

                window.open(
                    channelUrl,
                    "_blank"
                );

            };

        }


        lastUpdated.textContent =
            "Last updated: " +
            new Date().toLocaleTimeString();


    }

    catch (error) {

        console.error(error);


        statusElement.classList.remove(
            "live"
        );

        statusElement.innerHTML =
            `<span class="status-dot"></span>
             ERROR`;


        mainTitle.textContent =
            "Unable to retrieve YouTube information";


        channelName.textContent =
            "Please try again later.";


        videoTitle.textContent =
            "YouTube connection error";


        description.textContent =
            "The website could not retrieve information from YouTube right now.";


        viewers.innerHTML =
            `<i class="fa-solid fa-triangle-exclamation"></i>
             Error`;


        date.innerHTML =
            `<i class="fa-regular fa-calendar"></i>
             —`;

    }

}


/* =========================================
   START
========================================= */

document.getElementById("year")
    .textContent =
    new Date().getFullYear();


setupSocialLinks();

loadYouTubeData();


/* =========================================
   AUTOMATIC REFRESH
========================================= */

setInterval(
    loadYouTubeData,
    CONFIG.refreshInterval
);
