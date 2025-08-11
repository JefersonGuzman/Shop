"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Offer_1 = require("../models/Offer");
const offer_1 = require("../schemas/offer");
class OfferController {
    async list(req, res) {
        const offers = await Offer_1.OfferModel.find().sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: offers });
    }
    async create(req, res) {
        const payload = offer_1.OfferCreateSchema.parse(req.body);
        const offer = await Offer_1.OfferModel.create({ ...payload, productIds: payload.productIds });
        res.status(201).json({ success: true, data: offer });
    }
    async update(req, res) {
        const { id } = req.params;
        const payload = offer_1.OfferUpdateSchema.parse(req.body);
        const offer = await Offer_1.OfferModel.findByIdAndUpdate(id, payload, { new: true });
        res.json({ success: true, data: offer });
    }
    async remove(req, res) {
        const { id } = req.params;
        await Offer_1.OfferModel.findByIdAndDelete(id);
        res.json({ success: true });
    }
}
exports.default = OfferController;
//# sourceMappingURL=OfferController.js.map