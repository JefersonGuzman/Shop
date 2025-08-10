import { Request, Response } from 'express';
import { OfferModel } from '../models/Offer';
import { OfferCreateSchema, OfferUpdateSchema } from '../schemas/offer';

export default class OfferController {
  async list(req: Request, res: Response): Promise<void> {
    const offers = await OfferModel.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: offers });
  }
  async create(req: Request, res: Response): Promise<void> {
    const payload = OfferCreateSchema.parse(req.body);
    const offer = await OfferModel.create({ ...payload, productIds: payload.productIds });
    res.status(201).json({ success: true, data: offer });
  }
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const payload = OfferUpdateSchema.parse(req.body);
    const offer = await OfferModel.findByIdAndUpdate(id, payload, { new: true });
    res.json({ success: true, data: offer });
  }
  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await OfferModel.findByIdAndDelete(id);
    res.json({ success: true });
  }
}




