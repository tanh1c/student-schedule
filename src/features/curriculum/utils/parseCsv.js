export function parseCsv(csvText) {
    const lines = csvText.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const result = [];

    for (let i = 0; i < lines.length; i += 1) {
        const row = [];
        let current = "";
        let inQuotes = false;
        const line = lines[i];

        for (let j = 0; j < line.length; j += 1) {
            const char = line[j];
            if (char === "\"") {
                inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
                row.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }

        row.push(current.trim());
        result.push(row);
    }

    return result;
}
