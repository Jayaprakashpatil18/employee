"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const tasks_service_1 = require("./tasks.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
describe('TasksService', () => {
    let service;
    const mockHrUser = {
        id: 'user-hr-1',
        name: 'HR Manager',
        email: 'hr@example.com',
        role: client_1.UserRole.HR_MANAGER,
        department: 'Human Resources',
    };
    const mockItUser = {
        id: 'user-it-1',
        name: 'IT Admin',
        email: 'it@example.com',
        role: client_1.UserRole.IT,
        department: 'IT',
    };
    const mockEmployeeUser = {
        id: 'user-emp-1',
        name: 'Alex Turner',
        email: 'alex@example.com',
        role: client_1.UserRole.EMPLOYEE,
        department: 'Engineering',
    };
    const mockTask = {
        id: 'task-101',
        employeeId: 'emp-101',
        title: 'Provision Developer Laptop',
        description: 'Configure MacBook Pro M3',
        assignedDepartment: 'IT',
        assignedUserId: null,
        status: client_1.TaskStatus.TODO,
        priority: 'HIGH',
        isMandatory: true,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    };
    const mockOverdueTask = {
        ...mockTask,
        id: 'task-overdue-1',
        title: 'Overdue Setup',
        status: client_1.TaskStatus.TODO,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tasks_service_1.TasksService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                        departmentTask: {
                            findUnique: jest.fn().mockImplementation(({ where }) => {
                                if (where.id === 'task-101')
                                    return mockTask;
                                if (where.id === 'task-overdue-1')
                                    return mockOverdueTask;
                                return null;
                            }),
                            findMany: jest.fn().mockResolvedValue([mockTask, mockOverdueTask]),
                            create: jest.fn().mockResolvedValue(mockTask),
                            update: jest.fn().mockImplementation(({ where, data }) => ({
                                ...mockTask,
                                ...data,
                                assignedUser: data.assignedUserId === mockItUser.id ? mockItUser : null,
                            })),
                        },
                        user: {
                            findUnique: jest.fn().mockImplementation(({ where }) => {
                                if (where.id === 'user-it-1')
                                    return mockItUser;
                                return null;
                            }),
                        },
                        auditLog: {
                            create: jest.fn().mockResolvedValue({ id: 'log-1' }),
                        },
                    },
                },
            ],
        }).compile();
        service = module.get(tasks_service_1.TasksService);
    });
    describe('Task State Transitions & Completion', () => {
        it('should start task and transition status to IN_PROGRESS', async () => {
            const result = await service.startTask('task-101', mockItUser);
            expect(result.status).toBe(client_1.TaskStatus.IN_PROGRESS);
        });
        it('should complete task with mandatory completion remarks', async () => {
            const result = await service.completeTask('task-101', 'Configured macOS M3 image', mockItUser);
            expect(result.status).toBe(client_1.TaskStatus.COMPLETED);
        });
        it('should throw BadRequestException if completing mandatory task without remarks', async () => {
            await expect(service.completeTask('task-101', '', mockItUser)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Dynamic Overdue Detection', () => {
        it('should dynamically identify past due date tasks as OVERDUE', async () => {
            const task = await service.findOne('task-overdue-1');
            expect(task.isOverdue).toBe(true);
        });
    });
    describe('RBAC Authorization', () => {
        it('should deny employee from completing departmental tasks (403 Forbidden)', async () => {
            await expect(service.completeTask('task-101', 'Done', mockEmployeeUser)).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should allow HR Admin to assign tasks', async () => {
            const result = await service.assignTask('task-101', 'user-it-1', mockHrUser);
            expect(result.assignedUser.name).toBe('IT Admin');
        });
    });
});
//# sourceMappingURL=tasks.service.spec.js.map