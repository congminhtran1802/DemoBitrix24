# DemoBitrix24
# cài đặt thư viện
- npm i
# môi trường sử dụng
- node v22.6.0
# tài liệu tham khảo
- https://training.bitrix24.com/rest_help/users/user_get.php
# chạy dự án
- npm start
- truy cập http://localhost:3000/ để hiển thi danh sách nhân viên (user)

# PART 2
- test.js nhận sự kiện install/reinstall
- lưu accesstoken, refreshtoken vào file tokens.json
- contact.js api CRUD contact, refreshtoken
# chạy dự án
- npm start
- mở ngrok nhập " ngrok http 3000"
- mở link ngrok cung cấp và cài đặt vào bitrix24 thêm endpoint /test/install
- lưu để install hoặc reinstall
# tài liệu tham khảo
- https://training.bitrix24.com/rest_help/crm/contacts/index.php
- https://training.bitrix24.com/rest_help/oauth/refreshing.php
