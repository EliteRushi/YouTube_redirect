const SHEET_ID = "1G_gk5ec8sLd34kSf549DJJjQGDyYLwR8vZkz1AZyQVM";

// Change this if your tab has a different name
const SHEET_NAME = "Sheet1";

const table = document.getElementById("liveTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

const loading = document.getElementById("loading");
const empty = document.getElementById("empty");


/* ==========================================
   LOAD GOOGLE SHEET
========================================== */

function loadSheet() {

    loading.style.display = "flex";
    empty.style.display = "none";

    const oldScript = document.getElementById("googleSheetScript");

    if (oldScript) {
        oldScript.remove();
    }

    const script = document.createElement("script");

    script.id = "googleSheetScript";

    /*
        Get all rows where column A
        contains data.
    */

    const query = encodeURIComponent(
        "select * where A is not null"
    );

    script.src =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
        `sheet=${encodeURIComponent(SHEET_NAME)}` +
        `&tq=${query}` +
        `&headers=1` +
        `&callback=renderTable`;

    script.onerror = function () {

        loading.style.display = "none";

        empty.style.display = "block";

        empty.textContent =
            "Unable to load the Google Sheet.";

    };

    document.body.appendChild(script);
}


/* ==========================================
   GOOGLE SHEETS CALLBACK
========================================== */

function renderTable(response) {

    loading.style.display = "none";

    if (
        !response ||
        !response.table ||
        !response.table.rows
    ) {

        empty.style.display = "block";

        empty.textContent =
            "No data found.";

        return;
    }


    const columns = response.table.cols;

    const rows = response.table.rows;


    /* ======================================
       LIMIT TABLE TO 4 COLUMNS
    ====================================== */

    const columnCount = Math.min(
        columns.length,
        4
    );


    /* ======================================
       REMOVE COMPLETELY EMPTY ROWS
    ====================================== */

    const activeRows = rows.filter(row => {

        if (!row.c) {
            return false;
        }

        return row.c
            .slice(0, columnCount)
            .some(cell =>
                cell &&
                cell.v !== null &&
                cell.v !== undefined &&
                String(cell.v).trim() !== ""
            );
    });


    /* ======================================
       NO ACTIVE DATA
    ====================================== */

    if (activeRows.length === 0) {

        thead.innerHTML = "";

        tbody.innerHTML = "";

        empty.style.display = "block";

        empty.textContent =
            "No active data available.";

        resizeTable();

        return;
    }


    empty.style.display = "none";


    /* ======================================
       CREATE TABLE HEADER
    ====================================== */

    thead.innerHTML = "";

    const headerRow =
        document.createElement("tr");


    for (let i = 0; i < columnCount; i++) {

        const th =
            document.createElement("th");

        th.textContent =
            columns[i].label ||
            `Column ${i + 1}`;

        headerRow.appendChild(th);
    }


    thead.appendChild(headerRow);


    /* ======================================
       CREATE TABLE BODY
    ====================================== */

    tbody.innerHTML = "";


    activeRows.forEach((row, rowIndex) => {

        const tr =
            document.createElement("tr");


        /*
            Add row number as a data attribute.
        */

        tr.dataset.row = rowIndex + 1;


        for (let i = 0; i < columnCount; i++) {

            const td =
                document.createElement("td");

            const cell = row.c[i];


            /* Empty cell */

            if (
                !cell ||
                cell.v === null ||
                cell.v === undefined
            ) {

                td.textContent = "";

            } else {

                const value =
                    String(cell.v);

                const formattedValue =
                    cell.f || value;


                /*
                    Detect YouTube / website URLs
                */

                if (
                    value.startsWith("https://") ||
                    value.startsWith("http://")
                ) {

                    const link =
                        document.createElement("a");

                    link.href = value;

                    link.target = "_blank";

                    link.rel =
                        "noopener noreferrer";

                    /*
                        YouTube links get a
                        special label.
                    */

                    if (
                        value.includes("youtube.com") ||
                        value.includes("youtu.be")
                    ) {

                        link.innerHTML =
                            '<i class="fa-brands fa-youtube"></i> Watch';

                    } else {

                        link.innerHTML =
                            '<i class="fa-solid fa-arrow-up-right-from-square"></i> Open';

                    }

                    td.appendChild(link);

                } else {

                    td.textContent =
                        formattedValue;
                }
            }


            tr.appendChild(td);
        }


        tbody.appendChild(tr);

    });


    /* ======================================
       UPDATE TABLE HEIGHT
    ====================================== */

    resizeTable();
}


/* ==========================================
   DYNAMIC TABLE HEIGHT
========================================== */

function resizeTable() {

    const wrapper =
        document.querySelector(".table-wrapper");


    if (!wrapper || !table) {
        return;
    }


    /*
        Calculate actual table height.

        This automatically increases when
        rows are added and decreases when
        rows disappear.
    */

    const height =
        table.getBoundingClientRect().height;


    wrapper.style.height =
        `${height}px`;
}


/* ==========================================
   AUTO REFRESH
========================================== */

/*
    Refresh every 30 seconds.

    30000 = 30 seconds
*/

setInterval(() => {

    loadSheet();

}, 30000);


/* ==========================================
   WINDOW RESIZE
========================================== */

window.addEventListener(
    "resize",
    resizeTable
);


/* ==========================================
   INITIAL LOAD
========================================== */

loadSheet();
