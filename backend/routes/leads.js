const express = require("express");
const router = express.Router();
const { body, validationResult, query } = require("express-validator");
const Lead = require("../models/Lead");

// Validation rules
const leadValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("company").trim().notEmpty().withMessage("Company name is required"),
  body("status")
    .optional()
    .isIn(["New", "Contacted", "Qualified", "Converted", "Lost"])
    .withMessage("Invalid status"),
  body("notes").optional().trim().isLength({ max: 1000 }),
  body("source")
    .optional()
    .isIn(["Website", "Referral", "Social Media", "Cold Call", "Email Campaign", "Other"]),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// GET /api/leads/stats - Lead statistics (must be before /:id)
router.get("/stats", async (req, res, next) => {
  try {
    const [statusCounts, totalLeads, recentLeads] = await Promise.all([
      Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Lead.countDocuments(),
      Lead.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const stats = {
      total: totalLeads,
      recentThisMonth: recentLeads,
      byStatus: {
        New: 0,
        Contacted: 0,
        Qualified: 0,
        Converted: 0,
        Lost: 0,
      },
    };

    statusCounts.forEach(({ _id, count }) => {
      if (stats.byStatus.hasOwnProperty(_id)) {
        stats.byStatus[_id] = count;
      }
    });

    const conversionRate =
      totalLeads > 0 ? ((stats.byStatus.Converted / totalLeads) * 100).toFixed(1) : 0;

    res.json({ success: true, data: { ...stats, conversionRate: parseFloat(conversionRate) } });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads - Get all leads with search, filter, sort, pagination
router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      status,
      source,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search across name, email, company
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { company: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (source) filter.source = source;

    const sortOptions = {};
    const allowedSortFields = ["name", "email", "company", "status", "createdAt", "updatedAt"];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    sortOptions[safeSortBy] = sortOrder === "asc" ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Lead.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:id - Get single lead
router.get("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
});

// POST /api/leads - Create lead
router.post("/", leadValidation, validate, async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead, message: "Lead created successfully" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leads/:id - Update lead
router.put("/:id", leadValidation, validate, async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead, message: "Lead updated successfully" });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leads/:id/status - Update only status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["New", "Contacted", "Qualified", "Converted", "Lost"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, data: lead, message: "Status updated successfully" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
