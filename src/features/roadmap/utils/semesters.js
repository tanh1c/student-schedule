export function createEmptySemester(index) {
    return {
        id: Date.now() + index,
        name: `HK ${index + 1}`,
        year: index < 3 ? "K25" : "",
        note: "",
        courses: []
    };
}
