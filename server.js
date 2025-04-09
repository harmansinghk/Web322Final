/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Harman Singh Student ID: 121451231 Date: April 9, 2025
*  Published URL: https://web322-final.vercel.app
********************************************************************************/

const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5442;

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS view engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Project module
const projectService = require("./modules/projects");

// Initialize DB
projectService.initialize().then(() => {

    app.get("/", (req, res) => {
        res.render("home", { page: "/" });
    });

    app.get("/about", (req, res) => {
        res.render("about", { page: "/about" });
    });

    app.get("/solutions/projects", async (req, res) => {
        try {
            const sector = req.query.sector;
            const data = sector
                ? await projectService.getProjectsBySector(sector)
                : await projectService.getAllProjects();

            res.render("projects", {
                page: "/solutions/projects",
                projects: data,
                student: "Harman Singh",
                id: "121451231",
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            res.status(404).render("404", {
                page: "",
                message: err.message,
                student: "Harman Singh",
                id: "121451231",
                timestamp: new Date().toISOString()
            });
        }
    });

    app.get("/solutions/projects/:id", async (req, res) => {
        try {
            const project = await projectService.getProjectById(req.params.id);
            res.render("project", {
                page: "",
                project,
                student: "Harman Singh",
                id: "121451231",
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            res.status(404).render("404", {
                page: "",
                message: err.message,
                student: "Harman Singh",
                id: "121451231",
                timestamp: new Date().toISOString()
            });
        }
    });

    app.get("/solutions/addProject", async (req, res) => {
        try {
            const sectors = await projectService.getAllSectors();
            res.render("addProject", { sectors });
        } catch (err) {
            res.render("500", { message: err.message });
        }
    });

    app.post("/solutions/addProject", async (req, res) => {
        try {
            await projectService.addProject(req.body);
            res.redirect("/solutions/projects");
        } catch (err) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        }
    });

    app.get("/solutions/editProject/:id", async (req, res) => {
        try {
            const project = await projectService.getProjectById(req.params.id);
            const sectors = await projectService.getAllSectors();
            res.render("editProject", { project, sectors });
        } catch (err) {
            res.status(404).render("404", { message: err.message });
        }
    });

    app.post("/solutions/editProject", async (req, res) => {
        try {
            await projectService.editProject(req.body.id, req.body);
            res.redirect("/solutions/projects");
        } catch (err) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        }
    });

    app.get("/solutions/deleteProject/:id", async (req, res) => {
        try {
            await projectService.deleteProject(req.params.id);
            res.redirect("/solutions/projects");
        } catch (err) {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        }
    });

    app.post("/post-request", (req, res) => {
        res.json({
            student: "Harman Singh",
            id: "121451231",
            timestamp: new Date().toISOString(),
            body: req.body
        });
    });

    app.use((req, res) => {
        res.status(404).render("404", {
            page: "",
            message: "Page not found.",
            student: "Harman Singh",
            id: "121451231",
            timestamp: new Date().toISOString()
        });
    });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

}).catch((err) => {
    console.error("Failed to initialize the database:", err);
});