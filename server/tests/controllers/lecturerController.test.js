import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Define mocks BEFORE importing the module under test
jest.unstable_mockModule('../../src/services/dataService.js', () => ({
    getSubjectData: jest.fn(),
    getLecturerData: jest.fn(),
    smartVietnameseMatch: jest.fn(),
    searchLecturerInfo: jest.fn()
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn()
    }
}));

// Import modules dynamically after mocking
const dataService = await import('../../src/services/dataService.js');
const lecturerController = await import('../../src/controllers/lecturerController.js');

describe('lecturerController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('searchLecturer', () => {
        const mockSubjectData = [
            {
                maMonHoc: 'MT1003',
                tenMonHoc: 'Toán cao cấp 1',
                lichHoc: [
                    {
                        group: 'L01',
                        giangVien: 'Nguyen Van A',
                        giangVienBT: 'Tran Thi B'
                    }
                ]
            }
        ];

        beforeEach(() => {
            dataService.getSubjectData.mockReturnValue(mockSubjectData);
            dataService.searchLecturerInfo.mockImplementation((name) => ({
                name,
                email: `${name}@hcmut.edu.vn`,
                phone: '0123456789'
            }));
        });

        it('should search by subject id', () => {
            req.query = { id: 'MT1003' };

            lecturerController.searchLecturer(req, res);

            expect(res.json).toHaveBeenCalled();
            const result = res.json.mock.calls[0][0];
            expect(result).toHaveLength(1);
            expect(result[0].maMonHoc).toBe('MT1003');
        });

        it('should search by lecturer name', () => {
            req.query = { gv: 'Nguyen Van A' };
            dataService.smartVietnameseMatch.mockReturnValue(true);

            lecturerController.searchLecturer(req, res);

            expect(res.json).toHaveBeenCalled();
            const result = res.json.mock.calls[0][0];
            expect(result.length).toBeGreaterThan(0);
        });

        it('should return empty array if no match found', () => {
            req.query = { id: 'NONEXISTENT' };

            lecturerController.searchLecturer(req, res);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should enrich lecturer info with email and phone', () => {
            req.query = { id: 'MT1003' };

            lecturerController.searchLecturer(req, res);

            const result = res.json.mock.calls[0][0];
            expect(result[0].lichHoc[0]).toHaveProperty('email');
            expect(result[0].lichHoc[0]).toHaveProperty('phone');
        });
    });

    describe('browseSchedule', () => {
        const mockSubjectData = [
            {
                maMonHoc: 'MT1003',
                tenMonHoc: 'Toán cao cấp 1',
                lichHoc: [
                    {
                        group: 'L01',
                        giangVien: 'Nguyen Van A',
                        classInfo: [
                            {
                                dayOfWeek: 2,
                                tietHoc: [1, 2, 3],
                                phong: 'A101'
                            }
                        ]
                    }
                ]
            }
        ];

        beforeEach(() => {
            dataService.getSubjectData.mockReturnValue(mockSubjectData);
            dataService.searchLecturerInfo.mockReturnValue({
                name: 'Nguyen Van A',
                email: 'nguyenvana@hcmut.edu.vn',
                phone: '0123456789'
            });
        });

        it('should return 400 if day is not provided', () => {
            req.query = {};

            lecturerController.browseSchedule(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Day required' });
        });

        it('should filter by day of week', () => {
            req.query = { day: '2' };

            lecturerController.browseSchedule(req, res);

            expect(res.json).toHaveBeenCalled();
            const result = res.json.mock.calls[0][0];
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].classInfo[0].dayOfWeek).toBe(2);
        });

        it('should filter by tiet (time slots)', () => {
            req.query = { day: '2', tiet: '1,2' };

            lecturerController.browseSchedule(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should filter by campus', () => {
            req.query = { day: '2', campus: '1' };

            lecturerController.browseSchedule(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('should sort results by time slot', () => {
            req.query = { day: '2' };

            lecturerController.browseSchedule(req, res);

            const result = res.json.mock.calls[0][0];
            if (result.length > 1) {
                for (let i = 0; i < result.length - 1; i++) {
                    expect(result[i].classInfo[0].tietHoc[0])
                        .toBeLessThanOrEqual(result[i + 1].classInfo[0].tietHoc[0]);
                }
            }
        });
    });

    describe('listLecturers', () => {
        it('should return all lecturers', () => {
            const mockLecturers = [
                { name: 'Nguyen Van A', email: 'a@hcmut.edu.vn', phone: '0123456789' },
                { name: 'Tran Thi B', email: 'b@hcmut.edu.vn', phone: '0987654321' }
            ];
            dataService.getLecturerData.mockReturnValue(mockLecturers);

            lecturerController.listLecturers(req, res);

            expect(res.json).toHaveBeenCalledWith(mockLecturers);
        });
    });

    describe('getLecturerInfo', () => {
        it('should return specific lecturer info when gv is provided', () => {
            const mockInfo = {
                name: 'Nguyen Van A',
                email: 'a@hcmut.edu.vn',
                phone: '0123456789'
            };
            req.query = { gv: 'Nguyen Van A' };
            dataService.searchLecturerInfo.mockReturnValue(mockInfo);

            lecturerController.getLecturerInfo(req, res);

            expect(dataService.searchLecturerInfo).toHaveBeenCalledWith('Nguyen Van A');
            expect(res.json).toHaveBeenCalledWith(mockInfo);
        });

        it('should return all lecturers when gv is not provided', () => {
            const mockLecturers = [
                { name: 'Nguyen Van A', email: 'a@hcmut.edu.vn' }
            ];
            dataService.getLecturerData.mockReturnValue(mockLecturers);

            lecturerController.getLecturerInfo(req, res);

            expect(res.json).toHaveBeenCalledWith(mockLecturers);
        });
    });

    describe('listSubjects', () => {
        it('should return list of subjects with id and name', () => {
            const mockSubjects = [
                { maMonHoc: 'MT1003', tenMonHoc: 'Toán cao cấp 1' },
                { maMonHoc: 'PH1005', tenMonHoc: 'Vật lý 1' }
            ];
            dataService.getSubjectData.mockReturnValue(mockSubjects);

            lecturerController.listSubjects(req, res);

            expect(res.json).toHaveBeenCalledWith([
                { id: 'MT1003', name: 'Toán cao cấp 1' },
                { id: 'PH1005', name: 'Vật lý 1' }
            ]);
        });
    });
});
