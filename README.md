# 🎨 Page Builder - Angular Landing Page Creator

Một ứng dụng web giúp người dùng tạo landing page dễ dàng bằng cách kéo thả các elements và tự động generate code HTML, CSS, JavaScript.

## ✨ Tính năng chính

- **Drag & Drop Interface**: Kéo thả các elements từ palette vào canvas
- **Real-time Preview**: Xem trước trang web trong thời gian thực
- **Properties Panel**: Chỉnh sửa thuộc tính của elements (content, styles, dimensions)
- **Code Generator**: Tự động generate HTML, CSS, JavaScript code
- **Download Code**: Tải xuống các file code đã generate
- **Responsive Design**: Giao diện responsive cho mobile và desktop

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (version 16 trở lên)
- npm hoặc yarn
- Angular CLI

### Cài đặt dependencies
```bash
npm install
```

### Chạy ứng dụng
```bash
ng serve
```

Ứng dụng sẽ chạy tại `http://localhost:4200`

### Build production
```bash
ng build
```

## 📖 Hướng dẫn sử dụng

### 1. Thêm Elements
- Kéo thả các elements từ palette bên trái vào canvas
- Các loại elements có sẵn:
  - **Text**: Heading, Paragraph
  - **Interactive**: Button
  - **Media**: Image
  - **Layout**: Container

### 2. Chỉnh sửa Elements
- Click vào element trên canvas để chọn
- Sử dụng Properties Panel bên phải để chỉnh sửa:
  - **Content**: Thay đổi nội dung text
  - **Dimensions**: Điều chỉnh kích thước
  - **Styles**: Thay đổi màu sắc, font, padding, margin
  - **Attributes**: Chỉnh sửa thuộc tính HTML

### 3. Generate Code
- Click nút "Show Code" trên header
- Xem code HTML, CSS, JavaScript được generate
- Copy code hoặc download các file

### 4. Quản lý Elements
- **Delete**: Click nút 🗑️ trên element đã chọn
- **Clear All**: Click nút "Clear" trên header
- **Reorder**: Kéo thả elements trên canvas để sắp xếp lại

## 🏗️ Cấu trúc dự án

```
src/
├── app/
│   ├── components/
│   │   ├── page-builder/          # Component chính
│   │   ├── element-palette/       # Palette elements
│   │   ├── canvas/               # Canvas để kéo thả
│   │   ├── properties-panel/     # Panel chỉnh sửa thuộc tính
│   │   └── code-generator/       # Generator code
│   ├── services/
│   │   ├── page-builder.ts       # Quản lý state
│   │   └── code-generator.ts     # Generate code
│   └── models/
│       └── page-element.ts       # Interface cho elements
```

## 🎯 Công nghệ sử dụng

- **Angular 17**: Framework chính
- **Angular CDK**: Drag & Drop functionality
- **SCSS**: Styling
- **TypeScript**: Type safety
- **RxJS**: Reactive programming

## 🔧 Tùy chỉnh

### Thêm Elements mới
1. Cập nhật `ElementTemplate[]` trong `PageBuilderService`
2. Thêm logic render trong `CanvasComponent`
3. Cập nhật code generator nếu cần

### Tùy chỉnh Styles
- Chỉnh sửa các file SCSS trong từng component
- Global styles trong `src/styles.scss`

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với breakpoints:
- **Desktop**: > 768px
- **Tablet**: 768px - 1200px  
- **Mobile**: < 768px

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới MIT License.

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.

---

**Tác giả**: Page Builder Team  
**Phiên bản**: 1.0.0  
**Ngày tạo**: 2024
# drag-drop-angular
