/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Harman Singh Student ID: 121451231 Date: April 7, 2025
*  Published URL: https://web322-final.vercel.app
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const data = require("/modules/projectData.json");
const sectors = require("/modules/sectorData.json");

app.use(express.static("public"));
app.use(express.json()); // for POST request body parsing

// Helpers
const addMeta = (resData) => {
    return {
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString(),
        data: resData,
    };
};

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

// About Page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

// All or filtered projects
app.get("/solutions/projects", (req, res) => {
    try {
        const { sector } = req.query;
        let filtered = data;

        if (sector) {
            const matchedSector = sectors.find(
                (s) => s.sector_name.toLowerCase() === sector.toLowerCase()
            );
            if (!matchedSector) throw new Error("Sector not found");
            filtered = data.filter((p) => p.sector_id === matchedSector.id);
        }

        res.json(addMeta(filtered));
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// Project by ID
app.get("/solutions/projects/:id", (req, res) => {
    try {
        const project = data.find(
            (proj) => proj.id.toString() === req.params.id
        );
        if (!project) throw new Error("Project not found");
        res.json(addMeta(project));
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// POST Request handler
app.post("/post-request", (req, res) => {
    res.json({
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString(),
        body: req.body,
    });
});

// 404 fallback
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});

// Local server (optional for testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});