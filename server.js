const express = require("express");
const app = express();
const projectData = require("./modules/projects");

// Test route to confirm the server is working
app.get("/", (req, res) => {
    res.send("Assignment 2: Harman Singh - 121451231"); 
});

// Route to get all projects
app.get("/solutions/projects", (req, res) => {
    projectData.getAllProjects()
        .then(projects => {
            res.json({
                student_name: "Harman Singh", 
                student_id: "121451231",    
                timestamp: new Date(),
                projects
            });
        })
        .catch(error => {
            res.status(500).send("Error fetching projects: " + error);
        });
});

// Route to get a project by ID
app.get("/solutions/projects/id-demo", (req, res) => {
    projectData.getProjectById(18)  // Replace with a valid project ID
        .then(project => {
            res.json({
                student_name: "Harman Singh", 
                student_id: "121451231",    
                timestamp: new Date(),
                project
            });
        })
        .catch(error => {
            res.status(404).send("Project not found: " + error);
        });
});

// Route to get projects by sector
app.get("/solutions/projects/sector-demo", (req, res) => {
    projectData.getProjectsBySector("agriculture")  
        .then(projects => {
            res.json({
                student_name: "Harman Singh", 
                student_id: "121451231",   
                timestamp: new Date(),
                projects
            });
        })
        .catch(error => {
            res.status(500).send("Error fetching projects by sector: " + error);
        });
});

// Initialize projects before starting server
projectData.initialize()
    .then(() => {
        console.log("Initialization successful.");
        app.listen(3000, () => {
            console.log("Server is running on port 3000.");
        });
    })
    .catch(error => {
        console.error("Error initializing data:", error);
    });
