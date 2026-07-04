const CardProject = require("../models/Card");
const Translation = require("../models/Translation");

exports.getAllCards = async (req, res) => {
  try {
    const { type } = req.query;
    let filter = {};
    if (type === "home") filter = { showOnHome: true };
    if (type === "projects") filter = { showOnProjects: true };

    const cards = await CardProject.find(filter).sort({
      order: 1,
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: cards });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const {
      titleVi,
      titleEn,
      titleDe,
      clientVi,
      clientEn,
      clientDe,
      slug,
      order,
      showOnHome,
      showOnProjects,
      homeImageUrl,
      projectsPageImageUrl,
    } = req.body;

    const isHome = showOnHome === "true" || showOnHome === true;
    const isProjects = showOnProjects === "true" || showOnProjects === true;

    if (!isHome && !isProjects) {
      return res.status(400).json({
        success: false,
        message: "Dự án phải được chọn hiển thị ít nhất ở một trang!",
      });
    }

    const finalHomeImg = req.files?.homeImage?.[0]?.path || homeImageUrl || "";
    const finalProjImg =
      req.files?.projectsPageImage?.[0]?.path || projectsPageImageUrl || "";

    if (isHome && !finalHomeImg) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng upload ảnh hoặc nhập link ảnh cho Trang Chủ!",
      });
    }
    if (isProjects && !finalProjImg) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng upload ảnh hoặc nhập link ảnh cho trang /projects!",
      });
    }

    const titleKey = `card_${slug}_title`;
    const clientKey = `card_${slug}_client`;

    await Translation.bulkWrite([
      {
        updateOne: {
          filter: { key: titleKey },
          update: {
            $set: {
              vi: titleVi,
              en: titleEn,
              de: titleDe,
              category: "Project Cards",
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { key: clientKey },
          update: {
            $set: {
              vi: clientVi || "",
              en: clientEn || "",
              de: clientDe || "",
              category: "Project Cards",
            },
          },
          upsert: true,
        },
      },
    ]);

    const newCard = new CardProject({
      title: titleKey,
      client: clientKey,
      slug,
      showOnHome: isHome,
      showOnProjects: isProjects,
      homeImage: finalHomeImg,
      projectsPageImage: finalProjImg,
      order: order ? Number(order) : 0,
    });

    await newCard.save();
    return res.status(201).json({ success: true, data: newCard });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Đường dẫn (Slug) này đã tồn tại ở một dự án khác!",
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titleVi,
      titleEn,
      titleDe,
      clientVi,
      clientEn,
      clientDe,
      slug,
      order,
      showOnHome,
      showOnProjects,
      homeImageUrl,
      projectsPageImageUrl,
    } = req.body;

    const card = await CardProject.findById(id);
    if (!card)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dự án" });

    const isHome = showOnHome === "true" || showOnHome === true;
    const isProjects = showOnProjects === "true" || showOnProjects === true;

    const updateData = {
      showOnHome: isHome,
      showOnProjects: isProjects,
      order: order ? Number(order) : card.order,
    };

    if (req.files?.homeImage?.[0]) {
      updateData.homeImage = req.files.homeImage[0].path;
    } else if (homeImageUrl !== undefined) {
      updateData.homeImage = homeImageUrl;
    }

    if (req.files?.projectsPageImage?.[0]) {
      updateData.projectsPageImage = req.files.projectsPageImage[0].path;
    } else if (projectsPageImageUrl !== undefined) {
      updateData.projectsPageImage = projectsPageImageUrl;
    }

    let currentTitleKey = card.title;
    let currentClientKey = card.client || `card_${card.slug}_client`;

    if (slug && slug !== card.slug) {
      updateData.slug = slug;
      const newTitleKey = `card_${slug}_title`;
      const newClientKey = `card_${slug}_client`;

      await Translation.deleteMany({
        key: { $in: [card.title, card.client].filter(Boolean) },
      });

      currentTitleKey = newTitleKey;
      currentLocationKey = newLocationKey;
      currentClientKey = newClientKey;

      updateData.title = newTitleKey;
      updateData.client = newClientKey;
    }

    await Translation.bulkWrite([
      {
        updateOne: {
          filter: { key: currentTitleKey },
          update: {
            $set: {
              vi: titleVi,
              en: titleEn,
              de: titleDe,
              category: "Project Cards",
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { key: currentClientKey },
          update: {
            $set: {
              vi: clientVi || "",
              en: clientEn || "",
              de: clientDe || "",
              category: "Project Cards",
            },
          },
          upsert: true,
        },
      },
    ]);

    const updatedCard = await CardProject.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    return res.status(200).json({ success: true, data: updatedCard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const card = await CardProject.findById(req.params.id);
    if (!card)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy dự án" });

    await Translation.deleteMany({
      key: { $in: [card.title, card.client].filter(Boolean) },
    });
    await CardProject.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "Xóa dự án thành công!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderCard = async (req, res) => {
  try {
    const { sortedIds } = req.body;

    if (!sortedIds || !Array.isArray(sortedIds)) {
      return res.status(400).json({
        success: false,
        message: "Danh sách sortedIds không hợp lệ!",
      });
    }

    const bulkOps = sortedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await CardProject.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thứ tự dự án thành công!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
