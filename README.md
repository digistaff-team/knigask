# PublicLib Keeper

Приложение для автоматизации общественной библиотеки.

## Структура проекта
- `/` - Frontend (React + Vite)
- `/server` - Backend (Node.js + Express + MySQL)

## Локальный запуск (для разработки)

1. **База данных**
   Убедитесь, что MySQL запущен.
   ```bash
   mysql -u root -p < server/schema.sql
   ```

2. **Backend**
   ```bash
   cd server
   npm install
   # Создайте файл .env в папке server
   # DB_PASSWORD=ваш_пароль
   npm run dev
   ```
   Сервер запустится на порту 3001.

3. **Frontend**
   В корневой папке (в новом терминале):
   ```bash
   npm install
   npm run dev
   ```
   Приложение будет доступно по ссылке, указанной в терминале (обычно http://localhost:5173).

---

## Деплой на VPS (Ubuntu 20.04+)

Адрес сервера: **155.212.223.205**

### 1. Установка компонентов
```bash
sudo apt update
sudo apt install nodejs npm mysql-server nginx git
```

### 2. Настройка MySQL
```sql
sudo mysql
-- Внутри MySQL консоли:
CREATE USER 'lib_user'@'localhost' IDENTIFIED BY 'radostnochitat';
GRANT ALL PRIVILEGES ON *.* TO 'lib_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Импорт структуры БД:
```bash
mysql -u lib_user -p < server/schema.sql
```

### 3. Настройка Backend
Скопируйте файлы на сервер в `/var/www/library`.
```bash
cd /var/www/library/server
npm install --production
```

**ВАЖНО:** Создайте файл `.env` для переменных окружения:
`nano .env`
Вставьте туда:
```
DB_HOST=localhost
DB_USER=lib_user
DB_PASSWORD=radostnochitat
DB_NAME=library_db
```

Запуск сервера:
```bash
sudo npm install -g pm2
pm2 start server.js --name "library-api"
```

### 4. Сборка Frontend
```bash
cd /var/www/library
npm install
npm run build
```
Это создаст папку `dist` с готовым сайтом.

### 5. Настройка Nginx (Reverse Proxy)
Это критически важный шаг для работы API запросов.

Создайте конфиг:
`sudo nano /etc/nginx/sites-available/library`

```nginx
server {
    listen 80;
    server_name 155.212.223.205; # Или ваше доменное имя

    root /var/www/library/dist;
    index index.html;

    # Frontend Routing (для SPA приложений React)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy (перенаправление запросов на Backend)
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфиг и перезагрузите Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/library /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Теперь приложение доступно по адресу: http://155.212.223.205
