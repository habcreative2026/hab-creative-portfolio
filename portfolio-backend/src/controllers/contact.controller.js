const Contact = require("../models/Contact");
const resend = require("../config/resend");

exports.getContactInfo = async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact();
      await contact.save();
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact(req.body);
      await contact.save();
    } else {
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          contact[key] = req.body[key];
        }
      });
      await contact.save();
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    console.log("req.file:", req.file);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy file ảnh để upload!",
      });
    }

    let contact = await Contact.findOne();

    if (!contact) {
      contact = new Contact({ avatar_url: req.file.path });
    } else {
      contact.avatar_url = req.file.path;
    }

    await contact.save();

    res.status(200).json({
      success: true,
      data: {
        avatar_url: contact.avatar_url,
        ...contact.toObject(),
      },
      message: "Cập nhật avatar thành công!",
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SEND CONTACT EMAIL ====================
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, company, service, message } = req.body;

    // Validate bắt buộc
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại!",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ!",
      });
    }

    const receiveEmail =
      process.env.CONTACT_RECEIVE_EMAIL || "buihaitrong.dev@gmail.com";

    // Escape HTML để tránh XSS trong email
    const esc = (str) =>
      String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Ngày giờ gửi
    const now = new Date();
    const dateStr = now.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const initials = name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const { data, error } = await resend.emails.send({
      from: "HAB Creative <hello@hab-creative.com>",
      to: [receiveEmail],
      reply_to: email,
      subject: `Liên hệ mới từ ${name}${company ? ` - ${company}` : ""}`,
      html: `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Liên hệ mới</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

          <!-- ==================== HEADER ==================== -->
          <tr>
            <td style="background: linear-gradient(135deg, #111111 0%, #1f1f1f 100%); padding: 32px 40px; position: relative;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <!-- Brand -->
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 4px;">
                      HAB CREATIVE
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background-color: #ffffff; color: #111111; font-size: 18px; font-weight: 800; border-radius: 50%;">
                      ${esc(initials || "?")}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ==================== TITLE BAR ==================== -->
          <tr>
            <td style="padding: 32px 40px 8px 40px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #111111; color: #ffffff; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 100px;">
                Liên hệ mới
              </div>
              <h1 style="margin: 16px 0 6px 0; font-size: 26px; font-weight: 700; color: #111111; line-height: 1.3;">
                Bạn có một liên hệ mới
              </h1>
              <p style="margin: 0; font-size: 14px; color: #888;">
                Nhận lúc ${dateStr}
              </p>
            </td>
          </tr>

          <!-- ==================== DIVIDER ==================== -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="height: 1px; background-color: #eeeeee;"></div>
            </td>
          </tr>

          <!-- ==================== INFO TABLE ==================== -->
          <tr>
            <td style="padding: 0 40px;">

              <!-- Row: Họ tên -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;">
                      Họ và tên
                    </div>
                    <div style="font-size: 15px; font-weight: 600; color: #111111;">
                      ${esc(name)}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Row: Email -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;">
                      Email
                    </div>
                    <div style="font-size: 15px; font-weight: 600;">
                      <a href="mailto:${esc(email)}" style="color: #0066cc; text-decoration: none; border-bottom: 1px solid #0066cc;">
                        ${esc(email)}
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Row: Phone -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;">
                      Số điện thoại
                    </div>
                    <div style="font-size: 15px; font-weight: 600;">
                      <a href="tel:${esc(phone)}" style="color: #0066cc; text-decoration: none; border-bottom: 1px solid #0066cc;">
                        ${esc(phone)}
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              ${
                company
                  ? `
              <!-- Row: Company -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;">
                      Công ty
                    </div>
                    <div style="font-size: 15px; font-weight: 600; color: #111111;">
                      ${esc(company)}
                    </div>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              ${
                service
                  ? `
              <!-- Row: Service -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;">
                      Dịch vụ quan tâm
                    </div>
                    <div style="font-size: 15px; font-weight: 600; color: #111111;">
                      ${esc(service)}
                    </div>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

            </td>
          </tr>

          ${
            message
              ? `
          <tr>
            <td style="padding: 20px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fafbfc; border-radius: 12px; border-left: 4px solid #111111;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 11px; font-weight: 600; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
                      Tin nhắn
                    </div>
                    <div style="font-size: 15px; color: #333; line-height: 1.7; white-space: pre-wrap;">${esc(message)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- ==================== CTA BUTTONS ==================== -->
          <tr>
            <td style="padding: 32px 40px 24px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left">
                    <a href="mailto:${esc(email)}" style="display: inline-block; padding: 12px 24px; background-color: #111111; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 100px; letter-spacing: 0.3px;">
                      Trả lời ngay
                    </a>
                  </td>
                  <td align="right">
                    <a href="tel:${esc(phone)}" style="display: inline-block; padding: 12px 24px; background-color: #ffffff; color: #111111; font-size: 13px; font-weight: 600; text-decoration: none; border: 1.5px solid #111111; border-radius: 100px; letter-spacing: 0.3px;">
                      Gọi điện
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ==================== FOOTER ==================== -->
          <tr>
            <td style="background-color: #fafbfc; padding: 24px 40px; border-top: 1px solid #eeeeee;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; color: #888; line-height: 1.6;">
                    Email này được gửi tự động từ form liên hệ trên
                    <a href="https://hab-creative.com" style="color: #111111; font-weight: 600; text-decoration: none;">
                      hab-creative.com
                    </a>
                  </td>
                  <td align="right" style="font-size: 11px; color: #bbb; letter-spacing: 0.5px;">
                    © 2025 HAB Creative
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Main Container -->

        <!-- Spacer -->
        <div style="height: 24px;"></div>

        <!-- Sub-footer -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="font-size: 11px; color: #aaa; line-height: 1.6;">
              Bạn nhận được email này vì có người gửi form liên hệ tại
              <strong style="color: #888;">hab-creative.com</strong>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        success: false,
        message: "Không gửi được email. Vui lòng thử lại sau!",
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Gửi liên hệ thành công!",
      data,
    });
  } catch (error) {
    console.error("Send contact email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Đã xảy ra lỗi khi gửi email!",
    });
  }
};
