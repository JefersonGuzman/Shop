"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const validation_1 = require("../middleware/validation");
const admin_1 = require("../schemas/admin");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
// Requiere staff por defecto y especificamos admin donde aplique
router.use((req, res, next) => {
    // Permitir GET /orders a empleados también
    if (req.method === 'GET' && req.path.startsWith('/orders')) {
        return (0, auth_1.requireStaff)(req, res, next);
    }
    // Resto del admin panel requiere admin
    return (0, auth_1.requireAdmin)(req, res, next);
});
const controller = new AdminController_1.AdminController();
router.get('/ai-config', controller.getAIConfig.bind(controller));
router.post('/ai-config', (0, validation_1.validateBody)(admin_1.AIConfigSchema), controller.upsertAIConfig.bind(controller));
// Users
router.get('/users', controller.listUsers.bind(controller));
router.post('/users', (0, validation_1.validateBody)(admin_1.AdminCreateEmployeeSchema), controller.createEmployee.bind(controller));
router.patch('/users/:id', (0, validation_1.validateBody)(admin_1.AdminUpdateUserSchema), controller.updateUser.bind(controller));
router.delete('/users/:id', controller.deleteUser.bind(controller));
// Orders
router.get('/orders', controller.listOrders.bind(controller)); // staff permitido
router.patch('/orders/:id', controller.updateOrder.bind(controller)); // solo admin por el guard superior
router.delete('/orders/:id', controller.deleteOrder.bind(controller)); // solo admin
exports.default = router;
//# sourceMappingURL=admin.js.map