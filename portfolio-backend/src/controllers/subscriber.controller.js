const Subscriber = require("../models/Subscriber");
const Broadcast = require("../models/Broadcast");
const resend = require("../config/resend");

// ==================== SUBSCRIBE (public) ====================
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email!",
      });
    }

    const emailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đúng địa chỉ Gmail (@gmail.com)!",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalizedEmail });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.unsubscribedAt = null;
        await existing.save();
        return res.status(200).json({
          success: true,
          message: "Đăng ký lại thành công!",
          data: existing,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Email này đã đăng ký trước đó!",
        alreadyExists: true,
        data: existing,
      });
    }

    const subscriber = await Subscriber.create({
      email: normalizedEmail,
      source: "footer",
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: subscriber,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi đăng ký!",
    });
  }
};

// ==================== GET ALL (admin) ====================
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: subscribers,
      total: subscribers.length,
      active: subscribers.filter((s) => s.isActive).length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE (admin) ====================
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    await Subscriber.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Đã xóa subscriber!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TOGGLE ACTIVE (admin) ====================
exports.toggleSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscriber.findById(id);
    if (!sub) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy!" });
    }
    sub.isActive = !sub.isActive;
    sub.unsubscribedAt = sub.isActive ? null : new Date();
    await sub.save();
    res.status(200).json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SEND BROADCAST (admin) ====================
