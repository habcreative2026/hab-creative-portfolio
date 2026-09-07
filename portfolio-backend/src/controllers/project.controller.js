const Project = require("../models/Project");

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug.trim() });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy slug dự án tương ứng!",
      });
    }
    if (project.media_blocks) {
      project.media_blocks.sort((a, b) => a.sort_order - b.sort_order);
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const cleanSlug = req.body.slug ? req.body.slug.trim().toLowerCase() : "";
    const existing = await Project.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Mã định danh Slug này đã tồn tại trong hệ thống!",
      });
    }

    const maxOrderProject = await Project.findOne().sort({ order: -1 });
    const nextOrder = maxOrderProject ? maxOrderProject.order + 1 : 0;

    const newProject = new Project({
      ...req.body,
      slug: cleanSlug,
      order: nextOrder,
    });
    await newProject.save();
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProjectById = async (req, res) => {
  try {
    if (req.body.slug) {
      req.body.slug = req.body.slug.trim().toLowerCase();
    }
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true },
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dự án tương ứng!" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProjectById = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Dự án không tồn tại." });
    }
    res.status(200).json({
      success: true,
      message: "Xóa thành công khỏi hệ thống database.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderProjects = async (req, res) => {
  try {
    const { sortedIds } = req.body;
    if (!sortedIds || !Array.isArray(sortedIds)) {
      return res
        .status(400)
        .json({ success: false, message: "Mảng ID không hợp lệ." });
    }
    const bulkOps = sortedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));
    await Project.bulkWrite(bulkOps);
    res.status(200).json({
      success: true,
      message: "Cập nhật sắp xếp thứ tự danh mục thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
