import { Request, Response } from 'express';
import { OfferModel } from '../models/Offer';
import { OfferCreateSchema, OfferUpdateSchema } from '../schemas/offer';

export default class OfferController {
  async list(req: Request, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      status = 'all',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const filter: any = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (status && status !== 'all') {
      const now = new Date();
      if (status === 'active') {
        filter.isActive = true;
        filter.$and = [
          { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
          { $or: [{ endsAt: { $exists: false } }, { endsAt: { $gt: now } }] },
        ];
      } else if (status === 'inactive') {
        filter.isActive = false;
      } else if (status === 'upcoming') {
        filter.isActive = true;
        filter.startsAt = { $gt: now };
      } else if (status === 'expired') {
        filter.isActive = true;
        filter.endsAt = { $lte: now };
      }
    }

    const [data, total] = await Promise.all([
      OfferModel.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      OfferModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }
  async active(_req: Request, res: Response): Promise<void> {
    const docs = await (OfferModel as any).getActiveOffers();
    const offers = (docs || []).map((o: any) => ({
      _id: String(o._id),
      title: o.title,
      description: o.description,
      image: o.image,
      productIds: (o.productIds || []).map((p: any) => (typeof p === 'string' ? p : String(p?._id))),
      isFeatured: o.isFeatured,
      priority: o.priority,
      eyebrow: o.eyebrow,
      headline: o.headline,
      subheadline: o.subheadline,
      ctaLabel: o.ctaLabel,
      ctaTo: o.ctaTo,
      layout: o.layout,
      bgColor: o.bgColor,
      textColor: o.textColor,
      discountPercent: o.discountPercent,
      priceOff: o.priceOff,
    }))
    .filter((o: any) => !!o.image)
    .sort((a: any, b: any) => (b.isFeatured === a.isFeatured ? b.priority - a.priority : Number(b.isFeatured) - Number(a.isFeatured)));
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






