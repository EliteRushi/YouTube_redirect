const SHEET_ID = "1G_gk5ec8sLd34kSf549DJJjQGDyYLwR8vZkz1AZyQVM";
const SHEET_GID = "0";

const table = document.getElementById("liveTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

const loading = document.getElementById("loading");
const empty = document.getElementById("empty");


/* ============================================
   LOAD GOOGLE SHEET
============================================ */

function loadSheet() {

    loading.style.display = "flex";
    empty.style.display = "none";

    /*
     * Remove previous Google script
     */
    const oldScript =
        document.getElementById("googleSheetScript");

    if (oldScript) {
        oldScript.remove();
    }


    /*
     * Google Visualization API
     *
     * IMPORTANT:
     * We use GID instead of Sheet1/Sheet2.
     */

    const query =
        encodeURIComponent(
            "select * where A is not null"
        );


    const url =
        "https://docs.google.com/spreadsheets/d/" +
        SHEET_ID +
        "/gviz/tq?" +
        "gid=" +
        SHEET_GID +
        "&tqx=responseHandler:renderTable" +
        "&tq=" +
        query;


    console.log("Loading sheet:", url);


    /*
     * JSONP script
     */

    const script =
        document.createElement("script");

    script.id =
        "googleSheetScript";

    script.src =
        url;


    /*
     * If Google doesn't respond
     */

    script.onerror = function () {

        loading.style.display = "none";

        empty.style.display = "block";

        empty.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>
            Unable to load Google Sheet.
            <br>
            <small>
                Check that the spreadsheet is publicly accessible.
            </small>
        `;

        console.error(
            "Google Sheet could not be loaded."
        );
    };


    document.body.appendChild(script);
}



/* ============================================
   GOOGLE SHEETS CALLBACK
============================================ */

window.renderTable = function (response) {

    console.log("Google Sheet response:", response);


    loading.style.display = "none";


    /*
     * Validate response
     */

    if (
        !response ||
        !response.table
    ) {

        showEmpty(
            "No data received from Google Sheet."
        );

        return;
    }


    const columns =
        response.table.cols || [];

    const rows =
        response.table.rows || [];


    /*
     * Maximum 4 columns
     */

    const columnCount =
        Math.min(columns.length, 4);


    /*
     * Remove completely empty rows
     */

    const activeRows =
        rows.filter(row => {

            if (!row || !row.c) {
                return false;
            }


            return row.c
                .slice(0, columnCount)
                .some(cell => {

                    if (!cell) {
                        return false;
                    }

                    if (
                        cell.v === null ||
                        cell.v === undefined
                    ) {
                        return false;
                    }

                    return String(cell.v)
                        .trim()
                        .length > 0;
                });
        });


    console.log(
        "Active rows:",
        activeRows.length
    );


    /*
     * No active rows
     */

    if (activeRows.length === 0) {

        thead.innerHTML = "";
        tbody.innerHTML = "";

        showEmpty(
            "No active data available."
        );

        resizeTable();

        return;
    }


    empty.style.display = "none";


    /* ========================================
       CREATE HEADER
    ======================================== */

    thead.innerHTML = "";

    const headerRow =
        document.createElement("tr");


    for (
        let i = 0;
        i < columnCount;
        i++
    ) {

        const th =
            document.createElement("th");


        th.textContent =
            columns[i].label ||
            `Column ${i + 1}`;


        headerRow.appendChild(th);
    }


    thead.appendChild(headerRow);



    /* ========================================
       CREATE BODY
    ======================================== */

    tbody.innerHTML = "";


    activeRows.forEach((row, index) => {

        const tr =
            document.createElement("tr");


        tr.classList.add("table-row");


        /*
         * Small animation delay
         */

        tr.style.animationDelay =
            `${index * 50}ms`;


        for (
            let i = 0;
            i < columnCount;
            i++
        ) {

            const td =
                document.createElement("td");


            const cell =
                row.c[i];


            /*
             * Empty cell
             */

            if (
                !cell ||
                cell.v === null ||
                cell.v === undefined
            ) {

                td.textContent = "";

                tr.appendChild(td);

                continue;
            }


            /*
             * Google formatted value
             */

            const value =
                cell.f !== undefined
                    ? cell.f
                    : String(cell.v);


            /*
             * Detect URLs
             */

            if (
                String(cell.v)
                    .startsWith("http://") ||

                String(cell.v)
                    .startsWith("https://")
            ) {

                const link =
                    document.createElement("a");


                link.href =
                    String(cell.v);


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                /*
                 * YouTube link
                 */

                if (
                    String(cell.v)
                        .includes("youtube.com") ||

                    String(cell.v)
                        .includes("youtu.be")
                ) {

                    link.innerHTML =
                        `<i class="fa-brands fa-youtube"></i>
                         Watch`;


                } else {

                    link.innerHTML =
                        `<i class="fa-solid
                         fa-arrow-up-right-from-square"></i>
                         Open`;
                }


                td.appendChild(link);


            } else {

                td.textContent =
                    value;
            }


            tr.appendChild(td);
        }


        tbody.appendChild(tr);
    });


    /*
     * Resize after rendering
     */

    requestAnimationFrame(() => {

        resizeTable();

    });

};



/* ============================================
   EMPTY STATE
============================================ */

function showEmpty(message) {

    loading.style.display = "none";

    empty.style.display = "block";

    empty.innerHTML = `
        <i class="fa-solid fa-circle-info"></i>
        ${message}
    `;
}



/* ============================================
   DYNAMIC HEIGHT
============================================ */

function resizeTable() {

    const wrapper =
        document.querySelector(".table-wrapper");


    if (!wrapper || !table) {
        return;
    }


    /*
     * Get actual table height
     */

    const height =
        table.getBoundingClientRect().height;


    wrapper.style.height =
        `${height}px`;
}



/* ============================================
   REFRESH
============================================ */

/*
 * Refresh every 30 seconds
 */

setInterval(() => {

    loadSheet();

}, 30000);



/* ============================================
   WINDOW RESIZE
============================================ */

window.addEventListener(
    "resize",
    resizeTable
);



/* ============================================
   INITIAL LOAD
============================================ */

loadSheet();
