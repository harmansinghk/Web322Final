/********************************************************************************
*  WEB322 – Assignment 06 
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
const clientSessions = require("client-sessions");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv");
dotenv.config();

const authData = require("./modules/auth-service");
const projectService = require("./projects");

const app = express();
const PORT = process.env.PORT || 5442;

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout"); // default layout

// Static & Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET || "assignment6_secret",
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Ensure login
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// Routes
app.get("/", (req, res) => {
    res.render("home", { page: "/", title: "Home | Climate Solutions" });
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about", title: "About | Climate Solutions" });
});

app.get("/solutions/projects", async (req, res) => {
    try {
        const sector = req.query.sector;
        const data = sector
            ? await projectService.getProjectsBySector(sector)
            : await projectService.getAllProjects();

        res.render("projects", {
            page: "/solutions/projects",
            title: "Projects | Climate Solutions",
            projects: data,
            student: "Harman Singh",
            id: "121451231",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(404).render("404", {
            page: "",
            title: "404 | Climate Solutions",
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
            title: `${project.title} | Climate Solutions`,
            project,
            student: "Harman Singh",
            id: "121451231",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(404).render("404", {
            page: "",
            title: "404 | Climate Solutions",
            message: err.message,
            student: "Harman Singh",
            id: "121451231",
            timestamp: new Date().toISOString()
        });
    }
});

app.get("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
        const sectors = await projectService.getAllSectors();
        res.render("addProject", {
            page: "/solutions/addProject",
            title: "Add Project",
            sectors
        });
    } catch (err) {
        res.render("500", { message: err.message, title: "500 | Climate Solutions" });
    }
});

app.post("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
        await projectService.addProject(req.body);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}`, title: "500 | Climate Solutions" });
    }
});

app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        const sectors = await projectService.getAllSectors();
        res.render("editProject", {
            title: `Edit: ${project.title}`,
            page: "",
            project,
            sectors
        });
    } catch (err) {
        res.status(404).render("404", { message: err.message, title: "404 | Climate Solutions" });
    }
});

app.post("/solutions/editProject", ensureLogin, async (req, res) => {
    try {
        await projectService.editProject(req.body.id, req.body);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}`, title: "500 | Climate Solutions" });
    }
});

app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
    try {
        await projectService.deleteProject(req.params.id);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}`, title: "500 | Climate Solutions" });
    }
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory", { title: "User History | Climate Solutions", page: "/userHistory" });
});

app.post("/post-request", (req, res) => {
    res.json({
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString(),
        body: req.body
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        title: "Login | Climate Solutions",
        page: "/login",
        errorMessage: "",
        userName: ""
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        title: "Register | Climate Solutions",
        page: "/register",
        errorMessage: "",
        successMessage: "",
        userName: ""
    });
});

app.post("/register", async (req, res) => {
    try {
        await authData.registerUser(req.body);
        res.render("register", {
            title: "Register | Climate Solutions",
            page: "/register",
            successMessage: "User created",
            errorMessage: "",
            userName: ""
        });
    } catch (err) {
        res.render("register", {
            title: "Register | Climate Solutions",
            page: "/register",
            successMessage: "",
            errorMessage: err,
            userName: req.body.userName
        });
    }
});

app.post("/login", async (req, res) => {
    req.body.userAgent = req.get("User-Agent");
    try {
        const user = await authData.checkUser(req.body);
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect("/solutions/projects");
    } catch (err) {
        res.render("login", {
            title: "Login | Climate Solutions",
            page: "/login",
            errorMessage: err,
            userName: req.body.userName
        });
    }
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.use((req, res) => {
    res.status(404).render("404", {
        page: "",
        title: "404 | Climate Solutions",
        message: "Page not found.",
        student: "Harman Singh",
        id: "121451231",
        timestamp: new Date().toISOString()
    });
});


if (require.main === module) {
    projectService.initialize()
        .then(authData.initialize)
        .then(() => {
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        })
        .catch((err) => {
            console.error("Unable to start server:", err);
        });
}

module.exports = app;