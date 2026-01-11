# Kim Cương Xếp Hình

Trò chơi xếp hình kim cương chạy trên Canvas 2D. Nhấp để đặt viên kim cương lên lưới, tạo 3 viên cùng màu liên tiếp (ngang, dọc, hoặc chéo) để thắng.

## Chạy cục bộ

### Cách 1: Dùng Python

```bash
python3 -m http.server 5173
```

Mở trình duyệt tại `http://localhost:5173`.

### Cách 2: Dùng Node

```bash
npx serve .
```

## Điều khiển

- Chuột: chọn ô và đặt viên kim cương.
- Phím `1/2/3`: chọn màu kế tiếp.
- Phím `R`: chơi lại.

## Cấu trúc thư mục

```
assets/        # sprite/texture dạng SVG
src/main.js    # điểm vào game
index.html     # giao diện chính
```
