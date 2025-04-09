/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Harman Singh  -  Student ID: 121451231  -  Date: April 9, 2025
 ********************************************************************************/

require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        dialect: 'postgres',
        port: process.env.PGPORT || 5432,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
);

const Sector = sequelize.define("Sector", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sector_name: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false
});

const Project = sequelize.define("Project", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
    sector_id: Sequelize.INTEGER
}, {
    createdAt: false,
    updatedAt: false
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject("Unable to sync the database: " + err));
    });
}

function getAllProjects() {
    return Project.findAll({ include: [Sector] });
}

function getProjectById(id) {
    return Project.findAll({ where: { id }, include: [Sector] })
        .then(data => {
            if (data.length > 0) return data[0];
            else throw new Error("Unable to find requested project");
        });
}

function getProjectsBySector(sector) {
    return Project.findAll({
        include: [Sector],
        where: {
            '$Sector.sector_name$': {
                [Sequelize.Op.iLike]: `%${sector}%`
            }
        }
    })
        .then(data => {
            if (data.length > 0) return data;
            else throw new Error("Unable to find requested projects");
        });
}

function getAllSectors() {
    return Sector.findAll();
}

function addProject(projectData) {
    return Project.create(projectData);
}

function editProject(id, projectData) {
    return Project.update(projectData, {
        where: { id }
    });
}

function deleteProject(id) {
    return Project.destroy({
        where: { id }
    });
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
    getAllSectors,
    addProject,
    editProject,
    deleteProject
};
