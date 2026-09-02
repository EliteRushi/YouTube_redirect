const SHEET_ID =
    "2PACX-1vQH6Qkk4XLwAkpB5GTw-uCyp7IjaU1hl4G2TtIYQq9DMHliTmPmhCJSSbl1VF2OGvGCgK30a1OrI4lK";

const SHEET_NAME = "Sheet1";

const table = document.getElementById("liveTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

const loading = document.getElementById("loading");
const empty = document.getElementById("empty");


/* --------------------------------
   Load Google Sheet
-------------------------------- */

function loadSheet() {

    const oldScript = document.getElementById("googleSheetScript");

    if (oldScript) {
        oldScript.remove();
    }

    const script = document.createElement("script");

    script.id = "googleSheetScript";

    const query = encodeURIComponent(
        "select * where A is not null"
    );

    script.src =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
        `sheet=${encodeURIComponent(SHEET_NAME)}` +
        `&tq=${query}` +
        `&headers=1` +
        `&callback=renderTable`;

    document.body.appendChild(script);
}


/* --------------------------------
   Google Visualization callback
-------------------------------- */

function renderTable(response) {

    loading.style.display = "none";

    if (
        !response ||
        !response.table ||
        !response.table.rows ||
        response.table.rows.length === 0
    ) {
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    const columns = response.table.cols;

    const rows = response.table.rows;

    /*
        Only use the first 4 columns.

        Change 4 to 3 if you want exactly
        3 columns.
    */

    const columnCount = Math.min(columns.length, 4);


    /* --------------------------------
       Create table header
    -------------------------------- */

    thead.innerHTML = "";

    const headerRow = document.createElement("tr");

    for (let i = 0; i < columnCount; i++) {

        const th = document.createElement("th");

        th.textContent =
            columns[i].label ||
            `Column ${i + 1}`;

        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);


    /* --------------------------------
       Create table body
    -------------------------------- */

    tbody.innerHTML = "";

    rows.forEach(row => {

        const tr = document.createElement("tr");

        for (let i = 0; i < columnCount; i++) {

            const td = document.createElement("td");

            const cell = row.c[i];

            if (!cell || cell.v === null || cell.v === undefined) {
                td.textContent = "";
            } else {

                /*
                    If the cell contains a URL,
                    make it clickable.
                */

                const value = String(cell.v);

                if (
                    value.startsWith("http://") ||
                    value.startsWith("https://")
                ) {

                    const link = document.createElement("a");

                    link.href = value;

                    link.target = "_blank";

                    link.rel = "noopener noreferrer";

                    link.textContent = "Open";

                    td.appendChild(link);

                } else {

                    td.textContent = cell.f || value;

                }
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);

    });


    /*
        Dynamically resize the table
        based on the number of rows.
    */

    resizeTable();
}


/* --------------------------------
   Dynamic height
-------------------------------- */

function resizeTable() {

    const wrapper =
        document.querySelector(".table-wrapper");

    const tableHeight =
        table.offsetHeight;

    wrapper.style.height =
        `${tableHeight}px`;
}


/* --------------------------------
   Automatically refresh
-------------------------------- */

/*
    Refresh every 30 seconds.

    Change 30000 to another value if
    you want a different refresh rate.
*/

setInterval(() => {

    loading.style.display = "flex";

    loadSheet();

}, 30000);


/* --------------------------------
   Initial load
-------------------------------- */

loadSheet();


/* --------------------------------
   Resize when browser changes size
-------------------------------- */

window.addEventListener(
    "resize",
    resizeTable
);
