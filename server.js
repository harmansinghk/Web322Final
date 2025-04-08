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
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Load project data
const projects = require("./data/projectData.json");

function getAllProjects() {
    return projects;
}

function getProjectById(id) {
    return projects.find((p) => p.id == id);
}

// Routes
app.get("/", (req, res) => {
    res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

app.get("/solutions/projects", (req, res) => {
    const sector = req.query.sector;
    let filtered = getAllProjects();

    if (sector) {
        filtered = filtered.filter((p) =>
            p.sector && p.sector.toLowerCase() === sector.toLowerCase()
        );
        if (filtered.length === 0) {
            return res.status(404).render("404", {
                page: "",
                message: `No projects found for sector: ${sector}`,
                student: "Harman Singh",
                id: "121451231",
                timestamp: new Date().toISOString(),
            });
        }
    }

    res.render("projects", {
        page: "/solutions/projects",
        projects: filtered,
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString(),
    });
});

app.get("/solutions/projects/:id", (req, res) => {
    const project = getProjectById(req.params.id);

    if (!project) {
        return res.status(404).render("404", {
            page: "",
            message: `No project found with ID: ${req.params.id}`,
            student: "Harman Singh",
            id: "121451231",
            timestamp: new Date().toISOString(),
        });
    }

    res.render("project", {
        page: "",
        project,
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString(),
    });
});

app.post("/post-request", (req, res) => {
    res.json({
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString(),
        body: req.body,
    });
});

// 404 route (keep last)
app.use((req, res) => {
    res.status(404).render("404", {
        page: "",
        message: "Page not found.",
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString(),
    });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
