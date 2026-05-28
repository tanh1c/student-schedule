import { activePeriodJars } from '../services/sessionStore.js';
import { deleteTemplate as removeTemplate, getTemplate, listTemplates as loadTemplates, saveTemplate } from '../services/registrationTemplateStore.js';
import { submitRegistrationAttempt } from './dkmhController.js';

const OPTION_A_MAX_COURSES = 10;

function courseMatchesRegistration(course, registrationResult) {
    const registeredCourses = registrationResult?.courses || [];
    return registeredCourses.find((registeredCourse) => (
        registeredCourse.code === course.code && (
            !course.currentGroupCode ||
            registeredCourse.group === course.currentGroupCode ||
            registeredCourse.groupLT === course.currentLtGroup ||
            registeredCourse.groupBT === course.currentBtGroup
        )
    ));
}

export async function runTemplateCourses(template, storedData) {
    const runLog = [];
    const summary = { success: 0, draft: 0, failed: 0 };
    let registrationResult = null;

    for (const course of template.courses || []) {
        let courseResolved = false;
        const priorities = Array.isArray(course.priority) ? course.priority : [];

        for (const priority of priorities) {
            if (!priority.nlmhId) {
                runLog.push({
                    status: 'error',
                    courseCode: course.code,
                    groupCode: priority.groupCode,
                    message: 'Thiếu NLMHId'
                });
                continue;
            }

            const attempt = await submitRegistrationAttempt(storedData, {
                nlmhId: priority.nlmhId,
                monHocId: course.monHocId,
                forceMode: false
            });
            registrationResult = attempt.registrationResult || registrationResult;

            const logEntry = {
                courseCode: course.code,
                groupCode: priority.groupCode,
                nlmhId: String(priority.nlmhId),
                code: attempt.code,
                message: attempt.message || attempt.error || 'Không rõ kết quả'
            };

            if (attempt.draft) {
                runLog.push({ ...logEntry, status: 'draft', draft: true });
                summary.draft += 1;
                courseResolved = true;
                break;
            }

            const matchedCourse = courseMatchesRegistration({
                ...course,
                currentGroupCode: priority.groupCode,
                currentLtGroup: priority.ltGroup,
                currentBtGroup: priority.btGroup
            }, attempt.registrationResult);

            if (attempt.success && matchedCourse) {
                runLog.push({ ...logEntry, status: 'success', ketquaId: matchedCourse.ketquaId });
                summary.success += 1;
                courseResolved = true;
                break;
            }

            runLog.push({ ...logEntry, status: 'error' });
        }

        if (!courseResolved) summary.failed += 1;
    }

    return { summary, runLog, registrationResult };
}

export const listTemplates = async (req, res) => {
    try {
        const templates = await loadTemplates(req.session);
        res.json({ success: true, data: templates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const upsertTemplate = async (req, res) => {
    try {
        const template = await saveTemplate(req.session, req.body);
        res.json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const deleted = await removeTemplate(req.session, req.params.templateId);
        if (!deleted) return res.status(404).json({ error: 'Template not found' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const runTemplate = async (req, res) => {
    const { templateId } = req.params;
    const template = await getTemplate(req.session, templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if ((template.courses || []).length > OPTION_A_MAX_COURSES) {
        return res.status(400).json({ error: `Option A chỉ cho chạy tối đa ${OPTION_A_MAX_COURSES} môn` });
    }

    const periodId = String(req.body.periodId || template.periodId || '');
    const storedData = activePeriodJars.get(`${req.token}_${periodId}`);
    if (!storedData) return res.status(400).json({ error: 'Cần mở kỳ đăng ký trước khi chạy mẫu' });

    try {
        const result = await runTemplateCourses(template, storedData);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            summary: { success: 0, draft: 0, failed: 0 },
            runLog: [],
            registrationResult: null
        });
    }
};
