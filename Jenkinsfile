pipeline {
    agent any 

    environment {
        // Tên image của bạn (có thể đổi tùy ý)
        DOCKER_IMAGE = "nguyentandat/doan-iot-backend"
    }

    stages {
        stage('1. Chốt Code (Checkout)') {
            steps {
                // Lấy code mới nhất từ GitHub
                checkout scm
            }
        }

        stage('2. Build Image') {
            steps {
                script {
                    echo "Đang build lại Image cho dự án..."
                    // Lệnh này tương đương với việc đóng gói toàn bộ code + thư viện
                    sh "docker build -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('3. Triển khai (Deploy)') {
            steps {
                script {
                    echo "Đang khởi chạy môi trường Production..."
                    // Đây chính là 'lệnh số 2' (Môi trường Prod) mà bạn cần
                    // -d để chạy ngầm, --force-recreate để chắc chắn dùng bản code mới nhất
                    sh "docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate"
                }
            }
        }

        stage('4. Dọn dẹp (Cleanup)') {
            steps {
                // Xóa các image cũ không dùng đến để đỡ chật ổ cứng server
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "Chúc mừng Đạt! Hệ thống IoT đã được deploy thành công lên Server."
        }
        failure {
            echo "Có lỗi xảy ra rồi, kiểm tra lại log trong Jenkins nhé!"
        }
    }
}