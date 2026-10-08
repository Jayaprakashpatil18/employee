"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Prisma database seeding for Phase 5...');
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.joiningChecklistItem.deleteMany({});
    await prisma.employeeAsset.deleteMany({});
    await prisma.departmentTask.deleteMany({});
    await prisma.backgroundVerification.deleteMany({});
    await prisma.employeeDocument.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.planChecklistItemRequirement.deleteMany({});
    await prisma.planAssetRequirement.deleteMany({});
    await prisma.planTask.deleteMany({});
    await prisma.planDocumentRequirement.deleteMany({});
    await prisma.onboardingPlan.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Cleaned existing records.');
    const hrAdmin = await prisma.user.create({
        data: {
            clerkUserId: 'clerk_user_hr_admin_001',
            name: 'Sarah Jenkins',
            email: 'sarah.jenkins@corp.example.com',
            role: client_1.UserRole.HR_ADMIN,
            department: 'Human Resources',
        },
    });
    const hrManager = await prisma.user.create({
        data: {
            clerkUserId: 'clerk_user_hr_manager_001',
            name: 'Michael Chang',
            email: 'michael.chang@corp.example.com',
            role: client_1.UserRole.HR_MANAGER,
            department: 'Human Resources',
        },
    });
    const itUser = await prisma.user.create({
        data: {
            clerkUserId: 'clerk_user_it_001',
            name: 'David Miller',
            email: 'david.miller@corp.example.com',
            role: client_1.UserRole.IT,
            department: 'Information Technology',
        },
    });
    const employeeUser = await prisma.user.create({
        data: {
            clerkUserId: 'clerk_user_emp_001',
            name: 'Alex Turner',
            email: 'alex.turner@corp.example.com',
            role: client_1.UserRole.EMPLOYEE,
            department: 'Engineering',
        },
    });
    const engPlan = await prisma.onboardingPlan.create({
        data: {
            title: 'Engineering New Hire Plan',
            description: 'Technical onboarding covering laptop setup, code repository access, background check, and buddy allocation.',
            department: 'Engineering',
            designation: 'Software Engineer',
            location: 'Bengaluru',
            employmentType: 'Full Time',
            isActive: true,
            documentRequirements: {
                create: [
                    { documentType: 'ID Proof (Aadhaar / Passport)', isRequired: true, verificationRequired: true },
                    { documentType: 'PAN Card', isRequired: true, verificationRequired: true },
                    { documentType: 'Education Certificate', isRequired: true, verificationRequired: true },
                ],
            },
            taskRequirements: {
                create: [
                    { title: 'Prepare Developer Laptop', description: 'Configure Macbook M3 Pro', assignedDepartment: 'IT', defaultAssigneeRole: client_1.UserRole.IT, isMandatory: true, dueDaysFromJoining: -3 },
                    { title: 'Create Email Account', description: 'Setup corporate email', assignedDepartment: 'IT', defaultAssigneeRole: client_1.UserRole.IT, isMandatory: true, dueDaysFromJoining: -1 },
                ],
            },
            assetRequirements: {
                create: [
                    { assetType: 'Laptop (MacBook Pro)', isMandatory: true },
                    { assetType: 'Proximity ID Card', isMandatory: true },
                ],
            },
            checklistRequirements: {
                create: [
                    { title: 'Manager Assigned & Welcome 1-on-1 scheduled', category: 'MANAGEMENT', isMandatory: true },
                    { title: 'HR Orientation Attended', category: 'HR', isMandatory: true },
                ],
            },
        },
    });
    const candA = await prisma.candidate.create({
        data: {
            firstName: 'Alex',
            lastName: 'Turner',
            email: 'alex.turner@corp.example.com',
            phone: '+1-555-0177',
            department: 'Engineering',
            designation: 'Software Engineer',
            location: 'Bengaluru',
            employmentType: 'Full Time',
            expectedJoiningDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            status: client_1.CandidateStatus.CONVERTED,
        },
    });
    await prisma.employee.create({
        data: {
            candidateId: candA.id,
            userId: employeeUser.id,
            employeeId: 'EMP-2026-0001',
            firstName: 'Alex',
            lastName: 'Turner',
            email: 'alex.turner@corp.example.com',
            phone: '+1-555-0177',
            department: 'Engineering',
            designation: 'Software Engineer',
            location: 'Bengaluru',
            employmentType: 'Full Time',
            joiningDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            onboardingStatus: client_1.OnboardingStatus.READY,
            onboardingPlanId: engPlan.id,
            documents: {
                create: [
                    { documentType: 'ID Proof (Aadhaar / Passport)', documentName: 'passport_scan.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.VERIFIED, verifiedById: hrAdmin.id, verifiedAt: new Date() },
                    { documentType: 'PAN Card', documentName: 'pan_card.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.VERIFIED, verifiedById: hrAdmin.id, verifiedAt: new Date() },
                ],
            },
            verifications: {
                create: [
                    { verificationType: 'Identity Check', isMandatory: true, agencyName: 'SafeHire', status: client_1.VerificationStatus.COMPLETED, result: client_1.VerificationResult.CLEAR, completedAt: new Date() },
                ],
            },
            tasks: {
                create: [
                    { title: 'Prepare Developer Laptop', isMandatory: true, assignedDepartment: 'IT', status: client_1.TaskStatus.COMPLETED, completionRemarks: 'Laptop imaged and shipped' },
                ],
            },
            assets: {
                create: [
                    { assetName: 'MacBook Pro M3', assetType: 'Laptop (MacBook Pro)', isMandatory: true, status: client_1.AssetStatus.ASSIGNED, serialNumber: 'MBP-2026-9901' },
                ],
            },
            checklist: {
                create: [
                    { title: 'Manager Assigned & Welcome 1-on-1 scheduled', item: 'Manager Assigned & Welcome 1-on-1 scheduled', isMandatory: true, isCompleted: true, completedAt: new Date(), completedById: hrAdmin.id },
                ],
            },
        },
    });
    const candB = await prisma.candidate.create({
        data: {
            firstName: 'Rahul',
            lastName: 'Sharma',
            email: 'rahul.sharma@corp.example.com',
            phone: '+91-9876543210',
            department: 'Engineering',
            designation: 'Software Engineer',
            location: 'Bengaluru',
            employmentType: 'Full Time',
            expectedJoiningDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            status: client_1.CandidateStatus.CONVERTED,
        },
    });
    await prisma.employee.create({
        data: {
            candidateId: candB.id,
            employeeId: 'EMP-2026-0002',
            firstName: 'Rahul',
            lastName: 'Sharma',
            email: 'rahul.sharma@corp.example.com',
            phone: '+91-9876543210',
            department: 'Engineering',
            designation: 'Software Engineer',
            location: 'Bengaluru',
            employmentType: 'Full Time',
            joiningDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            onboardingStatus: client_1.OnboardingStatus.PARTIALLY_READY,
            onboardingPlanId: engPlan.id,
            documents: {
                create: [
                    { documentType: 'ID Proof (Aadhaar / Passport)', documentName: 'aadhaar_front.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.VERIFIED, verifiedById: hrManager.id, verifiedAt: new Date() },
                    { documentType: 'Education Certificate', documentName: 'btech_transcript.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.PENDING },
                ],
            },
            verifications: {
                create: [
                    { verificationType: 'Education Verification', isMandatory: true, agencyName: 'SafeHire', status: client_1.VerificationStatus.IN_PROGRESS },
                ],
            },
            tasks: {
                create: [
                    { title: 'Create Email Account', isMandatory: true, assignedDepartment: 'IT', status: client_1.TaskStatus.TODO, dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) },
                ],
            },
            assets: {
                create: [
                    { assetName: 'Proximity ID Card', assetType: 'Proximity ID Card', isMandatory: true, status: client_1.AssetStatus.READY, serialNumber: 'ID-2026-4401' },
                ],
            },
            checklist: {
                create: [
                    { title: 'Manager Assigned & Welcome 1-on-1 scheduled', item: 'Manager Assigned & Welcome 1-on-1 scheduled', isMandatory: true, isCompleted: true, completedAt: new Date(), completedById: hrManager.id },
                ],
            },
        },
    });
    const candC = await prisma.candidate.create({
        data: {
            firstName: 'Priya',
            lastName: 'Patel',
            email: 'priya.patel@corp.example.com',
            phone: '+91-9812345678',
            department: 'Finance',
            designation: 'Financial Analyst',
            location: 'Mumbai',
            employmentType: 'Full Time',
            expectedJoiningDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            status: client_1.CandidateStatus.CONVERTED,
        },
    });
    await prisma.employee.create({
        data: {
            candidateId: candC.id,
            employeeId: 'EMP-2026-0003',
            firstName: 'Priya',
            lastName: 'Patel',
            email: 'priya.patel@corp.example.com',
            phone: '+91-9812345678',
            department: 'Finance',
            designation: 'Financial Analyst',
            location: 'Mumbai',
            employmentType: 'Full Time',
            joiningDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            onboardingStatus: client_1.OnboardingStatus.DELAYED,
            onboardingPlanId: engPlan.id,
            documents: {
                create: [
                    { documentType: 'ID Proof (Aadhaar / Passport)', documentName: 'passport.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.VERIFIED },
                ],
            },
            tasks: {
                create: [
                    { title: 'Setup Payroll Account & Tax Forms', isMandatory: true, assignedDepartment: 'Finance', status: client_1.TaskStatus.TODO, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
                ],
            },
            assets: {
                create: [
                    { assetName: 'Finance Workstation Laptop', assetType: 'Laptop (ThinkPad)', isMandatory: true, status: client_1.AssetStatus.READY },
                ],
            },
            checklist: {
                create: [
                    { title: 'Payroll Setup Completed', item: 'Payroll Setup Completed', isMandatory: true, isCompleted: false },
                ],
            },
        },
    });
    const candD = await prisma.candidate.create({
        data: {
            firstName: 'David',
            lastName: 'FailedVerif',
            email: 'david.failed@corp.example.com',
            phone: '+1-555-8888',
            department: 'Engineering',
            designation: 'Software Engineer',
            location: 'Bengaluru',
            employmentType: 'Full Time',
            expectedJoiningDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: client_1.CandidateStatus.CONVERTED,
        },
    });
    await prisma.employee.create({
        data: {
            candidateId: candD.id,
            employeeId: 'EMP-2026-0004',
            firstName: 'David',
            lastName: 'FailedVerif',
            email: 'david.failed@corp.example.com',
            phone: '+1-555-8888',
            department: 'Engineering',
            designation: 'Software Engineer',
            location: 'Bengaluru',
            employmentType: 'Full Time',
            joiningDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            onboardingStatus: client_1.OnboardingStatus.BLOCKED,
            onboardingPlanId: engPlan.id,
            documents: {
                create: [
                    { documentType: 'ID Proof (Aadhaar / Passport)', documentName: 'id_doc.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.VERIFIED },
                ],
            },
            verifications: {
                create: [
                    { verificationType: 'Employment Check', isMandatory: true, agencyName: 'SafeHire', status: client_1.VerificationStatus.COMPLETED, result: client_1.VerificationResult.FAILED, remarks: 'Prior employer stated candidate was terminated for cause; discrepancy in service dates.' },
                ],
            },
        },
    });
    const candE = await prisma.candidate.create({
        data: {
            firstName: 'Marcus',
            lastName: 'Vance',
            email: 'marcus.vance@corp.example.com',
            phone: '+1-555-0199',
            department: 'Finance',
            designation: 'Financial Analyst',
            location: 'New York HQ',
            employmentType: 'Full Time',
            expectedJoiningDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            status: client_1.CandidateStatus.CONVERTED,
        },
    });
    await prisma.employee.create({
        data: {
            candidateId: candE.id,
            employeeId: 'EMP-2026-0005',
            firstName: 'Marcus',
            lastName: 'Vance',
            email: 'marcus.vance@corp.example.com',
            phone: '+1-555-0199',
            department: 'Finance',
            designation: 'Financial Analyst',
            location: 'New York HQ',
            employmentType: 'Full Time',
            joiningDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            onboardingStatus: client_1.OnboardingStatus.BLOCKED,
            onboardingPlanId: engPlan.id,
            documents: {
                create: [
                    { documentType: 'ID Proof (Aadhaar / Passport)', documentName: 'blurry_passport.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.REJECTED, rejectionReason: 'Uploaded scan is blurry and illegible. Please upload a clear original copy.', remarks: 'Please upload a higher quality PDF scan.' },
                ],
            },
        },
    });
    const candF = await prisma.candidate.create({
        data: {
            firstName: 'Elena',
            lastName: 'Rostova',
            email: 'elena.rostova@corp.example.com',
            phone: '+1-555-3344',
            department: 'Engineering',
            designation: 'Staff Architect',
            location: 'London',
            employmentType: 'Full Time',
            expectedJoiningDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            status: client_1.CandidateStatus.CONVERTED,
        },
    });
    await prisma.employee.create({
        data: {
            candidateId: candF.id,
            employeeId: 'EMP-2026-0006',
            firstName: 'Elena',
            lastName: 'Rostova',
            email: 'elena.rostova@corp.example.com',
            phone: '+1-555-3344',
            department: 'Engineering',
            designation: 'Staff Architect',
            location: 'London',
            employmentType: 'Full Time',
            joiningDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            onboardingStatus: client_1.OnboardingStatus.READY,
            onboardingPlanId: engPlan.id,
            documents: {
                create: [
                    { documentType: 'ID Proof (Aadhaar / Passport)', documentName: 'passport_uk.pdf', isRequired: true, submissionStatus: client_1.DocumentSubmissionStatus.SUBMITTED, verificationStatus: client_1.DocumentVerificationStatus.VERIFIED },
                ],
            },
            tasks: {
                create: [
                    { title: 'Mandatory Workstation Provisioning', isMandatory: true, assignedDepartment: 'IT', status: client_1.TaskStatus.COMPLETED },
                    { title: 'Optional Welcome Course', isMandatory: false, assignedDepartment: 'HR', status: client_1.TaskStatus.TODO },
                ],
            },
            assets: {
                create: [
                    { assetName: 'Linux Developer Workstation', assetType: 'Laptop (ThinkPad)', isMandatory: true, status: client_1.AssetStatus.ASSIGNED },
                ],
            },
            checklist: {
                create: [
                    { title: 'Manager Welcome 1-on-1', item: 'Manager Welcome 1-on-1', isMandatory: true, isCompleted: true },
                ],
            },
        },
    });
    console.log('✅ Phase 5 database seed script updated successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map