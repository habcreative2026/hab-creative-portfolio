# HAB CREATIVE - Portfolio Management System

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio.vercel.app)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://portfolio-backend.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Hệ thống quản lý Portfolio với xác thực QR Code và Desktop App bảo mật cao**

---

## **Tổng quan**

HAB Creative là một hệ thống quản lý portfolio toàn diện với các tính năng:

- **Admin Panel** - Quản lý nội dung, người dùng, cài đặt
- **QR Code Authentication** - Đăng nhập an toàn qua điện thoại
- **Desktop App** - Ứng dụng Windows/MacOS với bảo mật cao
- **Super Admin** - Quyền quản trị tối cao
- **Real-time Preview** - Xem trước website trong admin
- **Backup & Restore** - Sao lưu và phục hồi dữ liệu

---

## **Kiến trúc hệ thống**

┌─────────────────────────────────────────────────────────────┐
│ Desktop App (Electron) │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ • Tạo QR Code tự động │ │
│ │ • Polling kiểm tra trạng thái │ │
│ │ • Mở trình duyệt khi xác thực thành công │ │
│ │ • Lưu token mã hóa │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Backend API (Render) │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ • QR Session Management │ │
│ │ • JWT Authentication │ │
│ │ • Rate Limiting │ │
│ │ • IP Blacklist │ │
│ │ • MongoDB Database │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend Web (Vercel) │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ • Admin Dashboard │ │
│ │ • QR Login Page │ │
│ │ • Content Management │ │
│ │ • Super Admin Panel │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

text

---

## **Công nghệ sử dụng**

### **Backend**

| Công nghệ      | Mô tả                         |
| -------------- | ----------------------------- |
| **Node.js**    | Runtime environment           |
| **Express.js** | Web framework                 |
| **MongoDB**    | Database                      |
| **Mongoose**   | ODM                           |
| **JWT**        | Authentication                |
| **QRCode**     | QR generation                 |
| **Helmet**     | Security headers              |
| **CORS**       | Cross-origin resource sharing |

### **Frontend**

| Công nghệ           | Mô tả           |
| ------------------- | --------------- |
| **Next.js 14**      | React framework |
| **TypeScript**      | Type safety     |
| **Tailwind CSS**    | Styling         |
| **Lucide React**    | Icons           |
| **QRCode.react**    | QR display      |
| **React Hot Toast** | Notifications   |

### **Desktop App**

| Công nghệ            | Mô tả             |
| -------------------- | ----------------- |
| **Electron**         | Desktop framework |
| **Electron Builder** | Build tool        |
| **Axios**            | HTTP client       |
| **QRCode**           | QR generation     |
| **FS-Extra**         | File system       |

### **DevOps**

| Công nghệ          | Mô tả            |
| ------------------ | ---------------- |
| **Vercel**         | Frontend hosting |
| **Render**         | Backend hosting  |
| **GitHub Actions** | CI/CD            |
| **MongoDB Atlas**  | Cloud database   |

---
