# Hướng dẫn cấu hình Nginx cho upload video

Nếu bạn đang sử dụng Nginx làm reverse proxy cho backend, bạn cần cấu hình `client_max_body_size` để cho phép upload file lớn.

## Cấu hình Nginx

Thêm hoặc sửa dòng sau trong file cấu hình Nginx của bạn (thường là `/etc/nginx/sites-available/your-site` hoặc trong block `server`):

```nginx
server {
    # ... các cấu hình khác ...
    
    # Tăng giới hạn upload lên 100MB (hoặc lớn hơn nếu cần)
    client_max_body_size 100M;
    
    # ... các cấu hình khác ...
    
    location /api {
        proxy_pass http://localhost:5000;  # Thay đổi port nếu cần
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Tăng timeout cho upload file lớn
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

## Sau khi sửa cấu hình

1. Kiểm tra cấu hình Nginx:
   ```bash
   sudo nginx -t
   ```

2. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   # hoặc
   sudo service nginx reload
   ```

## Lưu ý

- `client_max_body_size` mặc định của Nginx là 1MB
- Nếu không cấu hình, bạn sẽ gặp lỗi 413 (Request Entity Too Large) khi upload file lớn hơn 1MB
- Multer đã được cấu hình limit 50MB trong code, nhưng Nginx sẽ chặn trước khi request đến được backend
