"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const po_generation_controller_1 = require("../controllers/po-generation.controller");
const router = express_1.default.Router();
const poGenerationController = new po_generation_controller_1.POGenerationController();
// Generate PO and PFI
router.post('/generate', poGenerationController.generatePOAndPFI.bind(poGenerationController));
// Get transaction details for PO generation
router.get('/transaction/:transactionId', poGenerationController.getTransactionForPOGeneration.bind(poGenerationController));
exports.default = router;
//# sourceMappingURL=po-generation.routes.js.map