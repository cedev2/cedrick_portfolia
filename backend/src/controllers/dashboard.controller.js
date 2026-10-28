import {
  Achievement,
  Blog,
  Certificate,
  Education,
  Experience,
  Message,
  Project,
  Service,
  Skill,
  Testimonial,
  Visitor,
} from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/admin/dashboard
 */
export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    projects,
    skills,
    blogs,
    messages,
    experience,
    certificates,
    unreadMessages,
    services,
    testimonials,
    achievements,
    education,
    visitors,
  ] = await Promise.all([
    Project.countDocuments({ deleted_at: null }),
    Skill.countDocuments({ deleted_at: null }),
    Blog.countDocuments({ deleted_at: null }),
    Message.countDocuments(),
    Experience.countDocuments({ deleted_at: null }),
    Certificate.countDocuments({ deleted_at: null }),
    Message.countDocuments({ is_read: 0 }),
    Service.countDocuments({ deleted_at: null }),
    Testimonial.countDocuments({ deleted_at: null }),
    Achievement.countDocuments({ deleted_at: null }),
    Education.countDocuments({ deleted_at: null }),
    Visitor.countDocuments(),
  ]);

  const recentMessages = await Message.find({}).sort({ created_at: -1 }).limit(5).lean();

  const recentVisitors = await Visitor.find({})
    .sort({ visited_at: -1 })
    .limit(5)
    .select('ip_address page_url visited_at')
    .lean();

  return res.json({
    success: true,
    message: 'Success',
    data: {
      stats: {
        projects,
        skills,
        blogs,
        messages,
        experience,
        certificates,
        services,
        testimonials,
        achievements,
        education,
        visitors,
        unreadMessages,
      },
      recentMessages,
      recentVisitors,
    },
  });
});
