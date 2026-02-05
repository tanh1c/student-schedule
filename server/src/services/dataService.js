import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '../../');

let subjectData = null;
let lecturerData = null;

function loadData() {
    try {
        // Load Subject Data
        const subjectPath = path.join(PKG_ROOT, 'data_subject.json');
        if (fs.existsSync(subjectPath)) {
            subjectData = JSON.parse(fs.readFileSync(subjectPath, 'utf8'));
        } else {
            subjectData = [];
        }

        // Load Lecturer Data
        const lecturerPath = path.join(PKG_ROOT, 'data_lecturer.json');
        if (fs.existsSync(lecturerPath)) {
            lecturerData = JSON.parse(fs.readFileSync(lecturerPath, 'utf8'));
        } else {
            lecturerData = [];
        }

    } catch (e) {
        logger.error('[DATA] Error loading data:', e);
        subjectData = subjectData || [];
        lecturerData = lecturerData || [];
    }
}

// Ensure data is loaded
loadData();

export function getSubjectData() {
    return subjectData;
}

export function getLecturerData() {
    return lecturerData;
}

// Helper: Remove Vietnamese accents
function removeVietnameseAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

/**
 * Smart Vietnamese search
 */
export function smartVietnameseMatch(text, query) {
    if (!text || !query) return false;

    const textNorm = removeVietnameseAccents(text);
    const queryNorm = removeVietnameseAccents(query.trim());
    if (!queryNorm) return false;

    if (textNorm.includes(queryNorm)) return true;

    const words = textNorm.split(/\s+/);
    const acronym = words.map(w => w[0] || '').join('');
    if (acronym.includes(queryNorm)) return true;

    const queryWords = queryNorm.split(/\s+/);
    const allWordsMatch = queryWords.every(qw => words.some(w => w.startsWith(qw)));
    if (allWordsMatch && queryWords.length > 0) return true;

    // Phonetic matching
    const phoneticMappings = [
        ['z', 'd'], ['gi', 'd'], ['r', 'z'],
        ['k', 'c'], ['q', 'k'],
        ['f', 'ph'], ['ph', 'f'],
        ['kh', 'h'],
    ];

    let phoneticQuery = queryNorm;
    for (const [from, to] of phoneticMappings) {
        phoneticQuery = phoneticQuery.replace(new RegExp(from, 'g'), to);
    }

    if (phoneticQuery !== queryNorm && textNorm.includes(phoneticQuery)) return true;

    return false;
}

export function searchLecturerInfo(name) {
    const nameNorm = removeVietnameseAccents(name);
    for (const lecturer of lecturerData) {
        if (removeVietnameseAccents(lecturer.name) === nameNorm) {
            return lecturer;
        }
    }
    return { name, phone: '', email: '' };
}
