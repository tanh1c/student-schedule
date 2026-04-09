import * as dataService from '../services/dataService.js';

export const searchLecturer = (req, res) => {
    const { id, gv } = req.query;
    const subjectData = dataService.getSubjectData();
    let results = [];

    if (id) {
        const idLower = id.toLowerCase();
        const subject = subjectData.find(s => s.maMonHoc.toLowerCase() === idLower);
        if (subject) {
            const enriched = { ...subject };
            enriched.lichHoc = subject.lichHoc.map(lh => ({
                ...lh,
                ...dataService.searchLecturerInfo(lh.giangVien),
                emailBT: dataService.searchLecturerInfo(lh.giangVienBT).email,
                phoneBT: dataService.searchLecturerInfo(lh.giangVienBT).phone
            }));
            results.push(enriched);
        }
    }

    if (gv) {
        const sourceData = results.length > 0 ? results : subjectData;
        const lecturerResults = [];

        sourceData.forEach(subject => {
            const matchingSchedules = subject.lichHoc.filter(lh =>
                dataService.smartVietnameseMatch(lh.giangVien, gv) ||
                dataService.smartVietnameseMatch(lh.giangVienBT, gv)
            );

            if (matchingSchedules.length > 0) {
                lecturerResults.push({
                    ...subject,
                    lichHoc: matchingSchedules.map(lh => ({
                        ...lh,
                        ...dataService.searchLecturerInfo(lh.giangVien)
                    }))
                });
            }
        });
        results = lecturerResults;
    }
    res.json(results);
};

function detectCampusFromRoom(room) {
    if (!room) return '';
    const roomUpper = room.toUpperCase().trim();
    if (/^[ABC]\d+/.test(roomUpper)) return '1';
    if (/^H\d+/.test(roomUpper)) return '2';
    return '';
}

export const browseSchedule = (req, res) => {
    const { day, tiet, campus, strict } = req.query;
    if (!day) return res.status(400).json({ error: 'Day required' });

    const dayNum = parseInt(day);
    const tietList = tiet ? tiet.split(',').map(Number) : null;
    const strictMode = strict === 'true';

    const results = [];
    dataService.getSubjectData().forEach(subject => {
        subject.lichHoc.forEach(lh => {
            if (!lh.classInfo) return;
            const matches = lh.classInfo.filter(ci => {
                if (ci.dayOfWeek !== dayNum) return false;
                if (tietList) {
                    const overlap = ci.tietHoc.some(t => tietList.includes(t));
                    const all = ci.tietHoc.every(t => tietList.includes(t));
                    if (strictMode ? !all : !overlap) return false;
                }
                if (campus) {
                    const roomCampus = detectCampusFromRoom(ci.phong);
                    if (roomCampus !== campus) return false;
                }
                return true;
            });

            if (matches.length > 0) {
                const info = dataService.searchLecturerInfo(lh.giangVien);
                results.push({
                    maMonHoc: subject.maMonHoc,
                    tenMonHoc: subject.tenMonHoc,
                    group: lh.group,
                    giangVien: lh.giangVien,
                    ...info,
                    classInfo: matches
                });
            }
        });
    });

    results.sort((a, b) => (a.classInfo[0].tietHoc[0] || 0) - (b.classInfo[0].tietHoc[0] || 0));
    res.json(results);
};

export const listLecturers = (req, res) => {
    res.json(dataService.getLecturerData());
};

export const getLecturerInfo = (req, res) => {
    const { gv } = req.query;
    if (gv) res.json(dataService.searchLecturerInfo(gv));
    else res.json(dataService.getLecturerData());
};

export const listSubjects = (req, res) => {
    res.json(dataService.getSubjectData().map(s => ({ id: s.maMonHoc, name: s.tenMonHoc })));
};
