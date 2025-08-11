"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OfferController_1 = __importDefault(require("../controllers/OfferController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const offer_1 = require("../schemas/offer");
const router = (0, express_1.Router)();
const controller = new OfferController_1.default();
router.get('/', controller.list.bind(controller));
router.get('/active', controller.active.bind(controller));
router.post('/', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(offer_1.OfferCreateSchema), controller.create.bind(controller));
router.put('/:id', auth_1.authenticateToken, auth_1.requireStaff, (0, validation_1.validateBody)(offer_1.OfferUpdateSchema), controller.update.bind(controller));
router.delete('/:id', auth_1.authenticateToken, auth_1.requireStaff, controller.remove.bind(controller));
exports.default = router;
//# sourceMappingURL=offers.js.map