# Sử dụng Node.js bản nhẹ để tối ưu dung lượng
FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy các file quản lý thư viện trước để tận dụng cache
COPY package*.json ./

# Cài đặt tất cả library (bao gồm cả nodemon cho môi trường dev)
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Mở port ứng dụng (theo package.json của bạn)
EXPOSE 3000
# Mở port debug cho nodemon --inspect
EXPOSE 9229

# Lệnh mặc định (sẽ được override bởi docker-compose)
CMD ["npm", "start"]