exports.sendBroadcast = async (req, res) => {
  try {
    const { subject, content, imageUrl } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tiêu đề và nội dung!",
      });
    }

    const subscribers = await Subscriber.find({ isActive: true });

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Chưa có subscriber nào để gửi!",
      });
    }

    const broadcast = await Broadcast.create({
      subject,
      content,
      imageUrl: imageUrl || "",
      recipientsCount: subscribers.length,
      status: "sending",
    });

    const esc = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // ============ DOWNLOAD IMAGE + CONVERT BASE64 ============
    let attachments = [];
    if (imageUrl) {
      try {
        const imageRes = await fetch(imageUrl);
        if (imageRes.ok) {
          const arrayBuffer = await imageRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const contentType =
            imageRes.headers.get("content-type") || "image/jpeg";

          attachments = [
            {
              filename: "banner.jpg",
              content: base64,
              contentType: contentType,
              contentId: "banner-image",
            },
          ];
          console.log("Image attached, size:", arrayBuffer.byteLength, "bytes");
        } else {
          console.error("Failed to fetch image:", imageRes.status);
        }
      } catch (err) {
        console.error("Error downloading image:", err);
      }
    }

    // ============ EMAIL TEMPLATE ============
    const buildEmailHtml = (subscriberEmail) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${esc(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; display: block; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .hero-title { font-size: 32px !important; line-height: 1.15 !important; }
      .cta-text { font-size: 13px !important; }
      .stack { display: block !important; width: 100% !important; text-align: center !important; padding: 6px 0 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f7; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- Preheader (ẩn, hiển thị preview text trong inbox) -->
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#f5f5f7; opacity:0;">
    ${esc(content.substring(0, 120))}...
  </div>

  <!-- WRAPPER -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f7;">
    <tr>
      <td align="center" style="padding: 48px 16px;">

        <!-- ============ MAIN CARD ============ -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06);">

          <!-- ============ TOP BAR (brand) ============ -->
          <tr>
            <td style="padding: 28px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="https://hab-creative.com" style="text-decoration:none; display:inline-block;">
                      <span style="font-size:11px; font-weight:700; color:#111111; letter-spacing:3px; text-transform:uppercase;">
                        HAB&nbsp;CREATIVE
                      </span>
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size:11px; color:#999; letter-spacing:0.5px;">
                      ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ HERO TITLE ============ -->
          <tr>
            <td class="px" style="padding: 32px 40px 24px 40px;">
              <h1 class="hero-title" style="margin:0; font-size:40px; line-height:1.15; font-weight:800; color:#111111; letter-spacing:-1.2px;">
                ${esc(subject)}
              </h1>
            </td>
          </tr>

          ${
            imageUrl
              ? `
          <!-- ============ HERO IMAGE ============ -->
          <tr>
            <td style="padding: 0 40px;">
              <img src="cid:banner-image" alt="${esc(subject)}" width="520" style="width:100%; height:auto; display:block; border-radius:16px;" />
            </td>
          </tr>
          `
              : ""
          }

          <!-- ============ CONTENT ============ -->
          <tr>
            <td class="px" style="padding: 32px 40px 8px 40px;">
              <div style="font-size:16px; color:#4b5563; line-height:1.75; letter-spacing:-0.1px; white-space:pre-wrap;">${esc(content)}</div>
            </td>
          </tr>

          <!-- ============ CTA BUTTON ============ -->
          <tr>
            <td class="px" style="padding: 32px 40px 40px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius:100px; background-color:#111111;">
                    <a href="https://hab-creative.com" target="_blank" class="cta-text" style="display:inline-block; padding: 16px 36px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:100px; letter-spacing:0.2px;">
                      Khám phá ngay
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============ DIVIDER ============ -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height:1px; background: linear-gradient(to right, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);"></div>
            </td>
          </tr>

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="px" style="padding: 28px 40px 32px 40px; background-color:#fafafa;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0; font-size:12px; color:#888; line-height:1.6;">
                      Email này được gửi tới <span style="color:#111; font-weight:600;">${esc(subscriberEmail)}</span> vì bạn đã đăng ký nhận tin từ <a href="https://hab-creative.com" style="color:#111; font-weight:600; text-decoration:underline;">hab-creative.com</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:11px; color:#bbb; letter-spacing:0.3px;">
                          © 2025 HAB Creative
                        </td>
                        <td align="right" style="font-size:11px; letter-spacing:0.3px;">
                          <a href="https://hab-creative.com" style="color:#888; text-decoration:none;">Website</a>
                          <span style="color:#ddd; margin:0 8px;">•</span>
                          <a href="mailto:hello@hab-creative.com" style="color:#888; text-decoration:none;">Contact</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /MAIN CARD -->

        <!-- ============ SUB-FOOTER ============ -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">
          <tr>
            <td align="center" style="padding: 24px 16px 0 16px;">
              <p style="margin:0; font-size:11px; color:#b3b3b3; line-height:1.6; letter-spacing:0.2px;">
                Bạn nhận được email này vì đã đăng ký tại <span style="color:#888;">hab-creative.com</span>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;

    let successCount = 0;
    let failedCount = 0;
    let lastError = null;

    for (const sub of subscribers) {
      try {
        const { error } = await resend.emails.send({
          from: "HAB Creative <hello@hab-creative.com>",
          to: [sub.email],
          subject: subject,
          html: buildEmailHtml(sub.email),
          attachments,
        });

        if (error) {
          console.error(`Failed to send to ${sub.email}:`, error);
          failedCount++;
          lastError = error;
        } else {
          successCount++;
        }

        await new Promise((r) => setTimeout(r, 100));
      } catch (err) {
        console.error(`Error sending to ${sub.email}:`, err);
        failedCount++;
        lastError = err;
      }
    }

    broadcast.successCount = successCount;
    broadcast.failedCount = failedCount;
    broadcast.status =
      failedCount === 0 ? "success" : successCount === 0 ? "failed" : "partial";
    await broadcast.save();

    if (successCount === 0 && failedCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không gửi được email nào! Có thể do Resend chưa verify domain.",
        error: lastError?.message || "Unknown error",
      });
    }

    res.status(200).json({
      success: true,
      message: `Đã gửi ${successCount}/${subscribers.length} email thành công!`,
      data: broadcast,
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi gửi broadcast!",
    });
  }
};

// ==================== GET BROADCASTS (admin) ====================
exports.getAllBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: broadcasts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE BROADCAST (admin) ====================
exports.deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    await Broadcast.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Đã xóa broadcast!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
