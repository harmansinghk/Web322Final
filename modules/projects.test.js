const projects = require("../data/projectData.json");

function getAllProjects() {
    return projects;
}

function getProjectById(id) {
    return projects.find((p) => p.id == id);
}

describe("Project Functions", () => {
    test("should return all projects", () => {
        const all = getAllProjects();
        expect(Array.isArray(all)).toBe(true);
        expect(all.length).toBeGreaterThan(0);
    });

    test("should return correct project by ID", () => {
        const project = getProjectById(1); // or use a known ID
        expect(project).toHaveProperty("id", 1);
    });

    test("should return undefined for non-existing ID", () => {
        const project = getProjectById(9999);
        expect(project).toBeUndefined();
    });
});

afterAll(() => {
    console.log("Student: Harman Singh | ID: 121451231");
});
