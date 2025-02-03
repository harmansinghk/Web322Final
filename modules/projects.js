const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            // Fill the projects array by adding sector information to each project
            projectData.forEach(project => {
                const sector = sectorData.find(sector => sector.id === project.sector_id);
                if (sector) {
                    project.sector = sector.sector_name;
                }
                projects.push(project);
            });
            resolve(); // resolve the promise once the data is initialized
        } catch (error) {
            reject("Error initializing data: " + error); // reject in case of any error
        }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) {
            resolve(projects);
        } else {
            reject("No projects found.");
        }
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            resolve(project);
        } else {
            reject("Project not found.");
        }
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const matchedProjects = projects.filter(p =>
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );
        if (matchedProjects.length > 0) {
            resolve(matchedProjects);
        } else {
            reject("No projects found for the given sector.");
        }
    });
}

// Exporting all functions to be used in server.js
module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector
};
